import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminActivitesPage } from '../AdminActivitesPage';
import { useActivites } from '../../hooks/useActivites';
import { useCreerActivite } from '../../hooks/useCreerActivite';
import { useImporterMatchsDistrict } from '../../hooks/useImporterMatchsDistrict';
import { useModifierActivite } from '../../hooks/useModifierActivite';
import { useSupprimerActivite } from '../../hooks/useSupprimerActivite';
import type { ActiviteDto, ImportMatchsResultatDto } from '../../api/activites';

vi.mock('../../hooks/useActivites');
vi.mock('../../hooks/useCreerActivite');
vi.mock('../../hooks/useModifierActivite');
vi.mock('../../hooks/useSupprimerActivite');
vi.mock('../../hooks/useImporterMatchsDistrict');

const activite: ActiviteDto = {
  id: 'a1',
  date: '2026-07-01',
  heureConvocation: '14:00',
  heureDebut: '15:00',
  label: 'Match amical',
  type: 'match',
  source: 'manuel',
};

function mockUseActivites(overrides: Partial<ReturnType<typeof useActivites>> = {}) {
  vi.mocked(useActivites).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    ...overrides,
  } as ReturnType<typeof useActivites>);
}

function mockUseImporterMatchsDistrict(
  mutate: ReturnType<typeof vi.fn>,
  overrides: Partial<ReturnType<typeof useImporterMatchsDistrict>> = {},
) {
  vi.mocked(useImporterMatchsDistrict).mockReturnValue({
    mutate,
    isPending: false,
    ...overrides,
  } as unknown as ReturnType<typeof useImporterMatchsDistrict>);
}

