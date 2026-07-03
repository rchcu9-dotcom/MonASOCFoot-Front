import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfilPage } from '../ProfilPage';
import { useAuth } from '../../auth/AuthContext';
import { useModifierMonProfil } from '../../hooks/useModifierMonProfil';

vi.mock('../../auth/AuthContext');
vi.mock('../../hooks/useModifierMonProfil');

function mockAuth(overrides: Partial<ReturnType<typeof useAuth>> = {}) {
  vi.mocked(useAuth).mockReturnValue({
    user: { id: 'u1', providerId: 'p1', provider: 'dev', displayName: 'Joueur Un', role: 'joueur' },
    loading: false,
    googleLoginUrl: 'http://localhost:3020/auth/google',
    devLogin: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
    ...overrides,
  });
}

function mockModifierProfil(overrides: Partial<ReturnType<typeof useModifierMonProfil>> = {}) {
  const mutate = vi.fn();
  vi.mocked(useModifierMonProfil).mockReturnValue({
    mutate,
    isPending: false,
    isSuccess: false,
    ...overrides,
  } as unknown as ReturnType<typeof useModifierMonProfil>);
  return mutate;
}

describe('ProfilPage', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReset();
    vi.mocked(useModifierMonProfil).mockReset();
  });

  it("affiche les champs vides et modifiables quand l'utilisateur n'a rien renseigné", () => {
    mockAuth();
    mockModifierProfil();

    render(<ProfilPage />);

    expect(screen.getByLabelText('Date de naissance')).toHaveValue('');
    expect(screen.getByLabelText('Numéro de licence')).toHaveValue('');
  });

  it('pré-remplit les champs avec les valeurs déjà renseignées par l\'utilisateur', () => {
    mockAuth({
      user: {
        id: 'u1',
        providerId: 'p1',
        provider: 'dev',
        displayName: 'Joueur Un',
        role: 'joueur',
        dateNaissance: '1990-05-12',
        numeroLicence: '12345678',
      },
    });
    mockModifierProfil();

    render(<ProfilPage />);

    expect(screen.getByLabelText('Date de naissance')).toHaveValue('1990-05-12');
    expect(screen.getByLabelText('Numéro de licence')).toHaveValue('12345678');
  });

  it('soumet les deux champs modifiés via useModifierMonProfil', () => {
    mockAuth();
    const mutate = mockModifierProfil();

    render(<ProfilPage />);

    fireEvent.change(screen.getByLabelText('Date de naissance'), { target: { value: '1990-05-12' } });
    fireEvent.change(screen.getByLabelText('Numéro de licence'), { target: { value: '12345678' } });
    fireEvent.click(screen.getByText('Enregistrer'));

    expect(mutate).toHaveBeenCalledWith(
      { dateNaissance: '1990-05-12', numeroLicence: '12345678' },
      expect.objectContaining({ onError: expect.any(Function) }),
    );
  });

  it('soumet avec les deux champs laissés vides (optionnels, aucune contrainte de complétude)', () => {
    mockAuth();
    const mutate = mockModifierProfil();

    render(<ProfilPage />);

    fireEvent.click(screen.getByText('Enregistrer'));

    expect(mutate).toHaveBeenCalledWith(
      { dateNaissance: undefined, numeroLicence: undefined },
      expect.objectContaining({ onError: expect.any(Function) }),
    );
  });

  it('bloque la soumission avec une erreur de validation quand la date de naissance est dans le futur, sans appeler la mutation', () => {
    mockAuth();
    const mutate = mockModifierProfil();
    const demain = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    render(<ProfilPage />);

    fireEvent.change(screen.getByLabelText('Date de naissance'), { target: { value: demain } });
    fireEvent.click(screen.getByText('Enregistrer'));

    expect(screen.getByText('La date de naissance ne peut pas être dans le futur.')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('affiche une confirmation après un enregistrement réussi', () => {
    mockAuth();
    mockModifierProfil({ isSuccess: true });

    render(<ProfilPage />);

    expect(screen.getByText('Profil mis à jour.')).toBeInTheDocument();
  });

  it("affiche le message d'erreur renvoyé par la mutation (ex: rejet 400 depuis le back)", () => {
    mockAuth();
    const mutate = vi.fn((_input: unknown, options?: { onError?: (err: Error) => void }) => {
      options?.onError?.(new Error('La date de naissance ne peut pas être dans le futur'));
    });
    vi.mocked(useModifierMonProfil).mockReturnValue({
      mutate,
      isPending: false,
      isSuccess: false,
    } as unknown as ReturnType<typeof useModifierMonProfil>);

    render(<ProfilPage />);

    fireEvent.click(screen.getByText('Enregistrer'));

    expect(screen.getByText('La date de naissance ne peut pas être dans le futur')).toBeInTheDocument();
  });

  it('désactive le bouton "Enregistrer" pendant la soumission', () => {
    mockAuth();
    mockModifierProfil({ isPending: true });

    render(<ProfilPage />);

    expect(screen.getByText('Enregistrer').closest('button')).toBeDisabled();
  });
});
