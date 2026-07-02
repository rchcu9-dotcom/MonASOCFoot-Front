import type { EffectifMatchBadgeDto } from '../../api/disponibilites';

interface Props {
  badge: EffectifMatchBadgeDto;
}

/** Synthèse compacte de l'effectif pour le match affiché : présents, disponibles, % de saisie. */
export function EffectifMatchBadge({ badge }: Props) {
  return (
    <span className="effectif-match-badge">
      {badge.nbPresents} présent{badge.nbPresents > 1 ? 's' : ''} · {badge.nbDisponibles} disponible
      {badge.nbDisponibles > 1 ? 's' : ''} · {badge.pourcentageSaisie}% saisi
    </span>
  );
}
