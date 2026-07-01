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
  fireEvent.change(screen.getByLabelText('Date (optionnelle)'), { target: { value: '2026-08-01' } });
  fireEvent.change(screen.getByLabelText('Heure de convocation'), { target: { value: '10:00' } });
  fireEvent.change(screen.getByLabelText('Heure de début'), { target: { value: '11:00' } });
  fireEvent.change(screen.getByLabelText('Label'), { target: { value: 'Entraînement' } });
}

describe('ActiviteForm', () => {
  it('mode création : tous les champs sont vides et le bouton affiche "Créer"', () => {
    render(<ActiviteForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText('Date (optionnelle)')).toHaveValue('');
    expect(screen.getByLabelText('Label')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Créer' })).toBeInTheDocument();
  });

  it('mode création : les heures de convocation et de début sont préremplies à 20:00 / 21:00', () => {
    render(<ActiviteForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText('Heure de convocation')).toHaveValue('20:00');
    expect(screen.getByLabelText('Heure de début')).toHaveValue('21:00');
  });

  it('mode création : le champ Lieu est vide par défaut', () => {
    render(<ActiviteForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText('Lieu')).toHaveValue('');
  });

  it('mode création : les heures par défaut restent librement modifiables avant validation', () => {
    const onSubmit = vi.fn();
    render(<ActiviteForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Heure de convocation'), { target: { value: '09:00' } });
    fireEvent.change(screen.getByLabelText('Heure de début'), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText('Label'), { target: { value: 'Entraînement' } });
    fireEvent.click(screen.getByRole('button', { name: 'Créer' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ heureConvocation: '09:00', heureDebut: '10:00' }),
    );
  });

  it('mode édition : les champs sont préremplis avec les valeurs existantes et le bouton affiche "Enregistrer"', () => {
    render(<ActiviteForm activite={activiteExistante} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText('Date (optionnelle)')).toHaveValue('2026-07-01');
    expect(screen.getByLabelText('Heure de convocation')).toHaveValue('14:00');
    expect(screen.getByLabelText('Heure de début')).toHaveValue('15:00');
    expect(screen.getByLabelText('Label')).toHaveValue('Match amical');
    expect(screen.getByLabelText('Type')).toHaveValue('match');
    expect(screen.getByLabelText('Commentaire')).toHaveValue('RDV au stade');
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeInTheDocument();
  });

  it("mode édition : les heures enregistrées ne sont pas écrasées par les valeurs par défaut de création", () => {
    render(<ActiviteForm activite={activiteExistante} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText('Heure de convocation')).not.toHaveValue('20:00');
    expect(screen.getByLabelText('Heure de début')).not.toHaveValue('21:00');
  });

  it('mode édition : le champ Lieu est prérempli avec la valeur existante', () => {
    render(
      <ActiviteForm
        activite={{ ...activiteExistante, lieu: 'Stade municipal' }}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Lieu')).toHaveValue('Stade municipal');
  });

  it('mode édition : le champ Lieu est vide quand l\'activité existante n\'a pas de lieu renseigné', () => {
    render(<ActiviteForm activite={activiteExistante} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText('Lieu')).toHaveValue('');
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

  it('appelle onSubmit avec une date undefined quand le champ Date est laissé vide (activité « sans date »)', () => {
    const onSubmit = vi.fn();
    render(<ActiviteForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Heure de convocation'), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText('Heure de début'), { target: { value: '11:00' } });
    fireEvent.change(screen.getByLabelText('Label'), { target: { value: 'Entraînement' } });
    fireEvent.click(screen.getByRole('button', { name: 'Créer' }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ date: undefined }));
  });

  it("affiche une erreur et n'appelle pas onSubmit quand le label est manquant", () => {
    const onSubmit = vi.fn();
    render(<ActiviteForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Date (optionnelle)'), { target: { value: '2026-08-01' } });
    fireEvent.change(screen.getByLabelText('Heure de convocation'), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText('Heure de début'), { target: { value: '11:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Créer' }));

    expect(screen.getByText('Le label est obligatoire.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("affiche une erreur et n'appelle pas onSubmit quand heureDebut < heureConvocation", () => {
    const onSubmit = vi.fn();
    render(<ActiviteForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Date (optionnelle)'), { target: { value: '2026-08-01' } });
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

    fireEvent.change(screen.getByLabelText('Date (optionnelle)'), { target: { value: '2026-08-01' } });
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

  describe('champ "equipe"', () => {
    it('mode création : le champ équipe vaut "Non renseignée" par défaut', () => {
      render(<ActiviteForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

      expect(screen.getByLabelText('Équipe')).toHaveValue('');
    });

    it('mode édition : le champ équipe est prérempli avec la valeur existante', () => {
      render(
        <ActiviteForm
          activite={{ ...activiteExistante, equipe: 'B' }}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      expect(screen.getByLabelText('Équipe')).toHaveValue('B');
    });

    it('appelle onSubmit avec equipe: undefined quand le champ équipe est laissé sur "Non renseignée"', () => {
      const onSubmit = vi.fn();
      render(<ActiviteForm onSubmit={onSubmit} onCancel={vi.fn()} />);

      remplirChampsValides();
      fireEvent.click(screen.getByRole('button', { name: 'Créer' }));

      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ equipe: undefined }));
    });

    it('appelle onSubmit avec la valeur "equipe" sélectionnée', () => {
      const onSubmit = vi.fn();
      render(<ActiviteForm onSubmit={onSubmit} onCancel={vi.fn()} />);

      remplirChampsValides();
      fireEvent.change(screen.getByLabelText('Équipe'), { target: { value: 'Vet' } });
      fireEvent.click(screen.getByRole('button', { name: 'Créer' }));

      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ equipe: 'Vet' }));
    });
  });

  describe('champ "lieu"', () => {
    it("la soumission n'est pas bloquée et n'affiche pas d'erreur quand le lieu est laissé vide", () => {
      const onSubmit = vi.fn();
      render(<ActiviteForm onSubmit={onSubmit} onCancel={vi.fn()} />);

      remplirChampsValides();
      fireEvent.click(screen.getByRole('button', { name: 'Créer' }));

      expect(onSubmit).toHaveBeenCalled();
      expect(screen.queryByText(/lieu/i, { selector: '.activite-form__erreur' })).not.toBeInTheDocument();
    });

    it('transforme un lieu vide en undefined à la soumission', () => {
      const onSubmit = vi.fn();
      render(<ActiviteForm onSubmit={onSubmit} onCancel={vi.fn()} />);

      remplirChampsValides();
      fireEvent.click(screen.getByRole('button', { name: 'Créer' }));

      expect(onSubmit.mock.calls[0][0].lieu).toBeUndefined();
    });

    it('appelle onSubmit avec le lieu saisi', () => {
      const onSubmit = vi.fn();
      render(<ActiviteForm onSubmit={onSubmit} onCancel={vi.fn()} />);

      remplirChampsValides();
      fireEvent.change(screen.getByLabelText('Lieu'), { target: { value: 'Stade municipal' } });
      fireEvent.click(screen.getByRole('button', { name: 'Créer' }));

      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ lieu: 'Stade municipal' }));
    });
  });
});
