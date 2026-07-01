import type { DisponibiliteEffectiveDto } from '../../api/disponibilites';
import { StatutBadge } from './StatutBadge';

interface Props {
  disponibilite: DisponibiliteEffectiveDto;
}

/** Affichage en lecture seule d'une cellule de disponibilité (statut + source). */
export function DisponibiliteBadge({ disponibilite }: Props) {
  if (disponibilite.source === 'aucune') {
    return <span className="disponibilite-badge disponibilite-badge--vide">—</span>;
  }

  return (
    <span className="disponibilite-badge" title={disponibilite.commentaire}>
      <StatutBadge statut={disponibilite.statut} />
      {disponibilite.source === 'activite' ? ' *' : ''}
    </span>
  );
}
