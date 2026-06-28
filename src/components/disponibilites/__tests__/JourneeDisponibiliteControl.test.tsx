import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { JourneeDisponibiliteControl } from '../JourneeDisponibiliteControl';

describe('JourneeDisponibiliteControl', () => {
  it("affiche la date", () => {
    render(
      <JourneeDisponibiliteControl date="2026-07-01" onEnregistrer={vi.fn()} />,
    );

    expect(screen.getByText('2026-07-01')).toBeInTheDocument();
  });

  it('initialise le statut et le commentaire sur la disponibilité actuelle quand elle est fournie', () => {
    render(
      <JourneeDisponibiliteControl
        date="2026-07-01"
        disponibiliteActuelle={{ statut: 'absent', commentaire: 'Vacances' }}
        onEnregistrer={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Disponibilité')).toHaveValue('absent');
    expect(screen.getByLabelText('Commentaire')).toHaveValue('Vacances');
  });

  it("retombe sur 'present' et un commentaire vide quand aucune disponibilité actuelle n'est fournie", () => {
    render(
      <JourneeDisponibiliteControl date="2026-07-01" onEnregistrer={vi.fn()} />,
    );

    expect(screen.getByLabelText('Disponibilité')).toHaveValue('present');
    expect(screen.getByLabelText('Commentaire')).toHaveValue('');
  });

  it("n'affiche aucun bouton \"Retirer\" (pas de mécanisme de suppression pour la dispo de journée)", () => {
    render(
      <JourneeDisponibiliteControl
        date="2026-07-01"
        disponibiliteActuelle={{ statut: 'absent' }}
        onEnregistrer={vi.fn()}
      />,
    );

    expect(screen.queryByText(/Retirer/)).not.toBeInTheDocument();
  });

  it('appelle onEnregistrer avec le statut sélectionné et le commentaire saisi', () => {
    const onEnregistrer = vi.fn();
    render(
      <JourneeDisponibiliteControl date="2026-07-01" onEnregistrer={onEnregistrer} />,
    );

    fireEvent.change(screen.getByLabelText('Disponibilité'), { target: { value: 'disponible' } });
    fireEvent.change(screen.getByLabelText('Commentaire'), { target: { value: 'Dispo après 18h' } });
    fireEvent.click(screen.getByText('Enregistrer'));

    expect(onEnregistrer).toHaveBeenCalledWith('disponible', 'Dispo après 18h');
  });

  it('appelle onEnregistrer avec un commentaire optionnel undefined quand le champ est vide', () => {
    const onEnregistrer = vi.fn();
    render(
      <JourneeDisponibiliteControl date="2026-07-01" onEnregistrer={onEnregistrer} />,
    );

    fireEvent.click(screen.getByText('Enregistrer'));

    expect(onEnregistrer).toHaveBeenCalledWith('present', undefined);
  });

  it('conserve le commentaire optionnel après une saisie initiale (relecture de la prop)', () => {
    render(
      <JourneeDisponibiliteControl
        date="2026-07-01"
        disponibiliteActuelle={{ statut: 'present', commentaire: 'Je viens' }}
        onEnregistrer={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Commentaire')).toHaveValue('Je viens');
  });

  it('désactive le bouton "Enregistrer" pendant enregistrementEnCours', () => {
    render(
      <JourneeDisponibiliteControl
        date="2026-07-01"
        onEnregistrer={vi.fn()}
        enregistrementEnCours
      />,
    );

    expect(screen.getByText('Enregistrer')).toBeDisabled();
  });

  it('le bouton "Enregistrer" est actif par défaut (enregistrementEnCours non fourni)', () => {
    render(
      <JourneeDisponibiliteControl date="2026-07-01" onEnregistrer={vi.fn()} />,
    );

    expect(screen.getByText('Enregistrer')).not.toBeDisabled();
  });
});
