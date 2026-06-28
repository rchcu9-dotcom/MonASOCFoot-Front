import { authFetch } from './authFetch';

declare const __APP_API_BASE_URL__: string | undefined;

const API_BASE_URL =
  typeof __APP_API_BASE_URL__ !== 'undefined' ? __APP_API_BASE_URL__ : 'http://localhost:3020';

export type RoleUtilisateur = 'admin' | 'joueur';

export interface UtilisateurDto {
  id: string;
  providerId: string;
  provider: string;
  displayName: string;
  email?: string;
  role: RoleUtilisateur;
  /** ISO 8601 */
  dateApparition: string;
  /** ISO 8601 */
  derniereConnexion?: string;
}

async function parseJsonOrThrow<T>(res: Response, messageErreur: string): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      (body && typeof body === 'object' && 'message' in body && String(body.message)) ||
      `${messageErreur} (${res.status})`;
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export async function fetchUtilisateurs(): Promise<UtilisateurDto[]> {
  const res = await authFetch(`${API_BASE_URL}/users`);
  return parseJsonOrThrow<UtilisateurDto[]>(res, 'Erreur lors de la récupération des utilisateurs');
}

export async function modifierRoleUtilisateur(
  id: string,
  role: RoleUtilisateur,
): Promise<UtilisateurDto> {
  const res = await authFetch(`${API_BASE_URL}/users/${id}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  return parseJsonOrThrow<UtilisateurDto>(res, "Erreur lors de la modification du rôle de l'utilisateur");
}
