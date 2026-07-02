import type { ActiviteColonneDto, EffectifMatchBadgeDto } from '../../api/disponibilites';
import { CategorieActivite } from './CategorieActivite';
import { EffectifMatchBadge } from './EffectifMatchBadge';

interface Props {
  matchCourant: ActiviteColonneDto;
  badge: EffectifMatchBadgeDto;
  peutReculer: boolean;
  peutAvancer: boolean;
  onPrecedent: () => void;
  onSuivant: () => void;
}

/** En-tête de navigation match par match : flèches précédent/suivant, label du match, badge de synthèse. */
export function EffectifMatchNavigation({
  matchCourant,
  badge,
  peutReculer,
  peutAvancer,
  onPrecedent,
  onSuivant,
}: Props) {
  return (
    <div className="effectif-match-navigation">
      <button
        type="button"
        className="effectif-match-navigation__fleche"
        onClick={onPrecedent}
        disabled={!peutReculer}
        aria-label="Match précédent"
      >
        ←
      </button>

      <div className="effectif-match-navigation__label">
        <CategorieActivite equipe={matchCourant.equipe} />
        <span className="effectif-match-navigation__titre">{matchCourant.label}</span>
        <span className="effectif-match-navigation__date">{matchCourant.date}</span>
        <EffectifMatchBadge badge={badge} />
      </div>

      <button
        type="button"
        className="effectif-match-navigation__fleche"
        onClick={onSuivant}
        disabled={!peutAvancer}
        aria-label="Match suivant"
      >
        →
      </button>
    </div>
  );
}
