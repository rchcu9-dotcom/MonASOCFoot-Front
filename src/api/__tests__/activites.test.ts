import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchActivites,
  creerActivite,
  modifierActivite,
  supprimerActivite,
  importerMatchsDistrict,
  type ActiviteDto,
  type ImportMatchsResultatDto,
} from '../activites';
import { authFetch } from '../authFetch';

vi.mock('../authFetch');

function mockResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as Response;
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

describe('fetchActivites', () => {
  beforeEach(() => {
    vi.mocked(authFetch).mockReset();
  });

  it('appelle authFetch sur /activites en GET', async () => {
    vi.mocked(authFetch).mockResolvedValue(mockResponse([activite]));

    const result = await fetchActivites();

    expect(authFetch).toHaveBeenCalledWith('http://localhost:3020/activites');
    expect(result).toEqual([activite]);
  });

  it("lève une erreur avec le message du body quand la réponse n'est pas ok", async () => {
    vi.mocked(authFetch).mockResolvedValue(mockResponse({ message: 'Accès refusé' }, false, 403));

    await expect(fetchActivites()).rejects.toThrow('Accès refusé');
  });

  it("lève une erreur avec un message par défaut quand le body n'est pas exploitable", async () => {
    vi.mocked(authFetch).mockResolvedValue(mockResponse(null, false, 500));

    await expect(fetchActivites()).rejects.toThrow(/Erreur lors de la récupération des activités \(500\)/);
  });
});

describe('creerActivite', () => {
  beforeEach(() => {
    vi.mocked(authFetch).mockReset();
  });

  it('appelle authFetch en POST avec le DTO sérialisé en JSON', async () => {
    vi.mocked(authFetch).mockResolvedValue(mockResponse(activite));
    const dto = {
      date: '2026-07-01',
      heureConvocation: '14:00',
      heureDebut: '15:00',
      label: 'Match amical',
      type: 'match' as const,
    };

    const result = await creerActivite(dto);

    expect(authFetch).toHaveBeenCalledWith('http://localhost:3020/activites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    expect(result).toEqual(activite);
  });

  it("lève une erreur avec le message du body quand la réponse n'est pas ok (ex: 403 non-admin)", async () => {
    vi.mocked(authFetch).mockResolvedValue(mockResponse({ message: 'Forbidden' }, false, 403));

    await expect(
      creerActivite({
        date: '2026-07-01',
        heureConvocation: '14:00',
        heureDebut: '15:00',
        label: 'Match amical',
        type: 'match',
      }),
    ).rejects.toThrow('Forbidden');
  });
});

describe('modifierActivite', () => {
  beforeEach(() => {
    vi.mocked(authFetch).mockReset();
  });

  it("appelle authFetch en PATCH sur /activites/:id avec le DTO sérialisé", async () => {
    vi.mocked(authFetch).mockResolvedValue(mockResponse(activite));

    const result = await modifierActivite('a1', { label: 'Nouveau label' });

    expect(authFetch).toHaveBeenCalledWith('http://localhost:3020/activites/a1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: 'Nouveau label' }),
    });
    expect(result).toEqual(activite);
  });

  it("lève une erreur quand la réponse n'est pas ok (ex: 404)", async () => {
    vi.mocked(authFetch).mockResolvedValue(mockResponse({ message: 'Activité introuvable' }, false, 404));

    await expect(modifierActivite('inconnue', { label: 'x' })).rejects.toThrow('Activité introuvable');
  });
});

describe('supprimerActivite', () => {
  beforeEach(() => {
    vi.mocked(authFetch).mockReset();
  });

  it('appelle authFetch en DELETE sur /activites/:id', async () => {
    vi.mocked(authFetch).mockResolvedValue(mockResponse(null, true, 204));

    await supprimerActivite('a1');

    expect(authFetch).toHaveBeenCalledWith('http://localhost:3020/activites/a1', { method: 'DELETE' });
  });

  it("lève une erreur quand la réponse n'est pas ok", async () => {
    vi.mocked(authFetch).mockResolvedValue(mockResponse({ message: 'Activité introuvable' }, false, 404));

    await expect(supprimerActivite('inconnue')).rejects.toThrow('Activité introuvable');
  });

  it("résout sans valeur quand la suppression réussit", async () => {
    vi.mocked(authFetch).mockResolvedValue(mockResponse(null, true, 204));

    await expect(supprimerActivite('a1')).resolves.toBeUndefined();
  });
});

describe('importerMatchsDistrict', () => {
  beforeEach(() => {
    vi.mocked(authFetch).mockReset();
  });

  it('appelle authFetch en POST sur /activites/import-district sans body', async () => {
    const resultat: ImportMatchsResultatDto = {
      matchsRecuperes: 3,
      crees: 2,
      misAJour: 1,
      ignores: 0,
      erreurs: [],
    };
    vi.mocked(authFetch).mockResolvedValue(mockResponse(resultat));

    const result = await importerMatchsDistrict();

    expect(authFetch).toHaveBeenCalledWith('http://localhost:3020/activites/import-district', {
      method: 'POST',
    });
    expect(result).toEqual(resultat);
  });

  it("lève une erreur avec le message du body quand la réponse n'est pas ok (ex: 503 source non configurée)", async () => {
    vi.mocked(authFetch).mockResolvedValue(
      mockResponse({ message: 'Import indisponible : DISTRICT_SOURCE_URL non configurée' }, false, 503),
    );

    await expect(importerMatchsDistrict()).rejects.toThrow(
      'Import indisponible : DISTRICT_SOURCE_URL non configurée',
    );
  });

  it("lève une erreur avec un message par défaut quand le body n'est pas exploitable", async () => {
    vi.mocked(authFetch).mockResolvedValue(mockResponse(null, false, 500));

    await expect(importerMatchsDistrict()).rejects.toThrow(
      /Erreur lors de l'import des matchs du district \(500\)/,
    );
  });
});
