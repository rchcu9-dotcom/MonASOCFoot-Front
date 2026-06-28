import { authFetch } from './authFetch';

declare const __APP_API_BASE_URL__: string | undefined;

const API_BASE_URL =
  typeof __APP_API_BASE_URL__ !== 'undefined' ? __APP_API_BASE_URL__ : 'http://localhost:3020';

export type TypeActivite = 'match' | 'autre';
export type SourceActivite = 'manuel' | 'import';

export interface ActiviteDto {
  id: string;
  /** ISO 8601 — format yyyy-mm-dd. */
  date: string;
  /** Format HH:mm. */
  heureConvocation: string;
  /** Format HH:mm. */
  heureDebut: string;
  label: string;
  type: TypeActivite;
  commentaire?: string;
  source: SourceActivite;
}

export interface CreerActiviteInput {
  date: string;
  heureConvocation: string;
  heureDebut: string;
  label: string;
  type: TypeActivite;
  commentaire?: string;
}

export type ModifierActiviteInput = Partial<CreerActiviteInput>;

export interface ImportMatchsResultatDto {
  matchsRecuperes: number;
  crees: number;
  misAJour: number;
  ignores: number;
  erreurs: string[];
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

export async function fetchActivites(): Promise<ActiviteDto[]> {
  const res = await authFetch(`${API_BASE_URL}/activites`);
  return parseJsonOrThrow<ActiviteDto[]>(res, 'Erreur lors de la récupération des activités');
}

export async function creerActivite(dto: CreerActiviteInput): Promise<ActiviteDto> {
  const res = await authFetch(`${API_BASE_URL}/activites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  return parseJsonOrThrow<ActiviteDto>(res, "Erreur lors de la création de l'activité");
}

export async function modifierActivite(
  id: string,
  dto: ModifierActiviteInput,
): Promise<ActiviteDto> {
  const res = await authFetch(`${API_BASE_URL}/activites/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  return parseJsonOrThrow<ActiviteDto>(res, "Erreur lors de la modification de l'activité");
}

export async function supprimerActivite(id: string): Promise<void> {
  const res = await authFetch(`${API_BASE_URL}/activites/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      (body && typeof body === 'object' && 'message' in body && String(body.message)) ||
      `Erreur lors de la suppression de l'activité (${res.status})`;
    throw new Error(message);
  }
}

export async function importerMatchsDistrict(): Promise<ImportMatchsResultatDto> {
  const res = await authFetch(`${API_BASE_URL}/activites/import-district`, {
    method: 'POST',
  });
  return parseJsonOrThrow<ImportMatchsResultatDto>(
    res,
    "Erreur lors de l'import des matchs du district",
  );
}
