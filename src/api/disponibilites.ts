import { authFetch } from './authFetch';
import type { EquipeClub } from './activites';

declare const __APP_API_BASE_URL__: string | undefined;

const API_BASE_URL =
  typeof __APP_API_BASE_URL__ !== 'undefined' ? __APP_API_BASE_URL__ : 'http://localhost:3020';

export type StatutDisponibilite = 'present' | 'disponible' | 'absent' | 'autre';
export type TypeActivite = 'match' | 'autre';

export interface DisponibiliteEffectiveDto {
  statut: StatutDisponibilite;
  commentaire?: string;
  source: 'activite' | 'journee' | 'aucune';
}

export interface LigneJoueurDto {
  utilisateurId: string;
  displayName: string;
  /** Clé = activiteId. */
  disponibilites: Record<string, DisponibiliteEffectiveDto>;
}

export interface ActiviteColonneDto {
  id: string;
  date: string;
  heureConvocation: string;
  heureDebut: string;
  label: string;
  type: TypeActivite;
  commentaire?: string;
  equipe?: EquipeClub;
}

export interface DisponibilitesEffectifResponseDto {
  activites: ActiviteColonneDto[];
  joueurs: LigneJoueurDto[];
}

export interface FetchDisponibilitesEffectifParams {
  date?: string;
  activiteId?: string;
}

export async function fetchDisponibilitesEffectif(
  params?: FetchDisponibilitesEffectifParams,
): Promise<DisponibilitesEffectifResponseDto> {
  const query = new URLSearchParams();
  if (params?.activiteId) {
    query.set('activiteId', params.activiteId);
  } else if (params?.date) {
    query.set('date', params.date);
  }

  const search = query.toString();
  const url = `${API_BASE_URL}/disponibilites/effectif${search ? `?${search}` : ''}`;

  const res = await authFetch(url);
  if (!res.ok) {
    throw new Error(`Erreur ${res.status} lors de la récupération des disponibilités de l'effectif`);
  }
  return (await res.json()) as DisponibilitesEffectifResponseDto;
}

export interface EffectifMatchBadgeDto {
  nbPresents: number;
  nbDisponibles: number;
  pourcentageSaisie: number;
}

export interface JoueurEffectifMatchDto {
  utilisateurId: string;
  displayName: string;
  pourcentageMatchsAVenirRenseignes: number;
  disponibiliteMatchCourant: DisponibiliteEffectiveDto;
}

export interface EffectifMatchResponseDto {
  matchCourant: ActiviteColonneDto | null;
  matchPrecedentId: string | null;
  matchSuivantId: string | null;
  badge: EffectifMatchBadgeDto | null;
  /** Ordre chronologique, tous les matchs à venir. Vide si aucun match à venir. */
  matchsAVenir: ActiviteColonneDto[];
  joueurs: JoueurEffectifMatchDto[];
}

export async function fetchEffectifMatch(matchId?: string): Promise<EffectifMatchResponseDto> {
  const search = matchId ? `?matchId=${encodeURIComponent(matchId)}` : '';
  const res = await authFetch(`${API_BASE_URL}/disponibilites/effectif-match${search}`);
  return parseJsonOrThrow<EffectifMatchResponseDto>(
    res,
    "Erreur lors de la récupération de l'effectif du match",
  );
}

export interface DisponibiliteActiviteDto {
  id: string;
  utilisateurId: string;
  activiteId: string;
  statut: StatutDisponibilite;
  commentaire?: string;
}

export interface DeclarerDisponibiliteActiviteInput {
  statut: StatutDisponibilite;
  commentaire?: string;
  /** Admin uniquement : cible un autre utilisateur que soi-même. */
  utilisateurId?: string;
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

export async function declarerDisponibiliteActivite(
  activiteId: string,
  dto: DeclarerDisponibiliteActiviteInput,
): Promise<DisponibiliteActiviteDto> {
  const res = await authFetch(`${API_BASE_URL}/disponibilites/activite/${activiteId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  return parseJsonOrThrow<DisponibiliteActiviteDto>(
    res,
    'Erreur lors de la déclaration de la disponibilité',
  );
}

export async function supprimerDisponibiliteActivite(
  activiteId: string,
  utilisateurId?: string,
): Promise<void> {
  const query = utilisateurId ? `?utilisateurId=${encodeURIComponent(utilisateurId)}` : '';
  const res = await authFetch(`${API_BASE_URL}/disponibilites/activite/${activiteId}${query}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      (body && typeof body === 'object' && 'message' in body && String(body.message)) ||
      `Erreur lors de la suppression de la surcharge (${res.status})`;
    throw new Error(message);
  }
}

export interface DisponibiliteJourneeDto {
  id: string;
  utilisateurId: string;
  date: string;
  statut: StatutDisponibilite;
  commentaire?: string;
}

export interface DeclarerDisponibiliteJourneeInput {
  statut: StatutDisponibilite;
  commentaire?: string;
  /** Admin uniquement : cible un autre utilisateur que soi-même. */
  utilisateurId?: string;
}

export async function declarerDisponibiliteJournee(
  date: string,
  dto: DeclarerDisponibiliteJourneeInput,
): Promise<DisponibiliteJourneeDto> {
  const res = await authFetch(`${API_BASE_URL}/disponibilites/journee/${date}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  return parseJsonOrThrow<DisponibiliteJourneeDto>(
    res,
    'Erreur lors de la déclaration de la disponibilité de journée',
  );
}

export async function fetchMesDisponibilitesJournee(): Promise<DisponibiliteJourneeDto[]> {
  const res = await authFetch(`${API_BASE_URL}/disponibilites/journee/mes-disponibilites`);
  return parseJsonOrThrow<DisponibiliteJourneeDto[]>(
    res,
    'Erreur lors de la récupération de mes disponibilités de journée',
  );
}

export interface ActiviteAvecDisponibiliteDto {
  activite: ActiviteColonneDto;
  disponibilite: DisponibiliteEffectiveDto;
}

export interface ProchaineDateAccueilDto {
  date: string;
  activites: ActiviteAvecDisponibiliteDto[];
}

export interface TableauDeBordAccueilDto {
  totalAVenir: number;
  renseigneesAVenir: number;
  pourcentageRenseignement: number;
}

export interface ResumeAccueilDto {
  prochainesDates: ProchaineDateAccueilDto[];
  tableauDeBord: TableauDeBordAccueilDto;
}

export async function fetchResumeAccueil(): Promise<ResumeAccueilDto> {
  const res = await authFetch(`${API_BASE_URL}/disponibilites/resume-accueil`);
  return parseJsonOrThrow<ResumeAccueilDto>(
    res,
    'Erreur lors de la récupération du résumé de la page Accueil',
  );
}
