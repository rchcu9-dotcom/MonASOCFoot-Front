import type { JoueurEffectifMatchDto } from '../../api/disponibilites';
import { sortJoueursByDisponibilite } from '../../utils/disponibiliteSort';
import { EffectifJoueurCarte } from './EffectifJoueurCarte';

interface Props {
  joueurs: JoueurEffectifMatchDto[];
}

/** Liste de cartes joueur (une par joueur) : % de matchs à venir renseignés (global), statut pour le match affiché. */
export function EffectifJoueursTable({ joueurs }: Props) {
  const joueursTries = sortJoueursByDisponibilite(joueurs);

  if (joueursTries.length === 0) {
    return <p className="effectif-joueurs-cartes__vide">Aucun joueur.</p>;
  }

  return (
    <div className="effectif-joueurs-cartes">
      {joueursTries.map((joueur) => (
        <EffectifJoueurCarte key={joueur.utilisateurId} joueur={joueur} />
      ))}
    </div>
  );
}
