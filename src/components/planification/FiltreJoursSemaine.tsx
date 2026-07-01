import { JOURS_SEMAINE } from './joursSemaine';

interface Props {
  joursSelectionnes: number[];
  onChange: (jours: number[]) => void;
}

/**
 * Filtre en badges Lun..Dim, état local à la page de planification — ne filtre que l'affichage
 * de la colonne « Calendrier », jamais la colonne « Sans date » ni la donnée en base.
 */
export function FiltreJoursSemaine({ joursSelectionnes, onChange }: Props) {
  function toggle(jour: number) {
    if (joursSelectionnes.includes(jour)) {
      onChange(joursSelectionnes.filter((j) => j !== jour));
    } else {
      onChange([...joursSelectionnes, jour]);
    }
  }

  return (
    <div className="filtre-jours-semaine" role="group" aria-label="Filtre par jour de semaine">
      {JOURS_SEMAINE.map((jour) => {
        const actif = joursSelectionnes.includes(jour.id);
        return (
          <button
            key={jour.id}
            type="button"
            className={`filtre-jours-semaine__badge${actif ? ' filtre-jours-semaine__badge--actif' : ''}`}
            aria-pressed={actif}
            onClick={() => toggle(jour.id)}
          >
            {jour.label}
          </button>
        );
      })}
    </div>
  );
}
