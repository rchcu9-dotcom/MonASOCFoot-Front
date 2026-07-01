import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MesDisponibilitesPage } from '../MesDisponibilitesPage';
import { useMesActivitesParColonne } from '../../hooks/useMesActivitesParColonne';
import { useMesDisponibilitesJournee } from '../../hooks/useMesDisponibilitesJournee';
import { useDeclarerDisponibiliteActivite } from '../../hooks/useDeclarerDisponibiliteActivite';
import { useDeclarerDisponibiliteJournee } from '../../hooks/useDeclarerDisponibiliteJournee';
import { useSupprimerDisponibiliteActivite } from '../../hooks/useSupprimerDisponibiliteActivite';
import type { ActiviteColonneDto, DisponibiliteJourneeDto } from '../../api/disponibilites';

vi.mock('../../hooks/useMesActivitesParColonne');
vi.mock('../../hooks/useMesDisponibilitesJournee');
vi.mock('../../hooks/useDeclarerDisponibiliteActivite');
vi.mock('../../hooks/useDeclarerDisponibiliteJournee');
vi.mock('../../hooks/useSupprimerDisponibiliteActivite');

function makeActivite(overrides: Partial<ActiviteColonneDto> = {}): ActiviteColonneDto {
  return {
    id: 'a1',
    date: '2026-07-08',
    heureConvocation: '14:00',
    heureDebut: '15:00',
    label: 'Match A',
    type: 'match',
    ...overrides,
  };
}

function mockColonnes(overrides: Partial<ReturnType<typeof useMesActivitesParColonne>>) {
  vi.mocked(useMesActivitesParColonne).mockReturnValue({
    aTraiter: [],
    renseignees: [],
    isLoading: false,
    isError: false,
    ...overrides,
  });
}

function mockDispoJournee(overrides: Partial<ReturnType<typeof useMesDisponibilitesJournee>> = {}) {
  vi.mocked(useMesDisponibilitesJournee).mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
    ...overrides,
  } as ReturnType<typeof useMesDisponibilitesJournee>);
}

