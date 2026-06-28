import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchUtilisateurs, modifierRoleUtilisateur, type UtilisateurDto } from '../users';
import { authFetch } from '../authFetch';

vi.mock('../authFetch');

function mockResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

const utilisateur: UtilisateurDto = {
  id: 'u1',
  providerId: 'provider-1',
  provider: 'google',
  displayName: 'Joueur Un',
  email: 'joueur@example.com',
  role: 'joueur',
  dateApparition: '2026-01-01T00:00:00.000Z',
  derniereConnexion: '2026-06-01T00:00:00.000Z',
};

describe('fetchUtilisateurs', () => {
  beforeEach(() => {
    vi.mocked(authFetch).mockReset();
  });

  it('appelle authFetch sur /users en GET', async () => {
    vi.mocked(authFetch).mockResolvedValue(mockResponse([utilisateur]));

    const result = await fetchUtilisateurs();

    expect(authFetch).toHaveBeenCalledWith('http://localhost:3020/users');
    expect(result).toEqual([utilisateur]);
  });

  it("lève une erreur avec le message du body quand la réponse n'est pas ok (ex: 403 non-admin)", async () => {
    vi.mocked(authFetch).mockResolvedValue(mockResponse({ message: 'Forbidden' }, false, 403));

    await expect(fetchUtilisateurs()).rejects.toThrow('Forbidden');
  });

  it("lève une erreur avec un message par défaut quand le body n'est pas exploitable", async () => {
    vi.mocked(authFetch).mockResolvedValue(mockResponse(null, false, 500));

    await expect(fetchUtilisateurs()).rejects.toThrow(
      /Erreur lors de la récupération des utilisateurs \(500\)/,
    );
  });
});

describe('modifierRoleUtilisateur', () => {
  beforeEach(() => {
    vi.mocked(authFetch).mockReset();
  });

  it('appelle authFetch en PATCH sur /users/:id/role avec { role } sérialisé en JSON', async () => {
    const utilisateurModifie = { ...utilisateur, role: 'admin' as const };
    vi.mocked(authFetch).mockResolvedValue(mockResponse(utilisateurModifie));

    const result = await modifierRoleUtilisateur('u1', 'admin');

    expect(authFetch).toHaveBeenCalledWith('http://localhost:3020/users/u1/role', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'admin' }),
    });
    expect(result).toEqual(utilisateurModifie);
  });

  it("lève une erreur avec le message du body quand la réponse n'est pas ok (ex: auto-démotion rejetée en 400)", async () => {
    vi.mocked(authFetch).mockResolvedValue(
      mockResponse({ message: 'Un admin ne peut pas retirer son propre rôle admin' }, false, 400),
    );

    await expect(modifierRoleUtilisateur('u1', 'joueur')).rejects.toThrow(
      'Un admin ne peut pas retirer son propre rôle admin',
    );
  });

  it("lève une erreur avec le message du body quand l'utilisateur cible est introuvable (404)", async () => {
    vi.mocked(authFetch).mockResolvedValue(
      mockResponse({ message: 'Utilisateur inconnu introuvable' }, false, 404),
    );

    await expect(modifierRoleUtilisateur('inconnu', 'admin')).rejects.toThrow(
      'Utilisateur inconnu introuvable',
    );
  });
});
