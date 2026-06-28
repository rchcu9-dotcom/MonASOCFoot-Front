import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActiviteForm } from '../ActiviteForm';
import type { ActiviteDto } from '../../../api/activites';

const activiteExistante: ActiviteDto = {
  id: 'a1',
  date: '2026-07-01',
  heureConvocation: '14:00',
  heureDebut: '15:00',
  label: 'Match amical',
  type: 'match',
  commentaire: 'RDV au stade',
  source: 'manuel',
};

function remplirChampsValides() {
  fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-08-01' } });
  fireEvent.change(screen.getByLabelText('Heure de convocation'), { target: { value: '10:00' } });
  fireEvent.change(screen.getByLabelText('Heure de début'), { target: { value: '11:00' } });
  fireEvent.change(screen.getByLabelText('Label'), { target: { value: 'Entraînement' } });
}

describe('ActiviteForm', () => {
  it('mode création : tous les champs sont vides et le bouton affiche "Créer"', () => {
    render(<ActiviteForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText('Date')).toHaveValue('');
    expect(screen.getByLabelText('Label')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Créer' })).toBeInTheDocument();
  });

  it('mode édition : les champs sont préremplis avec les valeurs existantes et le bouton affiche "Enregistrer"', () => {
    render(<ActiviteForm activite={activiteExistante} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText('Date')).toHaveValue('2026-07-01');
    expect(screen.getByLabelText('Heure de convocation')).toHaveValue('14:00');
    expect(screen.getByLabelText('Heure de début')).toHaveValue('15:00');
    expect(screen.getByLabelText('Label')).toHaveValue('Match amical');
    expect(screen.getByLabelText('Type')).toHaveValue('match');
    expect(screen.getByLabelText('Commentaire')).toHaveValue('RDV au stade');
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeInTheDocument();
  });

  it('appelle onSubmit avec les valeurs saisies quand le formulaire est valide', () => {
    const onSubmit = vi.fn();
    render(<ActiviteForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    remplirChampsValides();
    fireEvent.click(screen.getByRole('button', { name: 'Créer' }));

    expect(onSubmit).toHaveBeenCalledWith({
      date: '2026-08-01',
      heureConvocation: '10:00',
      heureDebut: '11:00',
      label: 'Entraînement',
      type: 'match',
      commentaire: undefined,
    });
  });

  it('transforme un commentaire vide en undefined à la soumission', () => {
    const onSubmit = vi.fn();
    render(<ActiviteForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    remplirChampsValides();
    fireEvent.change(screen.getByLabelText('Commentaire'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Créer' }));

    expect(onSubmit.mock.calls[0][0].commentaire).toBeUndefined();
  });

  it("affiche une erreur et n'appelle pas onSubmit quand la date est manquante", () => {
    const onSubmit = vi.fn();
    render(<ActiviteForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Heure de convocation'), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText('Heure de début'), { target: { value: '11:00' } });
    fireEvent.change(screen.getByLabelText('Label'), { target: { value: 'Entraînement' } });
    fireEvent.click(screen.getByRole('button', { name: 'Créer' }));

    expect(screen.getByText('La date est obligatoire.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("affiche une erreur et n'appelle pas onSubmit quand le label est manquant", () => {
    const onSubmit = vi.fn();
    render(<ActiviteForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-08-01' } });
    fireEvent.change(screen.getByLabelText('Heure de convocation'), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText('Heure de début'), { target: { value: '11:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Créer' }));

    expect(screen.getByText('Le label est obligatoire.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("affiche une erreur et n'appelle pas onSubmit quand heureDebut < heureConvocation", () => {
    const onSubmit = vi.fn();
    render(<ActiviteForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-08-01' } });
    fireEvent.change(screen.getByLabelText('Heure de convocation'), { target: { value: '15:00' } });
    fireEvent.change(screen.getByLabelText('Heure de début'), { target: { value: '14:00' } });
    fireEvent.change(screen.getByLabelText('Label'), { target: { value: 'Entraînement' } });
    fireEvent.click(screen.getByRole('button', { name: 'Créer' }));

    expect(
      screen.getByText("L'heure de début doit être postérieure ou égale à l'heure de convocation."),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('accepte heureDebut strictement égale à heureConvocation', () => {
    const onSubmit = vi.fn();
    render(<ActiviteForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-08-01' } });
    fireEvent.change(screen.getByLabelText('Heure de convocation'), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText('Heure de début'), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText('Label'), { target: { value: 'Entraînement' } });
    fireEvent.click(screen.getByRole('button', { name: 'Créer' }));

    expect(onSubmit).toHaveBeenCalled();
  });

  it('appelle onCancel quand on clique sur "Annuler"', () => {
    const onCancel = vi.fn();
    render(<ActiviteForm onSubmit={vi.fn()} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
