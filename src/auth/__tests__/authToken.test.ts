import { describe, it, expect, beforeEach } from 'vitest';
import { getToken, setToken, clearToken } from '../authToken';

const STORAGE_KEY = 'monasocfoot_auth_token';

describe('authToken', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('getToken renvoie null quand aucun token n\'est stocké', () => {
    expect(getToken()).toBeNull();
  });

  it('setToken stocke le token sous la clé monasocfoot_auth_token et getToken le relit', () => {
    setToken('jwt-abc');

    expect(localStorage.getItem(STORAGE_KEY)).toBe('jwt-abc');
    expect(getToken()).toBe('jwt-abc');
  });

  it('clearToken supprime le token stocké', () => {
    setToken('jwt-abc');

    clearToken();

    expect(getToken()).toBeNull();
  });

  it('setToken écrase un token déjà présent', () => {
    setToken('jwt-1');
    setToken('jwt-2');

    expect(getToken()).toBe('jwt-2');
  });
});
