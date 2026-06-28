import type { ActiviteDto } from '../../api/activites';

interface Props {
  activites: ActiviteDto[];
  onEdit: (activite: ActiviteDto) => void;
  onDelete: (id: string) => void;
}

/** Tableau des activités, trié par date, avec actions Modifier/Supprimer par ligne. */
export function ActivitesList({ activites, onEdit, onDelete }: Props) {
  if (activites.length === 0) {
    return <p>Aucune activité pour le moment.</p>;
  }

  const activitesTriees = [...activites].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <table className="activites-list">
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Convocation</th>
          <th scope="col">Début</th>
          <th scope="col">Label</th>
          <th scope="col">Type</th>
          <th scope="col">Commentaire</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {activitesTriees.map((activite) => (
          <tr key={activite.id}>
            <td>{activite.date}</td>
            <td>{activite.heureConvocation}</td>
            <td>{activite.heureDebut}</td>
            <td>{activite.label}</td>
            <td>{activite.type}</td>
            <td>{activite.commentaire ?? ''}</td>
            <td>
              <button type="button" onClick={() => onEdit(activite)}>
                Modifier
              </button>
              <button type="button" onClick={() => onDelete(activite.id)}>
                Supprimer
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
