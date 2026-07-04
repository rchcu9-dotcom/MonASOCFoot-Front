import { useEffect, useRef } from 'react';
import type { ActiviteColonneDto } from '../../api/disponibilites';
import { CategorieActivite } from './CategorieActivite';

interface Props {
  matchsAVenir: ActiviteColonneDto[];
  matchCourantId: string;
  onSelect: (matchId: string) => void;
  onClose: () => void;
}

/**
 * Pop-up de sélection directe d'un match parmi tous les matchs à venir (ordre chronologique).
 * Le match affiché sur la page est mis en évidence et amené en vue au montage.
 */
export function EffectifMatchSelecteurModal({
  matchsAVenir,
  matchCourantId,
  onSelect,
  onClose,
}: Props) {
  const refMatchCourant = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    refMatchCourant.current?.scrollIntoView?.({ block: 'center' });
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="confirm-dialog__overlay" role="presentation" onClick={onClose}>
      <div
        className="confirm-dialog effectif-match-selecteur-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Sélectionner un match"
        onClick={(event) => event.stopPropagation()}
      >
        <h2>Sélectionner un match</h2>

        <ul className="effectif-match-selecteur-modal__liste">
          {matchsAVenir.map((match) => {
            const estSelectionne = match.id === matchCourantId;

            return (
              <li key={match.id}>
                <button
                  type="button"
                  ref={estSelectionne ? refMatchCourant : undefined}
                  className={
                    estSelectionne
                      ? 'effectif-match-selecteur-modal__item effectif-match-selecteur-modal__item--selectionne'
                      : 'effectif-match-selecteur-modal__item'
                  }
                  aria-current={estSelectionne ? 'true' : undefined}
                  onClick={() => onSelect(match.id)}
                >
                  <CategorieActivite equipe={match.equipe} />
                  <span className="effectif-match-navigation__titre">{match.label}</span>
                  <span className="effectif-match-navigation__date">{match.date}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="confirm-dialog__actions">
          <button type="button" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
