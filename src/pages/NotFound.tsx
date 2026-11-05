import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="card empty empty-page">
      <Compass size={40} />
      <h1 className="empty-page-title">{t('page.notFound.title')}</h1>
      <p>{t('page.notFound.body')}</p>
      <Link to="/" className="btn btn-primary">
        {t('page.notFound.backHome')}
      </Link>
    </div>
  );
}