function mockMutationHooks() {
  const declarerActiviteMutate = vi.fn();
  const declarerJourneeMutate = vi.fn();
  const supprimerMutate = vi.fn();

  vi.mocked(useDeclarerDisponibiliteActivite).mockReturnValue({
    mutate: declarerActiviteMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useDeclarerDisponibiliteActivite>);

  vi.mocked(useDeclarerDisponibiliteJournee).mockReturnValue({
    mutate: declarerJourneeMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useDeclarerDisponibiliteJournee>);

  vi.mocked(useSupprimerDisponibiliteActivite).mockReturnValue({
    mutate: supprimerMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useSupprimerDisponibiliteActivite>);

  return { declarerActiviteMutate, declarerJourneeMutate, supprimerMutate };
}

describe('MesDisponibilitesPage', () => {
  beforeEach(() => {
    vi.mocked(useMesActivitesParColonne).mockReset();
    vi.mocked(useMesDisponibilitesJournee).mockReset();
    vi.mocked(useDeclarerDisponibiliteActivite).mockReset();
    vi.mocked(useDeclarerDisponibiliteJournee).mockReset();
    vi.mocked(useSupprimerDisponibiliteActivite).mockReset();
    mockMutationHooks();
    mockDispoJournee();
  });

  it('affiche le message de chargement quand isLoading est vrai, sans colonnes', () => {
    mockColonnes({ isLoading: true });

    render(<MesDisponibilitesPage />);

    expect(screen.getByText(/Chargement des activités à venir/)).toBeInTheDocument();
    expect(screen.queryByText('À renseigner')).not.toBeInTheDocument();
  });

  it("affiche un message d'erreur quand isError est vrai, sans colonnes", () => {
    mockColonnes({ isError: true });

    render(<MesDisponibilitesPage />);

    expect(screen.getByText(/Impossible de charger les activités à venir/)).toBeInTheDocument();
    expect(screen.queryByText('À renseigner')).not.toBeInTheDocument();
  });

  it('affiche les deux colonnes "À renseigner" et "Mes disponibilités" avec leurs lignes respectives', () => {
    const activiteATraiter = makeActivite({ id: 'a1', label: 'AG annuelle', date: '2026-07-05' });
    const activiteRenseignee = makeActivite({ id: 'a2', label: 'Match B', date: '2026-07-10' });

    mockColonnes({
      aTraiter: [
        { activite: activiteATraiter, disponibilite: { statut: 'autre', source: 'aucune' } },
      ],
      renseignees: [
        {
          activite: activiteRenseignee,
          disponibilite: { statut: 'present', source: 'journee' },
        },
      ],
    });

    render(<MesDisponibilitesPage />);

    expect(screen.getByRole('heading', { level: 2, name: 'À renseigner' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Mes disponibilités' })).toBeInTheDocument();
    expect(screen.getByText('AG annuelle')).toBeInTheDocument();
    expect(screen.getByText('Match B')).toBeInTheDocument();
  });

  it('ouvre la modale avec les bonnes props au clic sur une carte de la colonne "À renseigner"', () => {
    const activiteATraiter = makeActivite({ id: 'a1', label: 'AG annuelle' });

    mockColonnes({
      aTraiter: [
        { activite: activiteATraiter, disponibilite: { statut: 'autre', source: 'aucune' } },
      ],
    });

    render(<MesDisponibilitesPage />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('AG annuelle'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // Le titre de la modale reprend le label de l'activité sélectionnée.
    expect(screen.getAllByText('AG annuelle').length).toBeGreaterThan(0);
  });

  it('ouvre la modale avec les bonnes props au clic sur une carte de la colonne "Mes disponibilités"', () => {
    const activiteRenseignee = makeActivite({ id: 'a2', label: 'Match B' });

    mockColonnes({
      renseignees: [
        {
          activite: activiteRenseignee,
          disponibilite: { statut: 'present', source: 'journee' },
        },
      ],
    });

    render(<MesDisponibilitesPage />);

    fireEvent.click(screen.getByText('Match B'));

    const dialog = screen.getByRole('dialog');
    // Pré-remplissage : statut "present" actif dans le sélecteur de la modale (scope sur le dialog
    // pour éviter la collision avec le badge "Présent" affiché sur la carte de la colonne).
    expect(within(dialog).getByText('Présent').closest('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('ferme la modale après un clic sur "Annuler"', () => {
    const activiteATraiter = makeActivite({ id: 'a1', label: 'AG annuelle' });
    mockColonnes({
      aTraiter: [
        { activite: activiteATraiter, disponibilite: { statut: 'autre', source: 'aucune' } },
      ],
    });

    render(<MesDisponibilitesPage />);
    fireEvent.click(screen.getByText('AG annuelle'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Annuler'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  describe('non-régression saisie-disponibilite-journee / saisie-disponibilite-activite', () => {
    it('saisie initiale via journée : clic sur une activité non renseignée puis Enregistrer appelle useDeclarerDisponibiliteJournee sur activite.date', () => {
      const { declarerJourneeMutate } = mockMutationHooks();
      const activiteATraiter = makeActivite({ id: 'a1', label: 'AG annuelle', date: '2026-07-05' });
      mockColonnes({
        aTraiter: [
          { activite: activiteATraiter, disponibilite: { statut: 'autre', source: 'aucune' } },
        ],
      });

      render(<MesDisponibilitesPage />);
      fireEvent.click(screen.getByText('AG annuelle'));
      fireEvent.click(screen.getByText('Disponible').closest('button')!);
      fireEvent.click(screen.getByText('Enregistrer'));

      expect(declarerJourneeMutate).toHaveBeenCalledWith(
        { date: '2026-07-05', dto: { statut: 'disponible', commentaire: undefined } },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });

    it("saisie initiale via activité : cocher le toggle d'affinage puis Enregistrer appelle useDeclarerDisponibiliteActivite sur activite.id", () => {
      const { declarerActiviteMutate } = mockMutationHooks();
      const activiteATraiter = makeActivite({ id: 'a1', label: 'AG annuelle', date: '2026-07-05' });
      mockColonnes({
        aTraiter: [
          { activite: activiteATraiter, disponibilite: { statut: 'autre', source: 'aucune' } },
        ],
      });

      render(<MesDisponibilitesPage />);
      fireEvent.click(screen.getByText('AG annuelle'));
      fireEvent.click(screen.getByRole('checkbox'));
      fireEvent.click(screen.getByText('Absent').closest('button')!);
      fireEvent.click(screen.getByText('Enregistrer'));

      expect(declarerActiviteMutate).toHaveBeenCalledWith(
        { activiteId: 'a1', dto: { statut: 'absent', commentaire: undefined } },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });

    it('édition d\'une dispo de journée existante : pré-remplit depuis la disponibilité effective et soumet via useDeclarerDisponibiliteJournee', () => {
      const { declarerJourneeMutate } = mockMutationHooks();
      const activiteRenseignee = makeActivite({ id: 'a2', label: 'Match B', date: '2026-07-10' });
      mockColonnes({
        renseignees: [
          {
            activite: activiteRenseignee,
            disponibilite: { statut: 'disponible', source: 'journee', commentaire: 'Dispo' },
          },
        ],
      });

      render(<MesDisponibilitesPage />);
      fireEvent.click(screen.getByText('Match B'));

      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText('Disponible').closest('button')).toHaveAttribute(
        'aria-pressed',
        'true',
      );

      fireEvent.click(within(dialog).getByText('Présent').closest('button')!);
      fireEvent.click(screen.getByText('Enregistrer'));

      expect(declarerJourneeMutate).toHaveBeenCalledWith(
        { date: '2026-07-10', dto: { statut: 'present', commentaire: 'Dispo' } },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });

    it("édition d'une surcharge d'activité existante : pré-remplit depuis la surcharge et soumet via useDeclarerDisponibiliteActivite, case cochée", () => {
      const { declarerActiviteMutate } = mockMutationHooks();
      const activiteRenseignee = makeActivite({ id: 'a2', label: 'Match B', date: '2026-07-10' });
      mockColonnes({
        renseignees: [
          {
            activite: activiteRenseignee,
            disponibilite: { statut: 'absent', source: 'activite', commentaire: 'Blessé' },
          },
        ],
      });

      render(<MesDisponibilitesPage />);
      fireEvent.click(screen.getByText('Match B'));

      expect(screen.getByRole('checkbox')).toBeChecked();

      fireEvent.click(screen.getByText('Présent').closest('button')!);
      fireEvent.click(screen.getByText('Enregistrer'));

      expect(declarerActiviteMutate).toHaveBeenCalledWith(
        { activiteId: 'a2', dto: { statut: 'present', commentaire: 'Blessé' } },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });

    it("retrait d'une surcharge d'activité : décocher la case puis Enregistrer appelle useSupprimerDisponibiliteActivite sur activite.id (retour à la valeur de journée par défaut)", () => {
      const { supprimerMutate } = mockMutationHooks();
      const activiteRenseignee = makeActivite({ id: 'a2', label: 'Match B', date: '2026-07-10' });
      const dispoJourneeActuelle: DisponibiliteJourneeDto = {
        id: 'dj-1',
        utilisateurId: 'user-1',
        date: '2026-07-10',
        statut: 'disponible',
      };
      mockColonnes({
        renseignees: [
          {
            activite: activiteRenseignee,
            disponibilite: { statut: 'absent', source: 'activite', commentaire: 'Blessé' },
          },
        ],
      });
      mockDispoJournee({ data: [dispoJourneeActuelle] } as ReturnType<typeof useMesDisponibilitesJournee>);

      render(<MesDisponibilitesPage />);
      fireEvent.click(screen.getByText('Match B'));
      fireEvent.click(screen.getByRole('checkbox'));
      fireEvent.click(screen.getByText('Enregistrer'));

      expect(supprimerMutate).toHaveBeenCalledWith(
        { activiteId: 'a2' },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });
  });
});
