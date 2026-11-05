import { ArrowLeft, ArrowRight, BadgeCheck, Calculator, ExternalLink, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { Disclosure } from '@/components/ui/Disclosure';
import { InfoTip } from '@/components/ui/InfoTip';
import { PageHeader } from '@/components/ui/PageHeader';
import { useI18n } from '@/i18n';
import { MODULE_FIELDS, type AIField, type AIFieldDefinition, type AIStep } from '@/services/aeroAnalysis';
import { applyAIBindings, calculateAIStep } from '@/services/aiCalculation';
import { aiStepHref, aiToolHref, getAIImage, setAIStepResult, updateAIStepFields, useAISession } from '@/state/aiSession';
import { useDecimals } from '@/state/settings';
import { localizedToolName } from '@/tools/registry';
import { QUANTITIES } from '@/core/units';

const QUANTITY_LABEL: Record<string, { es: string; en: string }> = {
  altitude: { es: 'Altitud', en: 'Altitude' },
  distance: { es: 'Distancia', en: 'Distance' },
  speed: { es: 'Velocidad', en: 'Speed' },
  mass: { es: 'Masa', en: 'Mass' },
  pressure: { es: 'Presión', en: 'Pressure' },
  temperature: { es: 'Temperatura', en: 'Temperature' },
  volume: { es: 'Volumen', en: 'Volume' },
};

/** Texto legible de una opción (el valor interno se conserva): b737 → Boeing 737, ISA10 → ISA +10 °C, nm → NM. */
function optionLabel(key: string, value: string, locale: 'es' | 'en'): string {
  const es = locale === 'es';
  if (key === 'av') return value === 'b737' ? 'Boeing 737' : value === 'b727' ? 'Boeing 727' : value;
  if (key === 't') return value === 'ISA10' ? 'ISA +10 °C' : 'ISA';
  if (['ac', 'ai', 'b6'].includes(key)) return value.toUpperCase();
  if (['tk', 'ak', 'wk'].includes(key)) return value === 'HW' ? (es ? 'Cara (HW)' : 'Headwind (HW)') : es ? 'Cola (TW)' : 'Tailwind (TW)';
  if (key === 'qu') return value === 'mb' ? 'mb' : 'in.Hg (")';
  if (key === 'tu') return value === 'C' ? '°C' : '°F';
  if (key === 'q') return QUANTITY_LABEL[value]?.[locale] ?? value;
  if (key === 'u' || key === 'to') return QUANTITIES.flatMap((q) => q.units).find((u) => u.id === value)?.symbol ?? value;
  return value;
}

type FieldStatus = 'statement' | 'reference' | 'uncertain' | 'assumed' | 'missing' | 'user' | 'bound' | 'optional';

const STATUS_CLASS: Record<FieldStatus, string> = {
  statement: 'status-match',
  reference: 'status-match',
  uncertain: 'status-rounding',
  assumed: 'status-rounding',
  missing: 'status-mismatch',
  user: 'status-user',
  bound: 'status-neutral',
  optional: 'status-neutral',
};

/** Campos numéricos con unidad: la unidad se confirma explícitamente (nunca se supone). */
const unitFor = (step: AIStep, def: AIFieldDefinition): string | undefined => {
  if (def.options || ['dep', 'dst', 'alt'].includes(def.key) && step.module === 'fuel') return undefined;
  if (step.module === 'takeoff-epr' && def.key === 'qnh') return step.fields.find((f) => f.key === 'qu')?.value || 'inHg / mb';
  if (step.module === 'takeoff-epr' && def.key === 'oat') return step.fields.find((f) => f.key === 'tu')?.value || 'C / F';
  if (step.module === 'units' && def.key === 'v') return step.fields.find((f) => f.key === 'u')?.value || '';
  return def.unit || undefined;
};

const isRequired = (step: AIStep, def: AIFieldDefinition) =>
  def.required || (step.module === 'takeoff-epr' && def.key === 'b6' && step.fields.some((f) => f.key === 'av' && f.value === 'b727'));

/**
 * Pantalla de revisión y resolución de un paso del asistente. Los valores detectados son
 * propuestas editables; el cálculo lo hacen siempre los motores deterministas de AeroPerf.
 */
export function AIReview({ sessionId, stepId }: { sessionId: string; stepId: string | null }) {
  const { locale, t } = useI18n();
  const decimals = useDecimals();
  const navigate = useNavigate();
  const session = useAISession(sessionId);
  const index = session ? Math.max(0, session.steps.findIndex((s) => s.id === stepId)) : 0;
  const step = session?.steps[index];
  const [draft, setDraft] = useState<AIField[]>(step?.fields ?? []);
  const [error, setError] = useState<string>();
  const image = getAIImage(sessionId);
  const imageUrl = useMemo(() => (image ? URL.createObjectURL(image) : undefined), [image]);
  useEffect(() => () => { if (imageUrl) URL.revokeObjectURL(imageUrl); }, [imageUrl]);

  // al cambiar de paso, cargar sus datos guardados
  useEffect(() => {
    setDraft(step?.fields ?? []);
    setError(undefined);
  }, [step?.id, session?.updatedAt === undefined]);

  if (!session || !step) {
    return (
      <div className="card empty empty-page">
        <Sparkles size={40} aria-hidden="true" />
        <h1 className="empty-page-title">{t('ai.review.notFound')}</h1>
        <Link to="/" className="btn btn-primary">
          {t('ai.review.newExercise')}
        </Link>
      </div>
    );
  }

  const moduleName = (id: string) => localizedToolName(id, locale);
  const result = session.results[step.id];
  const bound = new Map((step.bindings ?? []).map((b) => [b.key, b]));
  const pendingDependency = step.dependsOn.find((id) => !session.results[id]);
  const defs = MODULE_FIELDS[step.module];
  const fieldOf = (key: string) => draft.find((f) => f.key === key);

  const statusOf = (def: AIFieldDefinition): FieldStatus => {
    if (bound.has(def.key)) return 'bound';
    const f = fieldOf(def.key);
    if (!f?.value) return isRequired(step, def) ? 'missing' : 'optional';
    if (f.source === 'user') return 'user';
    if (f.source === 'reference') return 'reference';
    if (f.source === 'uncertain') return 'uncertain';
    return f.source === 'assumed' ? 'assumed' : 'statement';
  };
  const missing = defs.filter((d) => statusOf(d) === 'missing');
  const assumed = defs.some((d) => statusOf(d) === 'assumed');
  const uncertain = defs.some((d) => statusOf(d) === 'uncertain');

  const edit = (key: string, patch: Partial<Pick<AIField, 'value' | 'unit'>>) => {
    setError(undefined);
    setDraft((prev) => {
      const current = prev.find((f) => f.key === key) ?? { key, value: '', unit: '', source: 'user' as const, evidence: '', verified: false };
      const next: AIField = { ...current, ...patch, source: 'user', verified: true };
      return prev.some((f) => f.key === key) ? prev.map((f) => (f.key === key ? next : f)) : [...prev, next];
    });
  };

  // confirmar = validar con el motor de la app, guardar en la sesión y abrir la calculadora real
  const calculate = () => {
    try {
      updateAIStepFields(session.id, step.id, draft);
      const calc = calculateAIStep(applyAIBindings({ ...step, fields: draft }, session.results), locale, decimals);
      const href = setAIStepResult(session.id, step.id, calc);
      setError(undefined);
      if (href) navigate(href);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  };

  const prev = session.steps[index - 1];
  const next = session.steps[index + 1];

  return (
    <div className="ai-review">
      <PageHeader
        eyebrow={
          <>
            <Sparkles size={14} aria-hidden="true" /> {t('ai.intake.title')} · {t('ai.review.stepOf', { n: index + 1, total: session.steps.length })}
          </>
        }
        title={t('ai.review.detected', { module: moduleName(step.module) })}
        subtitle={t('ai.review.intro')}
      />

      {session.steps.length > 1 && (
        <nav className="segmented ai-steps" aria-label={t('ai.review.steps')}>
          {session.steps.map((s, i) => (
            <button key={s.id} aria-pressed={s.id === step.id} onClick={() => navigate(aiStepHref(session, s))}>
              {i + 1}. {moduleName(s.module)} {session.results[s.id] && <BadgeCheck size={14} aria-label="✓" />}
            </button>
          ))}
        </nav>
      )}

      <div className="grid grid-calc">
        <div className="stack">
          <Card title={t('ai.review.dataTitle')}>
            <p className="field-hint">{t('ai.review.legend')}</p>
            {pendingDependency && (
              <Alert kind="warning">
                {t('ai.review.dependency', { module: moduleName(session.steps.find((s) => s.id === pendingDependency)?.module ?? '') })}
              </Alert>
            )}
            <div className="ai-review-grid">
              {defs.map((def) => {
                const f = fieldOf(def.key);
                const status = statusOf(def);
                const label = def.label[locale];
                const unit = unitFor(step, def);
                const b = bound.get(def.key);
                return (
                  <div className="ai-field" key={def.key}>
                    <span className="field-label-row">
                      <label className="field-label" htmlFor={`ai-${step.id}-${def.key}`}>
                        {label}
                      </label>
                      {f?.evidence && f.source !== 'user' && (
                        <InfoTip label={`${t('ai.review.evidence')}: ${label}`}>{t('ai.review.evidenceText', { text: f.evidence })}</InfoTip>
                      )}
                    </span>
                    {b ? (
                      <input
                        id={`ai-${step.id}-${def.key}`}
                        readOnly
                        value={t('ai.review.boundFrom', { output: b.output, module: moduleName(session.steps.find((s) => s.id === b.stepId)?.module ?? '') })}
                      />
                    ) : def.options ? (
                      <select id={`ai-${step.id}-${def.key}`} value={f?.value ?? ''} onChange={(e) => edit(def.key, { value: e.target.value })}>
                        <option value="">{t('ai.review.empty')}</option>
                        {def.options.map((o) => (
                          <option key={o} value={o}>
                            {optionLabel(def.key, o, locale)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className={unit !== undefined ? 'ai-value-row' : undefined}>
                        <input
                          id={`ai-${step.id}-${def.key}`}
                          value={f?.value ?? ''}
                          inputMode={['dep', 'dst', 'alt', 'aircraft'].includes(def.key) ? 'text' : 'decimal'}
                          aria-invalid={status === 'missing' || undefined}
                          onChange={(e) => edit(def.key, { value: e.target.value })}
                        />
                        {unit !== undefined && (
                          <input
                            aria-label={t('ai.review.unit', { field: label })}
                            className="ai-unit"
                            value={f?.unit ?? ''}
                            placeholder={unit}
                            onChange={(e) => edit(def.key, { unit: e.target.value })}
                          />
                        )}
                      </div>
                    )}
                    <span className={`status ${STATUS_CLASS[status]}`}>{t(`ai.review.status.${status}`)}</span>
                    {/* solo cuando hace falta: unidad vacía o distinta de la que usa la calculadora */}
                    {unit && !b && (f?.unit ?? '').trim().toLowerCase() !== unit.toLowerCase() && <small>{t('ai.review.unitExpected', { unit })}</small>}
                  </div>
                );
              })}
            </div>
            {session.analysis.warnings.length > 0 && (
              <Alert kind="warning">
                <b>{t('ai.review.warnings')}:</b>
                <ul className="ai-warnings">
                  {session.analysis.warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </Alert>
            )}
            {missing.length > 0 ? (
              <Alert kind="info">{t('ai.review.blocked')}</Alert>
            ) : uncertain ? (
              <Alert kind="warning">{t('ai.review.uncertainNote')}</Alert>
            ) : (
              assumed && <Alert kind="warning">{t('ai.review.assumedNote')}</Alert>
            )}
            {error && <Alert kind="error">{error}</Alert>}
            <div className="row calc-section-sm">
              <button className="btn btn-primary" onClick={calculate} disabled={missing.length > 0 || !!pendingDependency}>
                <Calculator size={16} aria-hidden="true" /> {result ? t('ai.review.recalculate') : t('ai.review.calculate')}
              </button>
            </div>
          </Card>

          <Disclosure title={t('ai.review.original')} defaultOpen={!result}>
            <pre className="ai-statement">{session.text}</pre>
            {imageUrl ? (
              <figure className="ai-image-preview">
                <img src={imageUrl} alt={t('ai.review.image')} />
              </figure>
            ) : (
              session.hadImage && <p className="field-hint">{t('ai.review.imageNotKept')}</p>
            )}
          </Disclosure>
          {session.analysis.unsupported.length > 0 && (
            <Alert kind="warning">
              <b>{t('ai.review.unsupported')}:</b> {session.analysis.unsupported.join(' ')}
            </Alert>
          )}
        </div>

        <div className="stack">
          {result ? (
            <Card title={t('ai.review.result')}>
              <div className="ai-result" aria-live="polite">
                <div className="ai-result-summary">{result.summary}</div>
                <p className="field-hint">
                  <BadgeCheck size={14} aria-hidden="true" /> {t('ai.review.verified')}
                </p>
              </div>
              <div className="row calc-section-sm">
                <button className="btn btn-primary" onClick={() => navigate(aiToolHref(session, step, result.values))}>
                  <ExternalLink size={16} aria-hidden="true" /> {t('ai.review.viewTool', { module: moduleName(step.module) })}
                </button>
              </div>
            </Card>
          ) : (
            <Card title={t('ai.review.result')}>
              <div className="empty">
                <Calculator size={32} aria-hidden="true" />
                <span>{missing.length ? t('ai.review.blocked') : t('ai.review.ready', { module: moduleName(step.module) })}</span>
              </div>
            </Card>
          )}
          {session.status === 'solved' && <Alert kind="info">{t('ai.review.solved')}</Alert>}
          <div className="row">
            {prev && (
              <button className="btn" onClick={() => navigate(aiStepHref(session, prev))}>
                <ArrowLeft size={16} aria-hidden="true" /> {t('ai.review.previous')}
              </button>
            )}
            {next && (
              <button className="btn btn-primary" onClick={() => navigate(aiStepHref(session, next))} disabled={!result}>
                {t('ai.review.next', { module: moduleName(next.module) })} <ArrowRight size={16} aria-hidden="true" />
              </button>
            )}
            <Link to="/" className="btn btn-ghost">
              {t('ai.review.newExercise')}
            </Link>
          </div>
          <p className="ai-education">{t('ai.intake.educational')}</p>
        </div>
      </div>
    </div>
  );
}
