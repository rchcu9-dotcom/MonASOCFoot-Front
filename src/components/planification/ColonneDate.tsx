import { useDroppable } from '@dnd-kit/core';
import type { ActiviteDto } from '../../api/activites';
import { ActiviteCarte } from './ActiviteCarte';

interface Props {
  date: string;
  activites: ActiviteDto[];
  selectionId: string | null;
  onClickCarte: (activite: ActiviteDto) => void;
  /** Mode de repli : clic sur la date cible alors qu'une carte est sélectionnée. */
  onClickCible: (date: string) => void;
}

function formatterDateCourte(dateIso: string): string {
  const date = new Date(`${dateIso}T00:00:00`);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
}

/** Une entrée de date en colonne « Calendrier », droppable, listant ses activités rattachées. */
export function ColonneDate({ date, activites, selectionId, onClickCarte, onClickCible }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: `date:${date}`, data: { date } });

  return (
    <div
      ref={setNodeRef}
      className={`colonne-date${isOver ? ' colonne-date--over' : ''}`}
      onClick={() => {
        if (selectionId) onClickCible(date);
      }}
    >
      <div className="colonne-date__entete">{formatterDateCourte(date)}</div>
      <div className="colonne-date__activites">
        {activites.map((activite) => (
          <ActiviteCarte
            key={activite.id}
            activite={activite}
            selectionnee={selectionId === activite.id}
            onClick={onClickCarte}
          />
        ))}
      </div>
    </div>
  );
}
