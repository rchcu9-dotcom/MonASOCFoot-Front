import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from '../HomePage';
import { useAuth } from '../../auth/AuthContext';
import { useResumeAccueil } from '../../hooks/useResumeAccueil';
import { useMesDisponibilitesJournee } from '../../hooks/useMesDisponibilitesJournee';
import { useDeclarerDisponibiliteActivite } from '../../hooks/useDeclarerDisponibiliteActivite';
import { useDeclarerDisponibiliteJournee } from '../../hooks/useDeclarerDisponibiliteJournee';
import { useSupprimerDisponibiliteActivite } from '../../hooks/useSupprimerDisponibiliteActivite';
import type { ResumeAccueilDto } from '../../api/disponibilites';

vi.mock('../../auth/AuthContext');
vi.mock('../../hooks/useResumeAccueil');
vi.mock('../../hooks/useMesDisponibilitesJournee');
vi.mock('../../hooks/useDeclarerDisponibiliteActivite');
vi.mock('../../hooks/useDeclarerDisponibiliteJournee');
vi.mock('../../hooks/useSupprimerDisponibiliteActivite');

function mockAuth(overrides: Partial<ReturnType<typeof useAuth>> = {}) {
  vi.mocked(useAuth).mockReturnValue({
    user: null,
    loading: false,
    googleLoginUrl: 'http://localhost:3020/auth/google',
    devLogin: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
    ...overrides,
  });
}

function mockUseResumeAccueil(overrides: Partial<ReturnType<typeof useResumeAccueil>> = {}) {
  vi.mocked(useResumeAccueil).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    ...overrides,
  } as ReturnType<typeof useResumeAccueil>);
}

function mockSupportingHooks() {
  vi.mocked(useMesDisponibilitesJournee).mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
  } as unknown as ReturnType<typeof useMesDisponibilitesJournee>);
  vi.mocked(useDeclarerDisponibiliteActivite).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useDeclarerDisponibiliteActivite>);
  vi.mocked(useDeclarerDisponibiliteJournee).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useDeclarerDisponibiliteJournee>);
  vi.mocked(useSupprimerDisponibiliteActivite).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useSupprimerDisponibiliteActivite>);
}

function renderHomePage() {
  return render(<HomePage />, { wrapper: MemoryRouter });
}

const resumeVide: ResumeAccueilDto = {
  prochainesDates: [],
  tableauDeBord: { totalAVenir: 0, renseigneesAVenir: 0, pourcentageRenseignement: 0 },
};

describe('HomePage', () => {
  beforeEach(() => {
    vi.mocked(useResumeAccueil).mockReset();
    mockSupportingHooks();
  });

  it("affiche le titre 'MonASOCFoot' et l'accroche du club quel que soit l'état de connexion", () => {
    mockAuth({ user: null });
    mockUseResumeAccueil();

    renderHomePage();

    expect(screen.getByText('MonASOCFoot')).toBeInTheDocument();
    expect(screen.getByText(/AS Orange Cesson Football/)).toBeInTheDocument();
  });

  describe('visiteur non connecté', () => {
    it("affiche l'invitation à se connecter, sans déclencher la requête du résumé", () => {
      mockAuth({ user: null });
      mockUseResumeAccueil();

      renderHomePage();

      expect(screen.getByText('Connectez-vous pour déclarer vos disponibilités.')).toBeInTheDocument();
      expect(useResumeAccueil).toHaveBeenCalledWith({ enabled: false });
    });

    it("n'affiche ni accroche personnalisée ni état de chargement/erreur/résumé", () => {
      mockAuth({ user: null });
      mockUseResumeAccueil({ isLoading: true });

      renderHomePage();

      expect(screen.queryByText(/Connecté en tant que/)).not.toBeInTheDocument();
      expect(screen.queryByText('Chargement de votre résumé…')).not.toBeInTheDocument();
    });
  });

  describe('utilisateur connecté', () => {
    const user: NonNullable<ReturnType<typeof useAuth>['user']> = {
      id: 'u1',
      providerId: 'joueur@example.com',
      provider: 'dev',
      displayName: 'Jean Joueur',
      role: 'joueur',
    };

    it('affiche le message de connexion et déclenche la requête du résumé', () => {
      mockAuth({ user });
      mockUseResumeAccueil();

      renderHomePage();

      expect(screen.getByText('Connecté en tant que Jean Joueur (joueur).')).toBeInTheDocument();
      expect(useResumeAccueil).toHaveBeenCalledWith({ enabled: true });
    });

    it('affiche un message de chargement pendant isLoading, sans résumé ni erreur', () => {
      mockAuth({ user });
      mockUseResumeAccueil({ isLoading: true });

      renderHomePage();

      expect(screen.getByText('Chargement de votre résumé…')).toBeInTheDocument();
      expect(screen.queryByText('Impossible de charger votre résumé.')).not.toBeInTheDocument();
      expect(screen.queryByText('Mon tableau de bord')).not.toBeInTheDocument();
    });

    it("affiche un message d'erreur quand isError est vrai", () => {
      mockAuth({ user });
      mockUseResumeAccueil({ isError: true });

      renderHomePage();

      expect(screen.getByText('Impossible de charger votre résumé.')).toBeInTheDocument();
    });

    it('délègue le rendu du résumé à ResumeAccueil en cas de succès', () => {
      mockAuth({ user });
      mockUseResumeAccueil({ data: resumeVide });

      renderHomePage();

      expect(screen.getByText('Mon tableau de bord')).toBeInTheDocument();
      expect(screen.getByText('Mes activités à venir')).toBeInTheDocument();
      expect(screen.queryByText('Ma dernière activité')).not.toBeInTheDocument();
    });
  });
});
