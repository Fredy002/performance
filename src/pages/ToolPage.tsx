import { Construction } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { getTool, localizedToolName } from '@/tools/registry';
import NotFound from './NotFound';

export default function ToolPage() {
  const { locale, t } = useI18n();
  const { toolId = '' } = useParams();
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
  const Component = tool.component;
  // la key fuerza un estado limpio al pasar entre herramientas
  return <Component key={tool.id} />;
}
