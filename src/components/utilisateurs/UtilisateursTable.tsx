import type { RoleUtilisateur, UtilisateurDto } from '../../api/users';

interface Props {
  utilisateurs: UtilisateurDto[];
  /** Id de l'admin actuellement connecté — son propre sélecteur de rôle est désactivé (défense en profondeur UX, l'enforcement réel est back). */
  idUtilisateurConnecte?: string;
  /** Id de l'utilisateur dont le rôle est en cours de modification — son sélecteur est désactivé pendant la mutation. */
  idEnCours?: string;
  onChangeRole: (id: string, role: RoleUtilisateur) => void;
}

/** Tableau des utilisateurs, trié par displayName, avec un sélecteur de rôle par ligne. */
export function UtilisateursTable({ utilisateurs, idUtilisateurConnecte, idEnCours, onChangeRole }: Props) {
  if (utilisateurs.length === 0) {
    return <p>Aucun utilisateur ne s'est encore connecté.</p>;
  }

  const utilisateursTries = [...utilisateurs].sort((a, b) =>
    a.displayName.localeCompare(b.displayName),
  );

  return (
    <table className="utilisateurs-table">
      <thead>
        <tr>
          <th scope="col">Email</th>
          <th scope="col">Nom affiché</th>
          <th scope="col">Rôle</th>
          <th scope="col">Dernière connexion</th>
        </tr>
      </thead>
      <tbody>
        {utilisateursTries.map((utilisateur) => (
          <tr key={utilisateur.id}>
            <td>{utilisateur.email ?? '—'}</td>
            <td>{utilisateur.displayName}</td>
            <td>
              <select
                aria-label={`Rôle de ${utilisateur.displayName}`}
                value={utilisateur.role}
                disabled={utilisateur.id === idUtilisateurConnecte || utilisateur.id === idEnCours}
                onChange={(event) => onChangeRole(utilisateur.id, event.target.value as RoleUtilisateur)}
              >
                <option value="joueur">Joueur</option>
                <option value="admin">Admin</option>
              </select>
            </td>
            <td>{utilisateur.derniereConnexion ?? 'jamais'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
