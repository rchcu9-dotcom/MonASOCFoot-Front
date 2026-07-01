import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatutBadgeSelector } from '../StatutBadgeSelector';

describe('StatutBadgeSelector', () => {
  it('affiche les 4 statuts possibles sous forme de badges', () => {
    render(<StatutBadgeSelector value="present" onChange={vi.fn()} />);

    expect(screen.getByText('Présent')).toBeInTheDocument();
    expect(screen.getByText('Disponible')).toBeInTheDocument();
    expect(screen.getByText('Absent')).toBeInTheDocument();
    expect(screen.getByText('Autre')).toBeInTheDocument();
  });

  it('marque le badge correspondant à "value" avec aria-pressed="true", les autres à "false"', () => {
    render(<StatutBadgeSelector value="disponible" onChange={vi.fn()} />);

    expect(screen.getByText('Présent').closest('button')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Disponible').closest('button')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Absent').closest('button')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Autre').closest('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('appelle onChange avec le statut cliqué', () => {
    const onChange = vi.fn();
    render(<StatutBadgeSelector value="present" onChange={onChange} />);

    fireEvent.click(screen.getByText('Absent').closest('button')!);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('absent');
  });

  it('désactive tous les boutons quand disabled=true et ne déclenche pas onChange au clic', () => {
    const onChange = vi.fn();
    render(<StatutBadgeSelector value="present" onChange={onChange} disabled />);

    const boutonAbsent = screen.getByText('Absent').closest('button')!;
    expect(boutonAbsent).toBeDisabled();

    fireEvent.click(boutonAbsent);

    expect(onChange).not.toHaveBeenCalled();
  });
});
