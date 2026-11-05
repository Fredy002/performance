import { AI_MODULES, MODULE_FIELDS, normalizeAIAnalysis, type AIAnalysis, type AIField, type AIModule } from './aeroAnalysis';
import { IMAGE_MEDIA_TYPES, MAX_IMAGE_BYTES } from './statementAnalysis';
import { prepareImage, toBase64, type OcrProgress } from './ocr';
import { parseStatement } from '@/exercises/parseStatement';
import { findScenarioReference } from './aiReferences';
import { localizeServiceMessage } from '@/i18n/messages/services';
import type { Locale } from '@/i18n/types';
export interface ExerciseAnalysisInput { text?: string; image?: Blob; context?: AIModule }
const cache = new Map<string,AIAnalysis>();
const inflight = new Map<string,Promise<AIAnalysis>>();
const say=(locale:Locale,es:string,en:string)=>locale==='en'?en:es;
const clone=(v:AIAnalysis):AIAnalysis=>structuredClone(v);
function field(key:string,value:string,unit:string,evidence:string):AIField{return {key,value,unit,source:'statement',evidence,verified:false};}
const unitAliases: Record<string,string> = {nm:'nm',km:'km',ft:'ft',m:'m',kt:'kt',kts:'kt','km/h':'kmh',kmh:'kmh',lb:'lb',lbs:'lb',kg:'kg',hpa:'hpa',inhg:'inhg',c:'c','°c':'c',f:'f','°f':'f',fl:'fl'};
const quantities:Record<string,string[]>={altitude:['ft','m','fl'],distance:['nm','km','sm'],speed:['kt','kmh','ms','mph','fpm'],mass:['kg','lb','t'],pressure:['hpa','inhg','mmhg','psi'],temperature:['c','f','k'],volume:['l','usg','ig']};
/** Conservative offline path: exact conversions, named table coordinates and existing fuel parser.
 * Complex natural language and multi-step exercises use the single structured provider call. */
export function parseExerciseText(text:string): AIAnalysis | undefined {
  const trimmed=text.trim();if(!trimmed||trimmed.length>20000)return undefined;
  const conversion=trimmed.match(/^(?:(?:convierte|convertir|convert|convierta)\s+)?([+-]?\d+(?:[.,]\d+)?)\s*(NM|km|ft|m|kt|kts|km\/h|kmh|lbs?|kg|hPa|inHg|°?C|°?F|FL)\s+(?:a|to|en|in|→|->)\s*(NM|km|ft|m|kt|kts|km\/h|kmh|lbs?|kg|hPa|inHg|°?C|°?F|FL)[?.\s]*$/i);
  if(conversion){const u=unitAliases[conversion[2].toLowerCase()],to=unitAliases[conversion[3].toLowerCase()];const q=Object.entries(quantities).find(([,units])=>units.includes(u)&&units.includes(to))?.[0];if(!q)return undefined;return {text,steps:[{id:'step-1',module:'units',dependsOn:[],bindings:[],fields:[field('q',q,'',conversion[0]),field('v',conversion[1],conversion[2],conversion[0]),field('u',u,'',conversion[2]),field('to',to,'',conversion[3])]}],warnings:[],unsupported:[]};}
  // Explicit key=value input keeps the spelling and precision of the original numerical strings.
  const candidates:AIModule[]=[];
  if(/\bEPR\b/i.test(text))candidates.push('takeoff-epr');
  if(/ascenso|en.route.climb|\bclimb\b/i.test(text))candidates.push('en-route-climb');
  if(/biline|interpolaci[oó]n doble|two.variable/i.test(text))candidates.push('bilinear');
  else if(/interpol|\ba1\s*=/i.test(text))candidates.push('linear');
  if(candidates.length===1){const module=candidates[0];const fields:AIField[]=[];for(const d of MODULE_FIELDS[module]){const re=new RegExp(`\\b${d.key}\\s*=\\s*([+-]?(?:\\d+(?:[.,]\\d+)?)|[a-zA-Z][a-zA-Z0-9+-]*)`,'gi');const matches=[...text.matchAll(re)];if(matches.length>1)return undefined;if(matches[0]){let value=matches[0][1];if(d.options){const choice=d.options.find(o=>o.toLowerCase()===value.toLowerCase());if(!choice)return undefined;value=choice;}fields.push(field(d.key,value,d.unit,matches[0][0]));}}
    if(module==='takeoff-epr'&&!fields.some(f=>f.key==='av')){const av=text.match(/\bB[ -]?(737|727)\b/i);if(av)fields.push(field('av',`b${av[1]}`,'',av[0]));}
    if(module==='en-route-climb'&&!fields.some(f=>f.key==='aircraft')){const av=text.match(/\bB[ -]?737\b/i);if(av)fields.push(field('aircraft','B737','',av[0]));}
    const required=MODULE_FIELDS[module].filter(d=>d.required);if(required.every(d=>fields.some(f=>f.key===d.key)))return normalizeAIAnalysis({text,steps:[{id:'step-1',module,dependsOn:[],bindings:[],fields}],warnings:[],unsupported:[]});
  }
  if(/(?:combustible|fuel|FOB)/i.test(text)&&/\bB[ -]?737\b/i.test(text)&&!/interpol|convierte|convertir|convert\b/i.test(text)){
    const p=parseStatement(text);if(p.aircraft!=='B737'||p.trip.distanceNm===undefined||p.alternate.distanceNm===undefined)return undefined;
    const values: Record<string,string|number|undefined>={aircraft:p.aircraft,dep:p.trip.from,dst:p.trip.to??p.alternate.from,alt:p.alternate.to,td:p.trip.distanceNm,tw:p.trip.windKt,tk:p.trip.windKind,tfl:p.trip.flightLevel,ad:p.alternate.distanceNm,aw:p.alternate.windKt,ak:p.alternate.windKind,afl:p.alternate.flightLevel,hw:p.holding.weightLb,hfl:p.holding.flightLevel,hm:p.holding.minutes,taxi:p.taxiFuelLb};
    const fields=Object.entries(values).filter(([,v])=>v!==undefined).map(([key,value])=>field(key,String(value),MODULE_FIELDS.fuel.find(d=>d.key===key)?.unit??'',text));
    return normalizeAIAnalysis({text,steps:[{id:'step-1',module:'fuel',dependsOn:[],bindings:[],fields}],warnings:[],unsupported:[]});
  }
  // «para condiciones V-5, figuras 56, 57 y 58»: los datos están en la tabla de condiciones digitalizada
  const reference=findScenarioReference(text);
  if(reference)return normalizeAIAnalysis({text,steps:[{id:'step-1',module:reference.module,dependsOn:[],bindings:[],fields:[]}],warnings:[],unsupported:[]});
  return undefined;
}

