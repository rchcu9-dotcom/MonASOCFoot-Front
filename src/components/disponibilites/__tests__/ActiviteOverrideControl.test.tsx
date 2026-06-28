import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActiviteOverrideControl } from '../ActiviteOverrideControl';

const activite = { id: 'activite-1', label: 'Match amical', heureDebut: '15:00', type: 'match' as const };

describe('ActiviteOverrideControl', () => {
  it("affiche l'activité (heure, label, type)", () => {
    render(
      <ActiviteOverrideControl
        activite={activite}
        onEnregistrer={vi.fn()}
        onRetirerSurcharge={vi.fn()}
      />,
    );

    expect(screen.getByText(/15:00 — Match amical \(match\)/)).toBeInTheDocument();
  });

  it("initialise le statut sur la surcharge existante quand elle est fournie", () => {
    render(
      <ActiviteOverrideControl
        activite={activite}
        surchargeActuelle={{ statut: 'absent', commentaire: 'Blessé' }}
        statutJourneeParDefaut="present"
        onEnregistrer={vi.fn()}
        onRetirerSurcharge={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Disponibilité')).toHaveValue('absent');
    expect(screen.getByLabelText('Commentaire')).toHaveValue('Blessé');
  });

  it("initialise le statut sur la disponibilité de journée par défaut quand aucune surcharge n'existe", () => {
    render(
      <ActiviteOverrideControl
        activite={activite}
        statutJourneeParDefaut="disponible"
        onEnregistrer={vi.fn()}
        onRetirerSurcharge={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Disponibilité')).toHaveValue('disponible');
  });

  it("retombe sur 'present' quand ni surcharge ni disponibilité de journée ne sont fournies", () => {
    render(
      <ActiviteOverrideControl
        activite={activite}
        onEnregistrer={vi.fn()}
        onRetirerSurcharge={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Disponibilité')).toHaveValue('present');
  });

  it("n'affiche pas le bouton \"Retirer la surcharge\" quand aucune surcharge n'existe", () => {
    render(
      <ActiviteOverrideControl
        activite={activite}
        onEnregistrer={vi.fn()}
        onRetirerSurcharge={vi.fn()}
      />,
    );

    expect(screen.queryByText(/Retirer la surcharge/)).not.toBeInTheDocument();
  });

  it('affiche le bouton "Retirer la surcharge" avec la valeur de repli quand une surcharge existe', () => {
    render(
      <ActiviteOverrideControl
        activite={activite}
        surchargeActuelle={{ statut: 'absent' }}
        statutJourneeParDefaut="disponible"
        onEnregistrer={vi.fn()}
        onRetirerSurcharge={vi.fn()}
      />,
    );

    expect(screen.getByText(/Retirer la surcharge \(revenir à Disponible\)/)).toBeInTheDocument();
  });

  it('appelle onEnregistrer avec le statut sélectionné et le commentaire saisi', () => {
    const onEnregistrer = vi.fn();
    render(
      <ActiviteOverrideControl
        activite={activite}
        onEnregistrer={onEnregistrer}
        onRetirerSurcharge={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Disponibilité'), { target: { value: 'absent' } });
    fireEvent.change(screen.getByLabelText('Commentaire'), { target: { value: 'Indisponible' } });
    fireEvent.click(screen.getByText('Enregistrer'));

    expect(onEnregistrer).toHaveBeenCalledWith('absent', 'Indisponible');
  });

  it('appelle onEnregistrer avec un commentaire undefined quand le champ est vide', () => {
    const onEnregistrer = vi.fn();
    render(
      <ActiviteOverrideControl
        activite={activite}
        onEnregistrer={onEnregistrer}
        onRetirerSurcharge={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('Enregistrer'));

    expect(onEnregistrer).toHaveBeenCalledWith('present', undefined);
  });

  it('appelle onRetirerSurcharge quand le bouton est cliqué', () => {
    const onRetirerSurcharge = vi.fn();
    render(
      <ActiviteOverrideControl
        activite={activite}
        surchargeActuelle={{ statut: 'absent' }}
        onEnregistrer={vi.fn()}
        onRetirerSurcharge={onRetirerSurcharge}
      />,
    );

    fireEvent.click(screen.getByText(/Retirer la surcharge/));

    expect(onRetirerSurcharge).toHaveBeenCalled();
  });

  it('désactive le bouton "Enregistrer" pendant enregistrementEnCours', () => {
    render(
      <ActiviteOverrideControl
        activite={activite}
        onEnregistrer={vi.fn()}
        onRetirerSurcharge={vi.fn()}
        enregistrementEnCours
      />,
    );

    expect(screen.getByText('Enregistrer')).toBeDisabled();
  });

  it('désactive le bouton "Retirer la surcharge" pendant suppressionEnCours', () => {
    render(
      <ActiviteOverrideControl
        activite={activite}
        surchargeActuelle={{ statut: 'absent' }}
        onEnregistrer={vi.fn()}
        onRetirerSurcharge={vi.fn()}
        suppressionEnCours
      />,
    );

    expect(screen.getByText(/Retirer la surcharge/)).toBeDisabled();
  });
});
