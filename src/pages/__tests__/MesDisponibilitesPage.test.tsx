import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MesDisponibilitesPage } from '../MesDisponibilitesPage';
import { useAuth } from '../../auth/AuthContext';
import { useDeclarerDisponibiliteActivite } from '../../hooks/useDeclarerDisponibiliteActivite';
import { useDeclarerDisponibiliteJournee } from '../../hooks/useDeclarerDisponibiliteJournee';
import { useDisponibilitesEffectif } from '../../hooks/useDisponibilitesEffectif';
import { useMesDisponibilitesJournee } from '../../hooks/useMesDisponibilitesJournee';
import { useProchainesJourneesAvecActivites } from '../../hooks/useProchainesJourneesAvecActivites';
import { useSupprimerDisponibiliteActivite } from '../../hooks/useSupprimerDisponibiliteActivite';
import type { DisponibilitesEffectifResponseDto } from '../../api/disponibilites';

vi.mock('../../auth/AuthContext');
vi.mock('../../hooks/useDeclarerDisponibiliteActivite');
vi.mock('../../hooks/useDeclarerDisponibiliteJournee');
vi.mock('../../hooks/useDisponibilitesEffectif');
vi.mock('../../hooks/useMesDisponibilitesJournee');
vi.mock('../../hooks/useProchainesJourneesAvecActivites');
vi.mock('../../hooks/useSupprimerDisponibiliteActivite');

const user = {
  id: 'u1',
  providerId: 'joueur@example.com',
  provider: 'dev',
  displayName: 'Jean Joueur',
  role: 'joueur' as const,
};

function mockAuth(overrides: Partial<ReturnType<typeof useAuth>> = {}) {
  vi.mocked(useAuth).mockReturnValue({
    user,
    loading: false,
    googleLoginUrl: 'http://localhost:3020/auth/google',
    devLogin: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
    ...overrides,
  });
}

function mockProchainesJournees(
  overrides: Partial<ReturnType<typeof useProchainesJourneesAvecActivites>> = {},
) {
  vi.mocked(useProchainesJourneesAvecActivites).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    ...overrides,
  });
}

function mockMesDisponibilitesJournee(
  overrides: Partial<ReturnType<typeof useMesDisponibilitesJournee>> = {},
) {
  vi.mocked(useMesDisponibilitesJournee).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    ...overrides,
  } as ReturnType<typeof useMesDisponibilitesJournee>);
}

function mockDisponibilitesEffectif(
  overrides: Partial<ReturnType<typeof useDisponibilitesEffectif>> = {},
) {
  vi.mocked(useDisponibilitesEffectif).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    ...overrides,
  } as ReturnType<typeof useDisponibilitesEffectif>);
}

const activiteUnique = {
  id: 'a1',
  date: '2026-07-01',
  heureConvocation: '14:00',
  heureDebut: '15:00',
  label: 'Match unique',
  type: 'match' as const,
};

const activiteMulti1 = {
  id: 'a2',
  date: '2026-07-08',
  heureConvocation: '09:00',
  heureDebut: '10:00',
  label: 'Match du matin',
  type: 'match' as const,
};

const activiteMulti2 = {
  id: 'a3',
  date: '2026-07-08',
  heureConvocation: '17:00',
  heureDebut: '18:00',
  label: 'AG',
  type: 'autre' as const,
};

