import { ArrowRight, BadgeCheck, PencilLine, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { aiStepHref, useAISession } from '@/state/aiSession';
import { localizedToolName } from '@/tools/registry';

/**
 * Barra del asistente sobre la calculadora real cuando se llega desde «Confirmar y calcular»
 * (`?from=<sesión>&step=<paso>`): la calculadora es la normal, con los datos ya cargados, y la barra
 * solo permite volver a la revisión, seguir con el siguiente paso o empezar otro ejercicio.
 */
export function AIToolBanner({ sessionId, stepId }: { sessionId: string; stepId: string | null }) {
  const { locale, t } = useI18n();
  const session = useAISession(sessionId);
  if (!session) return null;
  const index = Math.max(0, session.steps.findIndex((s) => s.id === stepId));
  const step = session.steps[index];
  if (!step) return null;
  const next = session.steps[index + 1];
  const moduleName = (id: string) => localizedToolName(id, locale);
  return (
    <aside className="ai-banner" aria-label={t('ai.intake.title')}>
      <div className="ai-banner-text">
        <Sparkles size={16} aria-hidden="true" />
        <span>
          <b>{t('ai.banner.title')}</b>
          {session.steps.length > 1 && <> · {t('ai.review.stepOf', { n: index + 1, total: session.steps.length })}</>}
          <span className="ai-banner-hint">
            <BadgeCheck size={14} aria-hidden="true" /> {t('ai.banner.hint')}
          </span>
        </span>
      </div>
      <div className="row ai-banner-actions">
        <Link className="btn btn-sm" to={aiStepHref(session, step)}>
          <PencilLine size={14} aria-hidden="true" /> {t('ai.banner.review')}
        </Link>
        {next && (
          <Link className="btn btn-sm btn-primary" to={aiStepHref(session, next)}>
            {t('ai.review.next', { module: moduleName(next.module) })} <ArrowRight size={14} aria-hidden="true" />
          </Link>
        )}
        <Link className="btn btn-sm btn-ghost" to="/">
          {t('ai.review.newExercise')}
        </Link>
      </div>
    </aside>
  );
}
