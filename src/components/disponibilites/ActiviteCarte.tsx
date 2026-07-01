import type { ActiviteColonneDto, DisponibiliteEffectiveDto } from '../../api/disponibilites';
import { tronquerLabel } from '../../utils/troncature';
import { CategorieActivite } from './CategorieActivite';
import { StatutBadge } from './StatutBadge';

interface Props {
  activite: ActiviteColonneDto;
  disponibilite: DisponibiliteEffectiveDto;
  onClick: () => void;
}

const LABEL_TYPE: Record<ActiviteColonneDto['type'], string> = {
  match: 'Match',
  autre: 'Autre',
};

/**
 * Ligne de colonne (carte cliquable) : résumé condensé de l'activité + statut effectif.
 * Le `title` HTML natif porte l'infobulle de survol (label complet, type, heure de convocation,
 * commentaire) — pas de librairie tooltip pour un besoin aussi simple.
 */
export function ActiviteCarte({ activite, disponibilite, onClick }: Props) {
  const titre = [
    activite.label,
    LABEL_TYPE[activite.type],
    `Convocation ${activite.heureConvocation}`,
    activite.commentaire,
  ]
    .filter(Boolean)
    .join(' — ');

  return (
    <button
      type="button"
      className="dispo-activite-carte"
      title={titre}
      onClick={onClick}
    >
      <span className="dispo-activite-carte__date">{activite.date}</span>
      <span className="dispo-activite-carte__heure">{activite.heureDebut}</span>
      <span className="dispo-activite-carte__label">{tronquerLabel(activite.label)}</span>
      <CategorieActivite equipe={activite.equipe} />
      <span className="dispo-activite-carte__statut">
        {disponibilite.source !== 'aucune' ? (
          <StatutBadge statut={disponibilite.statut} />
        ) : (
          <StatutBadge statut="autre" muted label="À renseigner" />
        )}
      </span>
    </button>
  );
}