export async function analyzeExercise(input:ExerciseAnalysisInput,onProgress?:(p:OcrProgress)=>void,locale:Locale='es'):Promise<AIAnalysis>{
  const text=input.text?.trim();if(!text&&!input.image)throw new Error(say(locale,'Escribe un ejercicio o elige una imagen.','Type an exercise or choose an image.'));
  if(text&&text.length>20000)throw new Error(say(locale,'El enunciado supera 20 000 caracteres.','The exercise exceeds 20,000 characters.'));
  if(input.context&&!AI_MODULES.includes(input.context))throw new Error(say(locale,'Módulo no compatible.','Unsupported module.'));
  if(!input.image&&text){const local=parseExerciseText(text);if(local)return local;}
  let image: {data:string;mediaType:string}|undefined;
  if(input.image){const file=input.image;if(!(IMAGE_MEDIA_TYPES as readonly string[]).includes(file.type))throw new Error(localizeServiceMessage(locale,'Usa una imagen JPEG, PNG, GIF o WebP.'));if(!file.size)throw new Error(localizeServiceMessage(locale,'La imagen está vacía. Elige otra foto.'));if(file.size>25*1024*1024)throw new Error(localizeServiceMessage(locale,'La foto es demasiado grande. Usa una imagen de menos de 25 MB.'));
    onProgress?.({stage:'prepare',progress:.1,status:localizeServiceMessage(locale,'Preparando la imagen…')});const prepared=await prepareImage(file);if(prepared.size>MAX_IMAGE_BYTES)throw new Error(localizeServiceMessage(locale,'La imagen supera 5 MB después de prepararla. Recorta el enunciado y vuelve a intentarlo.'));image={data:await toBase64(prepared,locale),mediaType:prepared.type};}
  const payload={mode:'exercise',text,image,context:input.context};
  // SHA-256 prevents retaining a second full image copy in cache keys. Cache is memory-only.
  const serialized=JSON.stringify(payload);const digest=globalThis.crypto?.subtle?Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(serialized)))).map(v=>v.toString(16).padStart(2,'0')).join(''):undefined;
  const key=digest?`${locale}:${digest}`:undefined;
  if(key&&cache.has(key))return clone(cache.get(key)!);
  if(key&&inflight.has(key))return clone(await inflight.get(key)!);
  onProgress?.({stage:'analyze',progress:.35,status:localizeServiceMessage(locale,'Claude está interpretando el enunciado…')});
  const request=async():Promise<AIAnalysis>=>{
    for(let attempt=0;attempt<2;attempt++){
      let response:Response;try{response=await fetch(import.meta.env.VITE_STATEMENT_API_URL?.trim()||'/api/analyze-statement',{method:'POST',headers:{'Content-Type':'application/json','Accept-Language':locale},body:serialized,signal:AbortSignal.timeout(65000)});}catch(error){throw new Error(localizeServiceMessage(locale,error instanceof Error&&(error.name==='TimeoutError'||error.name==='AbortError')?'Claude tardó demasiado en responder. Vuelve a intentarlo.':'No se pudo conectar con el análisis de Claude. Revisa la conexión y que el servidor esté en marcha.'));}
      const body:unknown=await response.json().catch(()=>undefined);
      // Only retry explicit transient upstream gateway errors once; never retry credentials/rate limits.
      if(!response.ok){if(response.status===502&&attempt===0)continue;const message=body&&typeof body==='object'&&'error'in body&&typeof body.error==='string'?body.error:'El análisis de Claude no está disponible. Revisa la configuración del servidor.';throw new Error(localizeServiceMessage(locale,message));}
      let result:AIAnalysis;try{result=normalizeAIAnalysis(body);}catch{if(attempt===0)continue;throw new Error(localizeServiceMessage(locale,'Respuesta de análisis inválida.'));}
      if(key){cache.set(key,clone(result));while(cache.size>10)cache.delete(cache.keys().next().value!);}
      onProgress?.({stage:'analyze',progress:1,status:localizeServiceMessage(locale,'Enunciado interpretado por Claude.')});return result;
    }throw new Error(localizeServiceMessage(locale,'Respuesta de análisis inválida.'));
  };
  const promise=request();if(key)inflight.set(key,promise);try{return await promise;}finally{if(key)inflight.delete(key);}
}
