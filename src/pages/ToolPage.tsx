import { Construction } from 'lucide-react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { AIIntake } from '@/components/ai/AIIntake';
import { AIReview } from '@/components/ai/AIReview';
import { AIToolBanner } from '@/components/ai/AIToolBanner';
import { AI_MODULES, type AIModule } from '@/services/aeroAnalysis';
import { aiStepHref, getAISession } from '@/state/aiSession';
import { useI18n } from '@/i18n';
import { getTool, localizedToolName } from '@/tools/registry';
import NotFound from './NotFound';

export default function ToolPage() {
  const { locale, t } = useI18n();
  const { toolId = '' } = useParams();
  const [params] = useSearchParams();
  const tool = getTool(toolId);
  if (!tool) return <NotFound />;
  if (tool.status !== 'ready' || !tool.component) {
    return (
      <div className="card empty empty-page">
        <Construction size={40} />
        <h1 className="empty-page-title">{locale === 'es' ? tool.name : localizedToolName(tool.id, locale)}</h1>
        <p>{t('page.tool.inDevelopment')}</p>
        <Link to="/" className="btn">
          {t('common.backHome')}
        </Link>
      </div>
    );
  }
  // ejercicio del asistente: revisión y resolución del paso, con la ruta del registro (nunca del modelo)
  const aiId = params.get('aiReview');
  if (aiId) {
    const session = getAISession(aiId);
    const step = session?.steps.find((s) => s.id === params.get('step')) ?? session?.steps[0];
    if (session && step && step.module !== tool.id) return <Navigate to={aiStepHref(session, step)} replace />;
    return <AIReview key={`${aiId}-${step?.id}`} sessionId={aiId} stepId={step?.id ?? null} />;
  }
  const Component = tool.component;
  // el mismo asistente central en cada módulo compatible, con el módulo actual como pista
  const aiContext = (AI_MODULES as readonly string[]).includes(tool.id) ? (tool.id as AIModule) : undefined;
  // calculadora real con los datos de un ejercicio del asistente: barra para volver o seguir
  const fromId = params.get('from');
  const fromSession = fromId ? getAISession(fromId) : undefined;
  // la key fuerza un estado limpio al pasar entre herramientas (y entre pasos de un ejercicio)
  return (
    <>
      {fromSession ? (
        <AIToolBanner sessionId={fromSession.id} stepId={params.get('step')} />
      ) : (
        aiContext && <AIIntake compact context={aiContext} key={`ai-${tool.id}`} />
      )}
      <Component key={`${tool.id}-${fromId ?? ''}-${params.get('step') ?? ''}`} />
    </>
  );
}