describe('MesDisponibilitesPage', () => {
  let declarerJourneeMutate: ReturnType<typeof vi.fn>;
  let declarerActiviteMutate: ReturnType<typeof vi.fn>;
  let supprimerActiviteMutate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.mocked(useAuth).mockReset();
    vi.mocked(useProchainesJourneesAvecActivites).mockReset();
    vi.mocked(useMesDisponibilitesJournee).mockReset();
    vi.mocked(useDisponibilitesEffectif).mockReset();

    declarerJourneeMutate = vi.fn();
    declarerActiviteMutate = vi.fn();
    supprimerActiviteMutate = vi.fn();

    vi.mocked(useDeclarerDisponibiliteJournee).mockReturnValue({
      mutate: declarerJourneeMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useDeclarerDisponibiliteJournee>);
    vi.mocked(useDeclarerDisponibiliteActivite).mockReturnValue({
      mutate: declarerActiviteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useDeclarerDisponibiliteActivite>);
    vi.mocked(useSupprimerDisponibiliteActivite).mockReturnValue({
      mutate: supprimerActiviteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useSupprimerDisponibiliteActivite>);

    mockAuth();
    mockMesDisponibilitesJournee();
    mockDisponibilitesEffectif();
  });

  it('affiche le message de chargement pendant le chargement des journées', () => {
    mockProchainesJournees({ isLoading: true });

    render(<MesDisponibilitesPage />);

    expect(screen.getByText('Chargement des journées à venir…')).toBeInTheDocument();
  });

  it("affiche un message d'erreur quand le chargement des journées échoue", () => {
    mockProchainesJournees({ isError: true });

    render(<MesDisponibilitesPage />);

    expect(screen.getByText('Impossible de charger les journées à venir.')).toBeInTheDocument();
  });

  it("affiche le message d'absence d'activité quand la liste de journées est vide", () => {
    mockProchainesJournees({ data: [] });

    render(<MesDisponibilitesPage />);

    expect(screen.getByText('Aucune activité à venir.')).toBeInTheDocument();
  });

  it('affiche un JourneeDisponibiliteControl par journée à venir', () => {
    mockProchainesJournees({
      data: [
        { date: '2026-07-01', activites: [activiteUnique] },
        { date: '2026-07-08', activites: [activiteMulti1, activiteMulti2] },
      ],
    });

    render(<MesDisponibilitesPage />);

    expect(screen.getAllByText('2026-07-01')).toHaveLength(2); // titre de section + JourneeDisponibiliteControl
    expect(screen.getAllByText('2026-07-08')).toHaveLength(2);
  });

  it('affiche un ActiviteOverrideControl par activité, y compris quand une journée a une seule activité', () => {
    mockProchainesJournees({
      data: [{ date: '2026-07-01', activites: [activiteUnique] }],
    });

    render(<MesDisponibilitesPage />);

    expect(screen.getByText(/15:00 — Match unique \(match\)/)).toBeInTheDocument();
  });

  it('affiche un ActiviteOverrideControl par activité pour une journée multi-activités', () => {
    mockProchainesJournees({
      data: [{ date: '2026-07-08', activites: [activiteMulti1, activiteMulti2] }],
    });

    render(<MesDisponibilitesPage />);

    expect(screen.getByText(/10:00 — Match du matin \(match\)/)).toBeInTheDocument();
    expect(screen.getByText(/18:00 — AG \(autre\)/)).toBeInTheDocument();
  });

  it('préremplit JourneeDisponibiliteControl avec la disponibilité de journée déjà déclarée pour cette date', () => {
    mockProchainesJournees({
      data: [{ date: '2026-07-01', activites: [activiteUnique] }],
    });
    mockMesDisponibilitesJournee({
      data: [{ id: 'd1', utilisateurId: 'u1', date: '2026-07-01', statut: 'absent', commentaire: 'Blessé' }],
    });

    render(<MesDisponibilitesPage />);

    const selects = screen.getAllByLabelText('Disponibilité');
    // Premier select = JourneeDisponibiliteControl (le second appartient à ActiviteOverrideControl).
    expect(selects[0]).toHaveValue('absent');
    expect(screen.getAllByLabelText('Commentaire')[0]).toHaveValue('Blessé');
  });

  it('appelle useDeclarerDisponibiliteJournee.mutate avec date/statut/commentaire au clic sur Enregistrer de la dispo de journée', () => {
    mockProchainesJournees({
      data: [{ date: '2026-07-01', activites: [activiteUnique] }],
    });

    render(<MesDisponibilitesPage />);

    const commentaireJournee = screen.getAllByLabelText('Commentaire')[0];
    fireEvent.change(commentaireJournee, { target: { value: 'Je viens' } });
    fireEvent.click(screen.getAllByText('Enregistrer')[0]);

    expect(declarerJourneeMutate).toHaveBeenCalledWith({
      date: '2026-07-01',
      dto: { statut: 'present', commentaire: 'Je viens' },
    });
  });

  it('appelle useDeclarerDisponibiliteActivite.mutate avec activiteId/statut/commentaire au clic sur Enregistrer du contrôle activité', () => {
    mockProchainesJournees({
      data: [{ date: '2026-07-01', activites: [activiteUnique] }],
    });

    render(<MesDisponibilitesPage />);

    const commentaireActivite = screen.getAllByLabelText('Commentaire')[1];
    fireEvent.change(commentaireActivite, { target: { value: 'Présent au match' } });
    fireEvent.click(screen.getAllByText('Enregistrer')[1]);

    expect(declarerActiviteMutate).toHaveBeenCalledWith({
      activiteId: 'a1',
      dto: { statut: 'present', commentaire: 'Présent au match' },
    });
  });

  it('calcule statutJourneeParDefaut depuis la dispo de journée et le transmet à ActiviteOverrideControl (bouton Retirer affiché en conséquence quand une surcharge existe)', () => {
    mockProchainesJournees({
      data: [{ date: '2026-07-01', activites: [activiteUnique] }],
    });
    mockMesDisponibilitesJournee({
      data: [{ id: 'd1', utilisateurId: 'u1', date: '2026-07-01', statut: 'disponible' }],
    });
    mockDisponibilitesEffectif({
      data: {
        activites: [activiteUnique],
        joueurs: [
          {
            utilisateurId: 'u1',
            displayName: 'Jean Joueur',
            disponibilites: {
              a1: { statut: 'absent', commentaire: 'Blessé', source: 'activite' },
            },
          },
        ],
      } as DisponibilitesEffectifResponseDto,
    });

    render(<MesDisponibilitesPage />);

    expect(screen.getByText(/Retirer la surcharge \(revenir à Disponible\)/)).toBeInTheDocument();
  });

  it('appelle useSupprimerDisponibiliteActivite.mutate avec activiteId au clic sur "Retirer la surcharge"', () => {
    mockProchainesJournees({
      data: [{ date: '2026-07-01', activites: [activiteUnique] }],
    });
    mockDisponibilitesEffectif({
      data: {
        activites: [activiteUnique],
        joueurs: [
          {
            utilisateurId: 'u1',
            displayName: 'Jean Joueur',
            disponibilites: {
              a1: { statut: 'absent', source: 'activite' },
            },
          },
        ],
      } as DisponibilitesEffectifResponseDto,
    });

    render(<MesDisponibilitesPage />);

    fireEvent.click(screen.getByText(/Retirer la surcharge/));

    expect(supprimerActiviteMutate).toHaveBeenCalledWith({ activiteId: 'a1' });
  });
});
