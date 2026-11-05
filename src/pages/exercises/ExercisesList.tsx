import { ArrowRight, BadgeCheck, ClipboardCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { getExerciseDisplay, pendingExercises, verifiedExercises } from '@/exercises/registry';
import { exerciseToolHref, exerciseToolName } from './exerciseLinks';
import { useI18n } from '@/i18n';

export default function ExercisesList() {
  const { t, locale } = useI18n();
  const pending = pendingExercises();
  const verified = verifiedExercises();
  return (
    <>
      <PageHeader
        eyebrow={<><ClipboardCheck size={14} /> {t('exercise.list.eyebrow')}</>}
        title={t('exercise.list.title')}
        subtitle={t('exercise.list.subtitle')}
      />

      <h2 className="section-title section-title-flush">
        {t('exercise.list.pending')}
      </h2>
      {pending.length === 0 ? (
        <Card>
          <div className="empty">
            <ClipboardCheck size={32} />
            {t('exercise.list.empty')}
          </div>
        </Card>
      ) : (
        <div className="grid grid-3">
          {pending.map((e) => {
            const display = getExerciseDisplay(e, locale);
            return (
              <Link key={e.id} to={`/pruebas/${e.id}`} className="card tool-card">
                <span className="tool-card-icon tone-blush">
                  <ClipboardCheck size={20} />
                </span>
                <div className="tool-card-body">
                  <div className="chip chip-accent">{display.scopeLabel}</div>
                  <h3>{display.title}</h3>
                  <p>{display.summary}</p>
                </div>
                <div className="tool-card-footer">
                  <span className="chip">{e.aircraft}</span>
                  <span className="tool-card-cta">
                    {t('exercise.list.open')} <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {verified.length > 0 && (
        <>
          <h2 className="section-title">{t('exercise.list.verified')}</h2>
          <Card flush>
            <div className="list">
              {verified.map((e) => {
                const display = getExerciseDisplay(e, locale);
                return (
                  <Link key={e.id} to={exerciseToolHref(e)} className="list-item">
                    <span className="list-item-icon is-success">
                      <BadgeCheck size={18} />
                    </span>
                    <div className="list-item-main">
                      <div className="list-item-title">{display.title}</div>
                      <div className="list-item-sub">
                        {display.scopeLabel} · {t('exercise.list.availableIn')} {exerciseToolName(e, locale)}
                      </div>
                    </div>
                    <ArrowRight size={16} className="list-item-arrow" aria-hidden="true" />
                  </Link>
                );
              })}
            </div>
          </Card>
        </>
      )}
    </>
  );
}
