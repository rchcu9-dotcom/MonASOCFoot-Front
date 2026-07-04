import type { JoueurEffectifMatchDto } from '../../api/disponibilites';
import { DisponibiliteBadge } from './DisponibiliteBadge';
import { PourcentageBadge } from './PourcentageBadge';

interface Props {
  joueur: JoueurEffectifMatchDto;
}

/** Carte horizontale pleine largeur d'un joueur : nom + badge de taux + statut pour le match affiché. */
export function EffectifJoueurCarte({ joueur }: Props) {
  return (
    <div className="effectif-joueur-carte">
      <span className="effectif-joueur-carte__nom">{joueur.displayName}</span>
      <PourcentageBadge pourcentage={joueur.pourcentageMatchsAVenirRenseignes} />
      <DisponibiliteBadge disponibilite={joueur.disponibiliteMatchCourant} />
    </div>
  );
}
