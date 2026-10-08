import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import Dashboard from '@/pages/Dashboard';
import HistoryPage from '@/pages/History';
import NotFound from '@/pages/NotFound';
import SettingsPage from '@/pages/Settings';
import ToolPage from '@/pages/ToolPage';
import { useApplyTheme } from '@/state/settings';

export default function App() {
  useApplyTheme();
  return (
    // HashRouter: funciona en cualquier hosting estático (GitHub Pages, Netlify…) sin reglas de reescritura
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="tools/:toolId" element={<ToolPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
