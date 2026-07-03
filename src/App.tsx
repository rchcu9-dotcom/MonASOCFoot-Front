import { Routes, Route } from 'react-router-dom';
import { LayoutRoot } from './components/layout/LayoutRoot';
import { RequireAdminRoute } from './components/layout/RequireAdminRoute';
import { RequireAuthRoute } from './components/layout/RequireAuthRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { DisponibilitesEffectifPage } from './pages/DisponibilitesEffectifPage';
import { MesDisponibilitesPage } from './pages/MesDisponibilitesPage';
import { AdminActivitesPage } from './pages/AdminActivitesPage';
import { AdminPlanificationActivitesPage } from './pages/AdminPlanificationActivitesPage';
import { AdminUtilisateursPage } from './pages/AdminUtilisateursPage';
import { ProfilPage } from './pages/ProfilPage';

export default function App() {
  return (
    <LayoutRoot>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/mes-disponibilites" element={<MesDisponibilitesPage />} />
        <Route path="/disponibilites/effectif" element={<DisponibilitesEffectifPage />} />
        <Route
          path="/admin/activites"
          element={
            <RequireAdminRoute>
              <AdminActivitesPage />
            </RequireAdminRoute>
          }
        />
        <Route
          path="/admin/activites/planification"
          element={
            <RequireAdminRoute>
              <AdminPlanificationActivitesPage />
            </RequireAdminRoute>
          }
        />
        <Route
          path="/admin/utilisateurs"
          element={
            <RequireAdminRoute>
              <AdminUtilisateursPage />
            </RequireAdminRoute>
          }
        />
        <Route
          path="/profil"
          element={
            <RequireAuthRoute>
              <ProfilPage />
            </RequireAuthRoute>
          }
        />
      </Routes>
    </LayoutRoot>
  );
}
