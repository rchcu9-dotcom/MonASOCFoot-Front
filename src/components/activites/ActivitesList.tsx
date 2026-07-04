import type { ActiviteDto } from '../../api/activites';
import { ActiviteAdminCarte } from './ActiviteAdminCarte';

interface Props {
  activites: ActiviteDto[];
  onEdit: (activite: ActiviteDto) => void;
  onDelete: (id: string) => void;
}

/** Liste de cartes activité, triée par date, avec actions Modifier/Supprimer par carte. */
export function ActivitesList({ activites, onEdit, onDelete }: Props) {
  if (activites.length === 0) {
    return <p>Aucune activité pour le moment.</p>;
  }

  // Les activités sans date (chaîne vide en tri) remontent en tête de liste.
  const activitesTriees = [...activites].sort((a, b) =>
    (a.date ?? '').localeCompare(b.date ?? ''),
  );

  return (
    <div className="activites-cartes">
      {activitesTriees.map((activite) => (
        <ActiviteAdminCarte
          key={activite.id}
          activite={activite}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
