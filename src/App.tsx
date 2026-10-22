import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import Dashboard from '@/pages/Dashboard';
import HistoryPage from '@/pages/History';
import NotFound from '@/pages/NotFound';
import SettingsPage from '@/pages/Settings';
import ToolPage from '@/pages/ToolPage';
import ExerciseDetail from '@/pages/exercises/ExerciseDetail';
import ExercisesList from '@/pages/exercises/ExercisesList';
import TableDetail from '@/pages/tables/TableDetail';
import TablesLibrary from '@/pages/tables/TablesLibrary';
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
          <Route path="tables" element={<TablesLibrary />} />
          <Route path="tables/:tableId" element={<TableDetail />} />
          <Route path="pruebas" element={<ExercisesList />} />
          <Route path="pruebas/:exerciseId" element={<ExerciseDetail />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
