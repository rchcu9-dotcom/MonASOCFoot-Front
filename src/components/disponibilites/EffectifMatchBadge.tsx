import type { ReactNode } from 'react';
import type { EffectifMatchBadgeDto } from '../../api/disponibilites';
import { getNombrePresentsBadgeStyle } from '../../utils/nombrePresentsCouleur';
import { getPourcentageBadgeStyle } from '../../utils/pourcentageRenseignement';

interface Props {
  badge: EffectifMatchBadgeDto;
}

interface BadgeSegmentProps {
  bg: string;
  fg: string;
  children: ReactNode;
}

/**
 * Pastille colorée réutilisée pour les deux segments de `EffectifMatchBadge` qui ont un code
 * couleur (présents, % saisi) — évite de dupliquer deux fois la même construction JSX.
 */
function BadgeSegment({ bg, fg, children }: BadgeSegmentProps) {
  return (
    <span className="statut-badge" style={{ backgroundColor: bg, color: fg }}>
      {children}
    </span>
  );
}

/**
 * Synthèse compacte de l'effectif pour le match affiché : présents, disponibles, % de saisie.
 * Les segments « présents » et « % saisi » sont colorés (vert/jaune/rouge, cf. `getNombrePresentsBadgeStyle`
 * et `getPourcentageBadgeStyle` — réutilisation de la palette `STATUT_DISPONIBILITE_COLORS` pour des
 * seuils d'indicateurs agrégés, sans rapport avec la sémantique des statuts individuels de disponibilité).
 * Le segment « disponibles » reste neutre, aucun seuil n'étant demandé pour cette donnée.
 */
export function EffectifMatchBadge({ badge }: Props) {
  const { bg: bgPresents, fg: fgPresents } = getNombrePresentsBadgeStyle(badge.nbPresents);
  const { bg: bgSaisie, fg: fgSaisie } = getPourcentageBadgeStyle(badge.pourcentageSaisie);

  return (
    <span className="effectif-match-badge">
      <BadgeSegment bg={bgPresents} fg={fgPresents}>
        {badge.nbPresents} présent{badge.nbPresents > 1 ? 's' : ''}
      </BadgeSegment>
      {' · '}
      {badge.nbDisponibles} disponible{badge.nbDisponibles > 1 ? 's' : ''}
      {' · '}
      <BadgeSegment bg={bgSaisie} fg={fgSaisie}>
        {badge.pourcentageSaisie}% saisi
      </BadgeSegment>
    </span>
  );
}
