import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConfirmDeleteDialog } from '../ConfirmDeleteDialog';

describe('ConfirmDeleteDialog', () => {
  it('affiche le message fourni', () => {
    render(<ConfirmDeleteDialog message="Supprimer définitivement ?" onConfirm={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText('Supprimer définitivement ?')).toBeInTheDocument();
  });

  it('appelle onConfirm quand on clique sur "Confirmer"', () => {
    const onConfirm = vi.fn();
    render(<ConfirmDeleteDialog message="m" onConfirm={onConfirm} onCancel={vi.fn()} />);

    screen.getByRole('button', { name: 'Confirmer' }).click();

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('appelle onCancel quand on clique sur "Annuler"', () => {
    const onCancel = vi.fn();
    render(<ConfirmDeleteDialog message="m" onConfirm={vi.fn()} onCancel={onCancel} />);

    screen.getByRole('button', { name: 'Annuler' }).click();

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("appelle onCancel quand on clique sur l'overlay en dehors du dialogue", () => {
    const onCancel = vi.fn();
    render(<ConfirmDeleteDialog message="m" onConfirm={vi.fn()} onCancel={onCancel} />);

    screen.getByRole('presentation').click();

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("ne propage pas le clic sur le dialogue lui-même à l'overlay (pas de fermeture accidentelle)", () => {
    const onCancel = vi.fn();
    render(<ConfirmDeleteDialog message="m" onConfirm={vi.fn()} onCancel={onCancel} />);

    screen.getByRole('alertdialog').click();

    expect(onCancel).not.toHaveBeenCalled();
  });
});
