import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { ActiviteDto } from '../../api/activites';

const LABEL_EQUIPE: Record<string, string> = { A: 'A', B: 'B', Vet: 'Vét' };
const LONGUEUR_LABEL_TRONQUE = 18;

function tronquer(label: string): string {
  return label.length > LONGUEUR_LABEL_TRONQUE
    ? `${label.slice(0, LONGUEUR_LABEL_TRONQUE)}…`
    : label;
}

function titreTooltip(activite: ActiviteDto): string {
  const lignes = [
    activite.label,
    `Type : ${activite.type === 'match' ? 'Match' : 'Autre'}`,
    activite.equipe ? `Équipe : ${LABEL_EQUIPE[activite.equipe]}` : null,
    `Convocation : ${activite.heureConvocation}`,
    `Début : ${activite.heureDebut}`,
    activite.commentaire ? `Commentaire : ${activite.commentaire}` : null,
  ].filter((ligne): ligne is string => ligne !== null);
  return lignes.join('\n');
}

interface Props {
  activite: ActiviteDto;
  /** Sélectionnée dans le mode de repli clic-sélection/clic-cible. */
  selectionnee?: boolean;
  onClick: (activite: ActiviteDto) => void;
  /**
   * Mode de repli sans glisser-déposer : sélectionne cette carte comme cible d'un déplacement.
   * Rendu comme une action secondaire distincte du clic principal (qui ouvre le détail), pour que
   * n'importe quelle carte — pas seulement la première de la colonne « Sans date » — puisse être
   * choisie pour un déplacement, conformément au critère d'acceptation d'équivalence stricte avec
   * le glisser-déposer.
   */
  onSelectionner?: (activite: ActiviteDto) => void;
}

/**
 * Carte compacte d'activité (vue calendrier/sans-date) : type, équipe si renseignée, heure de
 * début, début du libellé tronqué. Tooltip natif au survol (titre complet). Clic = ouverture du
 * détail (popup) ou, en mode repli, désélection si déjà sélectionnée. Draggable via `@dnd-kit/core`.
 */
export function ActiviteCarte({ activite, selectionnee, onClick, onSelectionner }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: activite.id,
    data: { activite },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div className="activite-carte-conteneur">
      <button
        type="button"
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        title={titreTooltip(activite)}
        className={[
          'activite-carte',
          `activite-carte--${activite.type}`,
          selectionnee ? 'activite-carte--selectionnee' : '',
          isDragging ? 'activite-carte--dragging' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => onClick(activite)}
      >
        <span className="activite-carte__type">{activite.type === 'match' ? 'Match' : 'Autre'}</span>
        {activite.equipe && (
          <span className="activite-carte__equipe">{LABEL_EQUIPE[activite.equipe]}</span>
        )}
        <span className="activite-carte__heure">{activite.heureDebut}</span>
        <span className="activite-carte__label">{tronquer(activite.label)}</span>
      </button>
      {onSelectionner && (
        <button
          type="button"
          className="activite-carte__bouton-deplacer"
          onClick={() => onSelectionner(activite)}
        >
          Déplacer
        </button>
      )}
    </div>
  );
}
