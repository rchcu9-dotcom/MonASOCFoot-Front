import { useState } from 'react';
import type { ActiviteColonneDto, EffectifMatchBadgeDto } from '../../api/disponibilites';
import { ChevronIcon } from '../icons/ChevronIcon';
import { CategorieActivite } from './CategorieActivite';
import { EffectifMatchBadge } from './EffectifMatchBadge';
import { EffectifMatchSelecteurModal } from './EffectifMatchSelecteurModal';

interface Props {
  matchCourant: ActiviteColonneDto;
  matchsAVenir: ActiviteColonneDto[];
  badge: EffectifMatchBadgeDto;
  peutReculer: boolean;
  peutAvancer: boolean;
  onPrecedent: () => void;
  onSuivant: () => void;
  onSelectionnerMatch: (matchId: string) => void;
}

/**
 * En-tête de navigation match par match : flèches précédent/suivant, label du match (cliquable,
 * ouvre une pop-up de sélection directe parmi tous les matchs à venir), badge de synthèse.
 */
export function EffectifMatchNavigation({
  matchCourant,
  matchsAVenir,
  badge,
  peutReculer,
  peutAvancer,
  onPrecedent,
  onSuivant,
  onSelectionnerMatch,
}: Props) {
  const [selecteurOuvert, setSelecteurOuvert] = useState(false);

  return (
    <div className="effectif-match-navigation">
      <button
        type="button"
        className="effectif-match-navigation__fleche"
        onClick={onPrecedent}
        disabled={!peutReculer}
        aria-label="Match précédent"
      >
        <ChevronIcon direction="left" />
      </button>

      <div className="effectif-match-navigation__label">
        <button
          type="button"
          className="effectif-match-navigation__label-trigger"
          onClick={() => setSelecteurOuvert(true)}
          aria-haspopup="dialog"
        >
          <CategorieActivite equipe={matchCourant.equipe} />
          <span className="effectif-match-navigation__titre">{matchCourant.label}</span>
          <span className="effectif-match-navigation__date">{matchCourant.date}</span>
        </button>
        <EffectifMatchBadge badge={badge} />
      </div>

      <button
        type="button"
        className="effectif-match-navigation__fleche"
        onClick={onSuivant}
        disabled={!peutAvancer}
        aria-label="Match suivant"
      >
        <ChevronIcon direction="right" />
      </button>

      {selecteurOuvert && (
        <EffectifMatchSelecteurModal
          matchsAVenir={matchsAVenir}
          matchCourantId={matchCourant.id}
          onSelect={(matchId) => {
            onSelectionnerMatch(matchId);
            setSelecteurOuvert(false);
          }}
          onClose={() => setSelecteurOuvert(false)}
        />
      )}
    </div>
  );
}
