import { useAuth } from '../auth/AuthContext';
import { ResumeAccueil } from '../components/home/ResumeAccueil';
import { useResumeAccueil } from '../hooks/useResumeAccueil';

export function HomePage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useResumeAccueil({ enabled: !!user });

  return (
    <div className="page">
      <h1>MonASOCFoot</h1>
      <p>AS Orange Cesson Football — gestion des disponibilités des joueurs pour les activités du club.</p>

      {user ? (
        <>
          <p>Connecté en tant que {user.displayName} ({user.role}).</p>
          {isLoading && <p>Chargement de votre résumé…</p>}
          {isError && <p>Impossible de charger votre résumé.</p>}
          {data && !isLoading && !isError && <ResumeAccueil resume={data} />}
        </>
      ) : (
        <p>Connectez-vous pour déclarer vos disponibilités.</p>
      )}
    </div>
  );
}