describe('AdminActivitesPage', () => {
  let creerMutate: ReturnType<typeof vi.fn>;
  let modifierMutate: ReturnType<typeof vi.fn>;
  let supprimerMutate: ReturnType<typeof vi.fn>;
  let importerMutate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.mocked(useActivites).mockReset();
    creerMutate = vi.fn();
    modifierMutate = vi.fn();
    supprimerMutate = vi.fn();
    importerMutate = vi.fn();
    vi.mocked(useCreerActivite).mockReturnValue({
      mutate: creerMutate,
    } as unknown as ReturnType<typeof useCreerActivite>);
    vi.mocked(useModifierActivite).mockReturnValue({
      mutate: modifierMutate,
    } as unknown as ReturnType<typeof useModifierActivite>);
    vi.mocked(useSupprimerActivite).mockReturnValue({
      mutate: supprimerMutate,
    } as unknown as ReturnType<typeof useSupprimerActivite>);
    mockUseImporterMatchsDistrict(importerMutate);
  });

  it('affiche le message de chargement pendant isLoading, sans liste', () => {
    mockUseActivites({ isLoading: true });

    render(<AdminActivitesPage />);

    expect(screen.getByText('Chargement des activités…')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it("affiche un message d'erreur quand isError est vrai", () => {
    mockUseActivites({ isError: true });

    render(<AdminActivitesPage />);

    expect(screen.getByText('Impossible de charger les activités.')).toBeInTheDocument();
  });

  it('affiche la liste des activités et le bouton "Nouvelle activité" en succès', () => {
    mockUseActivites({ data: [activite] });

    render(<AdminActivitesPage />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nouvelle activité' })).toBeInTheDocument();
  });

  it('ouvre le formulaire en mode création quand on clique sur "Nouvelle activité"', () => {
    mockUseActivites({ data: [activite] });

    render(<AdminActivitesPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Nouvelle activité' }));

    expect(screen.getByRole('button', { name: 'Créer' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Nouvelle activité' })).not.toBeInTheDocument();
  });

  it('soumet la création via useCreerActivite et ferme le formulaire en cas de succès', () => {
    creerMutate.mockImplementation((_values, { onSuccess }) => onSuccess());
    mockUseActivites({ data: [] });

    render(<AdminActivitesPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Nouvelle activité' }));
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-08-01' } });
    fireEvent.change(screen.getByLabelText('Heure de convocation'), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText('Heure de début'), { target: { value: '11:00' } });
    fireEvent.change(screen.getByLabelText('Label'), { target: { value: 'Entraînement' } });
    fireEvent.click(screen.getByRole('button', { name: 'Créer' }));

    expect(creerMutate).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Créer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nouvelle activité' })).toBeInTheDocument();
  });

  it("affiche l'erreur renvoyée par la mutation de création sans fermer le formulaire", () => {
    creerMutate.mockImplementation((_values, { onError }) => onError(new Error('Accès refusé')));
    mockUseActivites({ data: [] });

    render(<AdminActivitesPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Nouvelle activité' }));
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-08-01' } });
    fireEvent.change(screen.getByLabelText('Heure de convocation'), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText('Heure de début'), { target: { value: '11:00' } });
    fireEvent.change(screen.getByLabelText('Label'), { target: { value: 'Entraînement' } });
    fireEvent.click(screen.getByRole('button', { name: 'Créer' }));

    expect(screen.getByText('Accès refusé')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Créer' })).toBeInTheDocument();
  });

  it('ouvre le formulaire prérempli en mode édition quand on clique sur "Modifier"', () => {
    mockUseActivites({ data: [activite] });

    render(<AdminActivitesPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));

    expect(screen.getByLabelText('Label')).toHaveValue('Match amical');
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeInTheDocument();
  });

  it("soumet la modification via useModifierActivite avec l'id de l'activité en édition", () => {
    modifierMutate.mockImplementation((_vars, { onSuccess }) => onSuccess());
    mockUseActivites({ data: [activite] });

    render(<AdminActivitesPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));
    fireEvent.change(screen.getByLabelText('Label'), { target: { value: 'Nouveau label' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(modifierMutate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'a1', dto: expect.objectContaining({ label: 'Nouveau label' }) }),
      expect.anything(),
    );
  });

  it('ouvre une confirmation quand on clique sur "Supprimer", sans appeler la mutation immédiatement', () => {
    mockUseActivites({ data: [activite] });

    render(<AdminActivitesPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }));

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(supprimerMutate).not.toHaveBeenCalled();
  });

  it('appelle useSupprimerActivite avec l\'id quand on confirme la suppression', () => {
    supprimerMutate.mockImplementation((_id, { onSuccess }) => onSuccess());
    mockUseActivites({ data: [activite] });

    render(<AdminActivitesPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }));

    expect(supprimerMutate).toHaveBeenCalledWith('a1', expect.anything());
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('annule la suppression sans appeler la mutation quand on clique sur "Annuler" du dialogue', () => {
    mockUseActivites({ data: [activite] });

    render(<AdminActivitesPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));

    expect(supprimerMutate).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  describe('import des matchs du district', () => {
    it('déclenche useImporterMatchsDistrict quand on clique sur le bouton d\'import', () => {
      mockUseActivites({ data: [] });

      render(<AdminActivitesPage />);
      fireEvent.click(screen.getByRole('button', { name: 'Importer les matchs du district' }));

      expect(importerMutate).toHaveBeenCalledWith(undefined, expect.anything());
    });

    it('affiche le résumé du résultat en cas de succès', () => {
      const resultat: ImportMatchsResultatDto = {
        matchsRecuperes: 5,
        crees: 2,
        misAJour: 1,
        ignores: 2,
        erreurs: [],
      };
      importerMutate.mockImplementation((_vars, { onSuccess }) => onSuccess(resultat));
      mockUseActivites({ data: [] });

      render(<AdminActivitesPage />);
      fireEvent.click(screen.getByRole('button', { name: 'Importer les matchs du district' }));

      expect(
        screen.getByText(
          'Import terminé : 5 match(s) récupéré(s), 2 créé(s), 1 mis à jour, 2 ignoré(s) (déjà saisis manuellement)',
        ),
      ).toBeInTheDocument();
    });

    it('affiche le détail des erreurs individuelles dans le résumé du résultat', () => {
      const resultat: ImportMatchsResultatDto = {
        matchsRecuperes: 2,
        crees: 1,
        misAJour: 0,
        ignores: 0,
        erreurs: ['Match d1: erreur de persistance'],
      };
      importerMutate.mockImplementation((_vars, { onSuccess }) => onSuccess(resultat));
      mockUseActivites({ data: [] });

      render(<AdminActivitesPage />);
      fireEvent.click(screen.getByRole('button', { name: 'Importer les matchs du district' }));

      expect(screen.getByText(/Import terminé/).textContent).toContain(
        '— 1 erreur(s) : Match d1: erreur de persistance',
      );
    });

    it("affiche le message d'erreur de la mutation sans afficher de résumé en cas d'échec", () => {
      importerMutate.mockImplementation((_vars, { onError }) => onError(new Error('Import indisponible')));
      mockUseActivites({ data: [] });

      render(<AdminActivitesPage />);
      fireEvent.click(screen.getByRole('button', { name: 'Importer les matchs du district' }));

      expect(screen.getByText('Import indisponible')).toBeInTheDocument();
      expect(screen.queryByText(/Import terminé/)).not.toBeInTheDocument();
    });

    it('désactive le bouton et affiche "Import en cours…" pendant isPending', () => {
      mockUseImporterMatchsDistrict(importerMutate, { isPending: true });
      mockUseActivites({ data: [] });

      render(<AdminActivitesPage />);

      const bouton = screen.getByRole('button', { name: 'Import en cours…' });
      expect(bouton).toBeDisabled();
    });

    it("réinitialise l'erreur affichée et le résumé précédent au moment de relancer un import", () => {
      const resultat: ImportMatchsResultatDto = {
        matchsRecuperes: 1,
        crees: 1,
        misAJour: 0,
        ignores: 0,
        erreurs: [],
      };
      importerMutate
        .mockImplementationOnce((_vars, { onSuccess }) => onSuccess(resultat))
        .mockImplementationOnce(() => {});
      mockUseActivites({ data: [] });

      render(<AdminActivitesPage />);
      const bouton = screen.getByRole('button', { name: 'Importer les matchs du district' });
      fireEvent.click(bouton);
      expect(screen.getByText(/Import terminé/)).toBeInTheDocument();

      fireEvent.click(bouton);

      expect(screen.queryByText(/Import terminé/)).not.toBeInTheDocument();
    });
  });
});
