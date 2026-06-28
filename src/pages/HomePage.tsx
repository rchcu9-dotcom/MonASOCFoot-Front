import { useAuth } from '../auth/AuthContext';
import { ProchainesActivites } from '../components/home/ProchainesActivites';
import { useActivites } from '../hooks/useActivites';

export function HomePage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useActivites({ enabled: !!user });

  return (
    <div className="page">
      <h1>MonASOCFoot</h1>
      <p>AS Orange Cesson Football — gestion des disponibilités des joueurs pour les activités du club.</p>

      {user ? (
        <>
          <p>Connecté en tant que {user.displayName} ({user.role}).</p>
          {isLoading && <p>Chargement des activités…</p>}
          {isError && <p>Impossible de charger les activités.</p>}
          {data && !isLoading && !isError && <ProchainesActivites activites={data} />}
        </>
      ) : (
        <p>Connectez-vous pour déclarer vos disponibilités.</p>
      )}
    </div>
  );
}
