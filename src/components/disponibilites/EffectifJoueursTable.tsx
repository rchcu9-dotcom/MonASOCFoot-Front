import type { JoueurEffectifMatchDto } from '../../api/disponibilites';
import { DisponibiliteBadge } from './DisponibiliteBadge';

interface Props {
  joueurs: JoueurEffectifMatchDto[];
}

/** Une ligne par joueur : % de matchs à venir renseignés (global), statut pour le match affiché. */
export function EffectifJoueursTable({ joueurs }: Props) {
  return (
    <div className="table-scroll">
      <table className="effectif-joueurs-table">
        <thead>
          <tr>
            <th>Joueur</th>
            <th>% de matchs à venir renseignés</th>
            <th>Statut pour ce match</th>
          </tr>
        </thead>
        <tbody>
          {joueurs.map((joueur) => (
            <tr key={joueur.utilisateurId}>
              <td>{joueur.displayName}</td>
              <td>{joueur.pourcentageMatchsAVenirRenseignes}%</td>
              <td>
                <DisponibiliteBadge disponibilite={joueur.disponibiliteMatchCourant} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
