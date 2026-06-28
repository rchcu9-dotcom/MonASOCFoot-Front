import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FiltreJourneeActivite } from '../FiltreJourneeActivite';
import type { ActiviteColonneDto } from '../../../api/disponibilites';

const activites: ActiviteColonneDto[] = [
  { id: 'a1', date: '2026-07-01', heureConvocation: '14:00', heureDebut: '15:00', label: 'Match', type: 'match' },
  { id: 'a2', date: '2026-07-08', heureConvocation: '09:00', heureDebut: '10:00', label: 'Entraînement', type: 'autre' },
];

describe('FiltreJourneeActivite', () => {
  it('affiche une option "Toutes les activités à venir" sélectionnée par défaut quand value.activiteId est absent', () => {
    render(<FiltreJourneeActivite activites={activites} value={{}} onChange={vi.fn()} />);

    expect(screen.getByRole('combobox')).toHaveValue('');
  });

  it('affiche une option par activité', () => {
    render(<FiltreJourneeActivite activites={activites} value={{}} onChange={vi.fn()} />);

    expect(screen.getByRole('option', { name: /Match/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Entraînement/ })).toBeInTheDocument();
  });

  it("appelle onChange avec l'activiteId sélectionné, sans effectuer le moindre appel réseau", () => {
    const onChange = vi.fn();
    render(<FiltreJourneeActivite activites={activites} value={{}} onChange={onChange} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'a2' } });

    expect(onChange).toHaveBeenCalledWith({ activiteId: 'a2' });
  });

  it('appelle onChange avec activiteId undefined quand "Toutes les activités à venir" est resélectionné', () => {
    const onChange = vi.fn();
    render(<FiltreJourneeActivite activites={activites} value={{ activiteId: 'a1' }} onChange={onChange} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } });

    expect(onChange).toHaveBeenCalledWith({ activiteId: undefined });
  });

  it('est un composant contrôlé : reflète value.activiteId dans le select', () => {
    render(<FiltreJourneeActivite activites={activites} value={{ activiteId: 'a2' }} onChange={vi.fn()} />);

    expect(screen.getByRole('combobox')).toHaveValue('a2');
  });
});
