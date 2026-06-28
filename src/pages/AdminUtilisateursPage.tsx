import { useState } from 'react';
import type { RoleUtilisateur } from '../api/users';
import { UtilisateursTable } from '../components/utilisateurs/UtilisateursTable';
import { useAuth } from '../auth/AuthContext';
import { useUtilisateurs } from '../hooks/useUtilisateurs';
import { useModifierRoleUtilisateur } from '../hooks/useModifierRoleUtilisateur';

/** Page admin de gestion des utilisateurs : liste + changement de rôle par ligne. */
export function AdminUtilisateursPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useUtilisateurs();
  const modifierRole = useModifierRoleUtilisateur();

  const [erreur, setErreur] = useState<string | null>(null);

  function handleChangeRole(id: string, role: RoleUtilisateur) {
    setErreur(null);
    modifierRole.mutate(
      { id, role },
      {
        onError: (err) => setErreur(err.message),
      },
    );
  }

  return (
    <div className="page">
      <h1>Gestion des utilisateurs</h1>

      {erreur && <p className="page__erreur">{erreur}</p>}

      {isLoading && <p>Chargement des utilisateurs…</p>}
      {isError && <p>Impossible de charger les utilisateurs.</p>}

      {data && !isLoading && !isError && (
        <UtilisateursTable
          utilisateurs={data}
          idUtilisateurConnecte={user?.id}
          idEnCours={modifierRole.isPending ? modifierRole.variables?.id : undefined}
          onChangeRole={handleChangeRole}
        />
      )}
    </div>
  );
}
