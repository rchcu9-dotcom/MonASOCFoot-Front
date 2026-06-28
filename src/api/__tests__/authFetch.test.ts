import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authFetch } from '../authFetch';
import { setToken, clearToken } from '../../auth/authToken';

describe('authFetch', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    clearToken();
    global.fetch = vi.fn().mockResolvedValue({ ok: true } as Response);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    clearToken();
  });

  it("appelle fetch sans header Authorization quand aucun token n'est stocké", async () => {
    await authFetch('http://localhost:3020/health');

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3020/health', {});
  });

  it('attache le header Authorization: Bearer <token> quand un token est stocké', async () => {
    setToken('jwt-abc');

    await authFetch('http://localhost:3020/users');

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3020/users', {
      headers: { Authorization: 'Bearer jwt-abc' },
    });
  });

  it('conserve les autres options (method, body) et les headers existants en plus du Authorization', async () => {
    setToken('jwt-abc');

    await authFetch('http://localhost:3020/users/u1/role', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'admin' }),
    });

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3020/users/u1/role', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer jwt-abc' },
      body: JSON.stringify({ role: 'admin' }),
    });
  });

  it('renvoie la réponse de fetch telle quelle', async () => {
    const response = { ok: false, status: 403 } as Response;
    global.fetch = vi.fn().mockResolvedValue(response);

    const result = await authFetch('http://localhost:3020/users');

    expect(result).toBe(response);
  });
});
