import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FiltreJoursSemaine } from '../FiltreJoursSemaine';
import { JOURS_PAR_DEFAUT } from '../joursSemaine';

describe('FiltreJoursSemaine', () => {
  it('affiche les 7 badges Lun-Dim', () => {
    render(<FiltreJoursSemaine joursSelectionnes={JOURS_PAR_DEFAUT} onChange={vi.fn()} />);

    ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].forEach((jour) => {
      expect(screen.getByRole('button', { name: jour })).toBeInTheDocument();
    });
  });

  it('marque le badge Vendredi comme actif quand JOURS_PAR_DEFAUT est sélectionné', () => {
    render(<FiltreJoursSemaine joursSelectionnes={JOURS_PAR_DEFAUT} onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Ven' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Lun' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('appelle onChange en ajoutant le jour quand on clique sur un badge non sélectionné', () => {
    const onChange = vi.fn();
    render(<FiltreJoursSemaine joursSelectionnes={[5]} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Lun' }));

    expect(onChange).toHaveBeenCalledWith([5, 1]);
  });

  it('appelle onChange en retirant le jour quand on clique sur un badge déjà sélectionné', () => {
    const onChange = vi.fn();
    render(<FiltreJoursSemaine joursSelectionnes={[5, 1]} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Ven' }));

    expect(onChange).toHaveBeenCalledWith([1]);
  });
});
