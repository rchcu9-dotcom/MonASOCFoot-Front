import type { DisponibiliteEffectiveDto } from '../../api/disponibilites';

const LABELS: Record<DisponibiliteEffectiveDto['statut'], string> = {
  present: 'Présent',
  disponible: 'Disponible',
  absent: 'Absent',
  autre: 'Autre',
};

const COLORS: Record<DisponibiliteEffectiveDto['statut'], string> = {
  present: '#1a7f37',
  disponible: '#2563eb',
  absent: '#b91c1c',
  autre: '#6b7280',
};

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
