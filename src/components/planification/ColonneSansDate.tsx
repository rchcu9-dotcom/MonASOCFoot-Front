import { useDroppable } from '@dnd-kit/core';
import type { ActiviteDto } from '../../api/activites';
import { ActiviteCarte } from './ActiviteCarte';

interface Props {
  activites: ActiviteDto[];
  selectionId: string | null;
  onClickCarte: (activite: ActiviteDto) => void;
  /** Mode de repli : clic sur la colonne alors qu'une carte (datée) est sélectionnée. */
  onClickCible: () => void;
}

/** Colonne gauche « Sans date », droppable — retire la date d'une activité déposée ici. */
export function ColonneSansDate({ activites, selectionId, onClickCarte, onClickCible }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: 'sans-date' });

  return (
    <div
      ref={setNodeRef}
      className={`colonne-sans-date${isOver ? ' colonne-sans-date--over' : ''}`}
      onClick={() => {
        if (selectionId) onClickCible();
      }}
    >
      {activites.length === 0 && <p className="colonne-sans-date__vide">Aucune activité sans date.</p>}
      {activites.map((activite) => (
        <ActiviteCarte
          key={activite.id}
          activite={activite}
          selectionnee={selectionId === activite.id}
          onClick={onClickCarte}
        />
      ))}
    </div>
  );
}
