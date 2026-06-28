import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HomePage } from '../HomePage';
import { useAuth } from '../../auth/AuthContext';
import { useActivites } from '../../hooks/useActivites';
import type { ActiviteDto } from '../../api/activites';

vi.mock('../../auth/AuthContext');
vi.mock('../../hooks/useActivites');

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

function mockUseActivites(overrides: Partial<ReturnType<typeof useActivites>> = {}) {
  vi.mocked(useActivites).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    ...overrides,
  } as ReturnType<typeof useActivites>);
}

const activite: ActiviteDto = {
  id: 'a1',
  date: '2026-07-01',
  heureConvocation: '14:00',
  heureDebut: '15:00',
  label: 'Match amical',
  type: 'match',
  source: 'manuel',
};

describe('HomePage', () => {
  beforeEach(() => {
    vi.mocked(useActivites).mockReset();
  });

  it("affiche le titre 'MonASOCFoot' et l'accroche du club quel que soit l'état de connexion", () => {
    mockAuth({ user: null });
    mockUseActivites();

    render(<HomePage />);

    expect(screen.getByText('MonASOCFoot')).toBeInTheDocument();
    expect(screen.getByText(/AS Orange Cesson Football/)).toBeInTheDocument();
  });

  describe('visiteur non connecté', () => {
    it("affiche l'invitation à se connecter, sans déclencher la requête des activités", () => {
      mockAuth({ user: null });
      mockUseActivites();

      render(<HomePage />);

      expect(screen.getByText('Connectez-vous pour déclarer vos disponibilités.')).toBeInTheDocument();
      expect(useActivites).toHaveBeenCalledWith({ enabled: false });
    });

    it("n'affiche ni accroche personnalisée ni état de chargement/erreur/liste", () => {
      mockAuth({ user: null });
      mockUseActivites({ isLoading: true });

      render(<HomePage />);

      expect(screen.queryByText(/Connecté en tant que/)).not.toBeInTheDocument();
      expect(screen.queryByText('Chargement des activités…')).not.toBeInTheDocument();
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

    it('affiche le message de connexion et déclenche la requête des activités', () => {
      mockAuth({ user });
      mockUseActivites();

      render(<HomePage />);

      expect(screen.getByText('Connecté en tant que Jean Joueur (joueur).')).toBeInTheDocument();
      expect(useActivites).toHaveBeenCalledWith({ enabled: true });
    });

    it('affiche un message de chargement pendant isLoading, sans liste ni erreur', () => {
      mockAuth({ user });
      mockUseActivites({ isLoading: true });

      render(<HomePage />);

      expect(screen.getByText('Chargement des activités…')).toBeInTheDocument();
      expect(screen.queryByText('Impossible de charger les activités.')).not.toBeInTheDocument();
    });

    it("affiche un message d'erreur quand isError est vrai", () => {
      mockAuth({ user });
      mockUseActivites({ isError: true });

      render(<HomePage />);

      expect(screen.getByText('Impossible de charger les activités.')).toBeInTheDocument();
    });

    it('délègue le rendu des activités à ProchainesActivites en cas de succès', () => {
      // Date volontairement très éloignée dans le futur : HomePage ne passe pas de prop
      // `aujourdhui` à ProchainesActivites, qui retombe alors sur la date système réelle.
      const activiteLointaine: ActiviteDto = { ...activite, date: '2099-01-01' };
      mockAuth({ user });
      mockUseActivites({ data: [activiteLointaine] });

      render(<HomePage />);

      expect(screen.getByText('Match amical')).toBeInTheDocument();
    });

    it("affiche le message d'absence d'activité quand la liste est vide", () => {
      mockAuth({ user });
      mockUseActivites({ data: [] });

      render(<HomePage />);

      expect(screen.getByText('Aucune activité à venir.')).toBeInTheDocument();
    });
  });
});
