import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminUtilisateursPage } from '../AdminUtilisateursPage';
import { useAuth } from '../../auth/AuthContext';
import { useUtilisateurs } from '../../hooks/useUtilisateurs';
import { useModifierRoleUtilisateur } from '../../hooks/useModifierRoleUtilisateur';
import type { UtilisateurDto } from '../../api/users';

vi.mock('../../auth/AuthContext');
vi.mock('../../hooks/useUtilisateurs');
vi.mock('../../hooks/useModifierRoleUtilisateur');

const utilisateur: UtilisateurDto = {
  id: 'u1',
  providerId: 'provider-1',
  provider: 'google',
  displayName: 'Joueur Un',
  email: 'joueur@example.com',
  role: 'joueur',
  dateApparition: '2026-01-01T00:00:00.000Z',
};

function mockAuth(overrides: Partial<ReturnType<typeof useAuth>> = {}) {
  vi.mocked(useAuth).mockReturnValue({
    user: { id: 'admin-connecte', providerId: 'p1', provider: 'dev', displayName: 'Admin', role: 'admin' },
    loading: false,
    googleLoginUrl: 'http://localhost:3020/auth/google',
    devLogin: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
    ...overrides,
  });
}

function mockUseUtilisateurs(overrides: Partial<ReturnType<typeof useUtilisateurs>> = {}) {
  vi.mocked(useUtilisateurs).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    ...overrides,
  } as ReturnType<typeof useUtilisateurs>);
}

describe('AdminUtilisateursPage', () => {
  let mutate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.mocked(useUtilisateurs).mockReset();
    mockAuth();
    mutate = vi.fn();
    vi.mocked(useModifierRoleUtilisateur).mockReturnValue({
      mutate,
      isPending: false,
      variables: undefined,
    } as unknown as ReturnType<typeof useModifierRoleUtilisateur>);
  });

  it('affiche le message de chargement pendant isLoading, sans tableau', () => {
    mockUseUtilisateurs({ isLoading: true });

    render(<AdminUtilisateursPage />);

    expect(screen.getByText('Chargement des utilisateurs…')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it("affiche un message d'erreur quand isError est vrai", () => {
    mockUseUtilisateurs({ isError: true });

    render(<AdminUtilisateursPage />);

    expect(screen.getByText('Impossible de charger les utilisateurs.')).toBeInTheDocument();
  });

  it('affiche le tableau des utilisateurs en succès', () => {
    mockUseUtilisateurs({ data: [utilisateur] });

    render(<AdminUtilisateursPage />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Joueur Un')).toBeInTheDocument();
  });

  it("désactive le sélecteur de l'admin connecté (idUtilisateurConnecte transmis depuis useAuth)", () => {
    const adminConnecte: UtilisateurDto = {
      ...utilisateur,
      id: 'admin-connecte',
      displayName: 'Admin',
      role: 'admin',
    };
    mockUseUtilisateurs({ data: [adminConnecte] });

    render(<AdminUtilisateursPage />);

    expect(screen.getByRole('combobox', { name: 'Rôle de Admin' })).toBeDisabled();
  });

  it('appelle la mutation avec id et role quand on change le rôle dans le tableau', () => {
    mockUseUtilisateurs({ data: [utilisateur] });

    render(<AdminUtilisateursPage />);
    const select = screen.getByRole('combobox', { name: 'Rôle de Joueur Un' });
    fireEvent.change(select, { target: { value: 'admin' } });

    expect(mutate).toHaveBeenCalledWith({ id: 'u1', role: 'admin' }, expect.anything());
  });

  it("affiche l'erreur renvoyée par la mutation (ex: rejet de l'auto-démotion)", () => {
    mutate.mockImplementation((_vars, { onError }) =>
      onError(new Error('Un admin ne peut pas retirer son propre rôle admin')),
    );
    mockUseUtilisateurs({ data: [utilisateur] });

    render(<AdminUtilisateursPage />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Rôle de Joueur Un' }), {
      target: { value: 'admin' },
    });

    expect(screen.getByText('Un admin ne peut pas retirer son propre rôle admin')).toBeInTheDocument();
  });

  it('désactive le sélecteur de la ligne dont la mutation est en cours (idEnCours dérivé de mutation.variables)', () => {
    vi.mocked(useModifierRoleUtilisateur).mockReturnValue({
      mutate,
      isPending: true,
      variables: { id: 'u1', role: 'admin' },
    } as unknown as ReturnType<typeof useModifierRoleUtilisateur>);
    mockUseUtilisateurs({ data: [utilisateur] });

    render(<AdminUtilisateursPage />);

    expect(screen.getByRole('combobox', { name: 'Rôle de Joueur Un' })).toBeDisabled();
  });

  it("ne désactive aucune ligne pour cause de mutation en cours quand isPending est faux", () => {
    mockUseUtilisateurs({ data: [utilisateur] });

    render(<AdminUtilisateursPage />);

    expect(screen.getByRole('combobox', { name: 'Rôle de Joueur Un' })).not.toBeDisabled();
  });
});
