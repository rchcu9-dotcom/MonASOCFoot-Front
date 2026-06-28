import type { DisponibiliteEffectiveDto } from '../../api/disponibilites';
import {
  STATUT_DISPONIBILITE_COLORS as COLORS,
  STATUT_DISPONIBILITE_LABELS as LABELS,
} from './statutDisponibilite.constants';

interface Props {
  disponibilite: DisponibiliteEffectiveDto;
}

/** Affichage en lecture seule d'une cellule de disponibilité (statut + source). */
export function DisponibiliteBadge({ disponibilite }: Props) {
  if (disponibilite.source === 'aucune') {
    return <span className="disponibilite-badge disponibilite-badge--vide">—</span>;
  }

  return (
    <span
      className="disponibilite-badge"
      style={{ color: COLORS[disponibilite.statut] }}
      title={disponibilite.commentaire}
    >
      {LABELS[disponibilite.statut]}
      {disponibilite.source === 'activite' ? ' *' : ''}
    </span>
  );
}
