import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchDisponibilitesEffectif,
  declarerDisponibiliteActivite,
  supprimerDisponibiliteActivite,
  declarerDisponibiliteJournee,
  fetchMesDisponibilitesJournee,
} from '../disponibilites';
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

describe('declarerDisponibiliteActivite', () => {
  beforeEach(() => {
    vi.mocked(authFetch).mockReset();
  });

  it('appelle authFetch en PUT sur /disponibilites/activite/:activiteId avec le DTO en JSON', async () => {
    const dto = { statut: 'present' as const, commentaire: 'Je viens' };
    vi.mocked(authFetch).mockResolvedValue(mockResponse({
      id: 'dispo-1',
      utilisateurId: 'u1',
      activiteId: 'activite-1',
      statut: 'present',
      commentaire: 'Je viens',
    }));

    await declarerDisponibiliteActivite('activite-1', dto);

    expect(authFetch).toHaveBeenCalledWith('http://localhost:3020/disponibilites/activite/activite-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
  });

  it('renvoie le JSON parsé quand la réponse est ok', async () => {
    const body = { id: 'dispo-1', utilisateurId: 'u1', activiteId: 'activite-1', statut: 'absent' };
    vi.mocked(authFetch).mockResolvedValue(mockResponse(body));

    const result = await declarerDisponibiliteActivite('activite-1', { statut: 'absent' });

    expect(result).toEqual(body);
  });

  it('lève une erreur avec le message du corps de réponse quand la réponse n\'est pas ok', async () => {
    vi.mocked(authFetch).mockResolvedValue(
      mockResponse({ message: 'Activité introuvable' }, false, 404),
    );

    await expect(declarerDisponibiliteActivite('activite-inconnue', { statut: 'absent' })).rejects.toThrow(
      'Activité introuvable',
    );
  });

  it('lève une erreur générique quand la réponse n\'est pas ok et ne contient pas de message', async () => {
    vi.mocked(authFetch).mockResolvedValue(mockResponse(null, false, 500));

    await expect(declarerDisponibiliteActivite('activite-1', { statut: 'absent' })).rejects.toThrow(
      /500/,
    );
  });
});

describe('supprimerDisponibiliteActivite', () => {
  beforeEach(() => {
    vi.mocked(authFetch).mockReset();
  });

  it('appelle authFetch en DELETE sur /disponibilites/activite/:activiteId sans query string quand aucun utilisateurId n\'est fourni', async () => {
    vi.mocked(authFetch).mockResolvedValue(mockResponse(null, true, 204));

    await supprimerDisponibiliteActivite('activite-1');

    expect(authFetch).toHaveBeenCalledWith('http://localhost:3020/disponibilites/activite/activite-1', {
      method: 'DELETE',
    });
  });

  it('ajoute le query param "utilisateurId" quand il est fourni (cas admin ciblant un autre utilisateur)', async () => {
    vi.mocked(authFetch).mockResolvedValue(mockResponse(null, true, 204));

    await supprimerDisponibiliteActivite('activite-1', 'joueur-cible');

    expect(authFetch).toHaveBeenCalledWith(
      'http://localhost:3020/disponibilites/activite/activite-1?utilisateurId=joueur-cible',
      { method: 'DELETE' },
    );
  });

  it('lève une erreur avec le message du corps de réponse quand la réponse n\'est pas ok', async () => {
    vi.mocked(authFetch).mockResolvedValue(
      mockResponse({ message: "Aucune surcharge de disponibilité pour l'activité activite-1" }, false, 404),
    );

    await expect(supprimerDisponibiliteActivite('activite-1')).rejects.toThrow(/Aucune surcharge/);
  });

  it('ne lève aucune erreur quand la réponse est ok (204 sans corps)', async () => {
    vi.mocked(authFetch).mockResolvedValue(mockResponse(null, true, 204));

    await expect(supprimerDisponibiliteActivite('activite-1')).resolves.toBeUndefined();
  });
});

describe('declarerDisponibiliteJournee', () => {
  beforeEach(() => {
    vi.mocked(authFetch).mockReset();
  });

  it('appelle authFetch en PUT sur /disponibilites/journee/:date avec le DTO en JSON', async () => {
    const dto = { statut: 'present' as const, commentaire: 'Je viens' };
    vi.mocked(authFetch).mockResolvedValue(mockResponse({
      id: 'dispo-journee-1',
      utilisateurId: 'u1',
      date: '2026-07-01',
      statut: 'present',
      commentaire: 'Je viens',
    }));

    await declarerDisponibiliteJournee('2026-07-01', dto);

    expect(authFetch).toHaveBeenCalledWith('http://localhost:3020/disponibilites/journee/2026-07-01', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
  });

  it('renvoie le JSON parsé quand la réponse est ok', async () => {
    const body = { id: 'dispo-journee-1', utilisateurId: 'u1', date: '2026-07-01', statut: 'absent' };
    vi.mocked(authFetch).mockResolvedValue(mockResponse(body));

    const result = await declarerDisponibiliteJournee('2026-07-01', { statut: 'absent' });

    expect(result).toEqual(body);
  });

  it('lève une erreur avec le message du corps de réponse quand la réponse n\'est pas ok (ex: 403 joueur ciblant un autre utilisateur)', async () => {
    vi.mocked(authFetch).mockResolvedValue(
      mockResponse(
        { message: "Seul un admin peut modifier la disponibilité d'un autre utilisateur" },
        false,
        403,
      ),
    );

    await expect(
      declarerDisponibiliteJournee('2026-07-01', { statut: 'absent', utilisateurId: 'autre-joueur' }),
    ).rejects.toThrow(/Seul un admin peut modifier/);
  });

  it('lève une erreur générique quand la réponse n\'est pas ok et ne contient pas de message', async () => {
    vi.mocked(authFetch).mockResolvedValue(mockResponse(null, false, 500));

    await expect(declarerDisponibiliteJournee('2026-07-01', { statut: 'absent' })).rejects.toThrow(
      /500/,
    );
  });
});

describe('fetchMesDisponibilitesJournee', () => {
  beforeEach(() => {
    vi.mocked(authFetch).mockReset();
  });

  it('appelle authFetch en GET implicite sur /disponibilites/journee/mes-disponibilites', async () => {
    vi.mocked(authFetch).mockResolvedValue(mockResponse([]));

    await fetchMesDisponibilitesJournee();

    expect(authFetch).toHaveBeenCalledWith(
      'http://localhost:3020/disponibilites/journee/mes-disponibilites',
    );
  });

  it('renvoie le tableau JSON parsé quand la réponse est ok', async () => {
    const body = [
      { id: 'd1', utilisateurId: 'u1', date: '2026-07-01', statut: 'present' },
      { id: 'd2', utilisateurId: 'u1', date: '2026-07-08', statut: 'absent', commentaire: 'Vacances' },
    ];
    vi.mocked(authFetch).mockResolvedValue(mockResponse(body));

    const result = await fetchMesDisponibilitesJournee();

    expect(result).toEqual(body);
  });

  it("lève une erreur quand la réponse n'est pas ok", async () => {
    vi.mocked(authFetch).mockResolvedValue(mockResponse(null, false, 500));

    await expect(fetchMesDisponibilitesJournee()).rejects.toThrow(/500/);
  });
});
