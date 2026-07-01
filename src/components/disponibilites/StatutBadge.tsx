import type { StatutDisponibilite } from '../../api/disponibilites';
import {
  STATUT_DISPONIBILITE_BADGE_STYLES as BADGE_STYLES,
  STATUT_DISPONIBILITE_LABELS as LABELS,
} from './statutDisponibilite.constants';

interface Props {
  statut: StatutDisponibilite;
  /** Rendu neutre/gris (ex. « à renseigner »), indépendant de la couleur du statut. */
  muted?: boolean;
  /** Libellé custom (ex. « À renseigner ») — par défaut le libellé du statut. */
  label?: string;
}

/** Pastille colorée représentant un statut de disponibilité. Source unique de rendu visuel statut→couleur. */
export function StatutBadge({ statut, muted = false, label }: Props) {
  const style = muted
    ? { backgroundColor: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8' }
    : {
        backgroundColor: BADGE_STYLES[statut].bg,
        color: BADGE_STYLES[statut].fg,
      };

  return (
    <span className={`statut-badge${muted ? ' statut-badge--muted' : ''}`} style={style}>
      {label ?? LABELS[statut]}
    </span>
  );
}
