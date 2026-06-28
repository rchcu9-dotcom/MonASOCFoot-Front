import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchDisponibilitesEffectif } from '../disponibilites';
import { authFetch } from '../authFetch';

vi.mock('../authFetch');

function mockResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

describe('fetchDisponibilitesEffectif', () => {
  beforeEach(() => {
    vi.mocked(authFetch).mockReset();
  });

  it('appelle authFetch sur /disponibilites/effectif sans query string quand aucun paramètre n\'est fourni', async () => {
    vi.mocked(authFetch).mockResolvedValue(mockResponse({ activites: [], joueurs: [] }));

    await fetchDisponibilitesEffectif();

    expect(authFetch).toHaveBeenCalledWith('http://localhost:3020/disponibilites/effectif');
  });

  it('ajoute le query param "date" quand seul "date" est fourni', async () => {
    vi.mocked(authFetch).mockResolvedValue(mockResponse({ activites: [], joueurs: [] }));

    await fetchDisponibilitesEffectif({ date: '2026-07-01' });

    expect(authFetch).toHaveBeenCalledWith(
      'http://localhost:3020/disponibilites/effectif?date=2026-07-01',
    );
  });

  it('ajoute le query param "activiteId" quand seul "activiteId" est fourni', async () => {
    vi.mocked(authFetch).mockResolvedValue(mockResponse({ activites: [], joueurs: [] }));

    await fetchDisponibilitesEffectif({ activiteId: 'activite-42' });

    expect(authFetch).toHaveBeenCalledWith(
      'http://localhost:3020/disponibilites/effectif?activiteId=activite-42',
    );
  });

  it('priorise "activiteId" sur "date" quand les deux sont fournis (un seul query param transmis)', async () => {
    vi.mocked(authFetch).mockResolvedValue(mockResponse({ activites: [], joueurs: [] }));

    await fetchDisponibilitesEffectif({ date: '2026-07-01', activiteId: 'activite-42' });

    expect(authFetch).toHaveBeenCalledWith(
      'http://localhost:3020/disponibilites/effectif?activiteId=activite-42',
    );
  });

  it('renvoie le JSON parsé quand la réponse est ok', async () => {
    const body = { activites: [], joueurs: [{ utilisateurId: 'u1', displayName: 'Joueur', disponibilites: {} }] };
    vi.mocked(authFetch).mockResolvedValue(mockResponse(body));

    const result = await fetchDisponibilitesEffectif();

    expect(result).toEqual(body);
  });

  it("lève une erreur quand la réponse n'est pas ok", async () => {
    vi.mocked(authFetch).mockResolvedValue(mockResponse(null, false, 500));

    await expect(fetchDisponibilitesEffectif()).rejects.toThrow(/Erreur 500/);
  });

  it('ne réalise aucune requête autre que celle déclenchée par authFetch en GET implicite (pas de méthode PUT/POST/DELETE)', async () => {
    vi.mocked(authFetch).mockResolvedValue(mockResponse({ activites: [], joueurs: [] }));

    await fetchDisponibilitesEffectif();

    const [, init] = vi.mocked(authFetch).mock.calls[0];
    expect(init).toBeUndefined();
  });
});
