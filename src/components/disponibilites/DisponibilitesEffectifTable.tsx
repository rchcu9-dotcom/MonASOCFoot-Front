import type { ActiviteColonneDto, LigneJoueurDto } from '../../api/disponibilites';
import { DisponibiliteBadge } from './DisponibiliteBadge';

interface Props {
  activites: ActiviteColonneDto[];
  joueurs: LigneJoueurDto[];
}

/** Tableau en lecture seule : joueurs en lignes, activités en colonnes. Aucune action de modification. */
export function DisponibilitesEffectifTable({ activites, joueurs }: Props) {
  if (activites.length === 0) {
    return <p>Aucune activité à venir pour le filtre sélectionné.</p>;
  }

  return (
    <table className="disponibilites-effectif-table">
      <thead>
        <tr>
          <th scope="col">Joueur</th>
          {activites.map((activite) => (
            <th scope="col" key={activite.id}>
              {activite.label}
              <br />
              <small>{activite.date}</small>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {joueurs.map((joueur) => (
          <tr key={joueur.utilisateurId}>
            <th scope="row">{joueur.displayName}</th>
            {activites.map((activite) => (
              <td key={activite.id}>
                <DisponibiliteBadge disponibilite={joueur.disponibilites[activite.id]} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
