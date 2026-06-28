import type { ActiviteColonneDto } from '../../api/disponibilites';

export interface FiltreJourneeActiviteValue {
  activiteId?: string;
}

interface Props {
  activites: ActiviteColonneDto[];
  value: FiltreJourneeActiviteValue;
  onChange: (value: FiltreJourneeActiviteValue) => void;
}

/** Sélecteur contrôlé d'activité — aucun appel API direct, remonte le filtre via `onChange`. */
export function FiltreJourneeActivite({ activites, value, onChange }: Props) {
  return (
    <label className="filtre-journee-activite">
      Activité :{' '}
      <select
        value={value.activiteId ?? ''}
        onChange={(event) =>
          onChange({ activiteId: event.target.value || undefined })
        }
      >
        <option value="">Toutes les activités à venir</option>
        {activites.map((activite) => (
          <option key={activite.id} value={activite.id}>
            {activite.date} — {activite.label}
          </option>
        ))}
      </select>
    </label>
  );
}
