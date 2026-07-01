import type { StatutDisponibilite } from '../../api/disponibilites';
import { StatutBadge } from './StatutBadge';

const STATUTS: StatutDisponibilite[] = ['present', 'disponible', 'absent', 'autre'];

interface Props {
  value: StatutDisponibilite;
  onChange: (statut: StatutDisponibilite) => void;
  disabled?: boolean;
}

/** Sélecteur de statut sous forme de badges colorés cliquables, badge actif marqué `aria-pressed`. */
export function StatutBadgeSelector({ value, onChange, disabled = false }: Props) {
  return (
    <div className="statut-badge-selector" role="group">
      {STATUTS.map((statut) => (
        <button
          key={statut}
          type="button"
          className={`statut-badge-selector__option${
            statut === value ? ' statut-badge-selector__option--actif' : ''
          }`}
          aria-pressed={statut === value}
          disabled={disabled}
          onClick={() => onChange(statut)}
        >
          <StatutBadge statut={statut} />
        </button>
      ))}
    </div>
  );
}
