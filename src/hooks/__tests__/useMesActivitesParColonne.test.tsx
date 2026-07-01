import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMesActivitesParColonne } from '../useMesActivitesParColonne';
import { useDisponibilitesEffectif } from '../useDisponibilitesEffectif';
import { useAuth } from '../../auth/AuthContext';
import type { ActiviteColonneDto, DisponibilitesEffectifResponseDto } from '../../api/disponibilites';

vi.mock('../useDisponibilitesEffectif');
vi.mock('../../auth/AuthContext');

function mockUseDisponibilitesEffectif(
  overrides: Partial<ReturnType<typeof useDisponibilitesEffectif>>,
) {
  vi.mocked(useDisponibilitesEffectif).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    ...overrides,
  } as ReturnType<typeof useDisponibilitesEffectif>);
}

function mockAuth(overrides: Partial<ReturnType<typeof useAuth>> = {}) {
  vi.mocked(useAuth).mockReturnValue({
    user: { id: 'user-1', providerId: 'p1', provider: 'dev', displayName: 'Joueur Un', role: 'joueur' },
    loading: false,
    googleLoginUrl: 'http://localhost:3020/auth/google',
    devLogin: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
    ...overrides,
  });
}

function makeActivite(overrides: Partial<ActiviteColonneDto> = {}): ActiviteColonneDto {
  return {
    id: 'a1',
    date: '2026-07-08',
    heureConvocation: '14:00',
    heureDebut: '15:00',
    label: 'Match A',
    type: 'match',
    ...overrides,
  };
}

describe('useMesActivitesParColonne', () => {
  beforeEach(() => {
    vi.mocked(useDisponibilitesEffectif).mockReset();
    vi.mocked(useAuth).mockReset();
    mockAuth();
  });

  it('renvoie deux listes vides et propage isLoading quand les données ne sont pas encore chargées', () => {
    mockUseDisponibilitesEffectif({ isLoading: true, data: undefined });

    const { result } = renderHook(() => useMesActivitesParColonne());

    expect(result.current.aTraiter).toEqual([]);
    expect(result.current.renseignees).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it('propage isError', () => {
    mockUseDisponibilitesEffectif({ isError: true, data: undefined });

    const { result } = renderHook(() => useMesActivitesParColonne());

    expect(result.current.isError).toBe(true);
  });

  it('renvoie deux listes vides quand aucun utilisateur connecté', () => {
    mockAuth({ user: null });
    mockUseDisponibilitesEffectif({
      data: { activites: [makeActivite()], joueurs: [] },
    });

    const { result } = renderHook(() => useMesActivitesParColonne());

    expect(result.current.aTraiter).toEqual([]);
    expect(result.current.renseignees).toEqual([]);
  });

  it('place une activité sans aucune disponibilité connue (source "aucune") dans aTraiter, avec un statut/source factices', () => {
    const activite = makeActivite({ id: 'a1' });
    const reponse: DisponibilitesEffectifResponseDto = {
      activites: [activite],
      joueurs: [{ utilisateurId: 'user-1', displayName: 'Joueur Un', disponibilites: {} }],
    };
    mockUseDisponibilitesEffectif({ data: reponse });

    const { result } = renderHook(() => useMesActivitesParColonne());

    expect(result.current.aTraiter).toEqual([
      { activite, disponibilite: { statut: 'autre', source: 'aucune' } },
    ]);
    expect(result.current.renseignees).toEqual([]);
  });

  it('place une activité avec une dispo de journée (source "journee") dans renseignees', () => {
    const activite = makeActivite({ id: 'a1' });
    const reponse: DisponibilitesEffectifResponseDto = {
      activites: [activite],
      joueurs: [
        {
          utilisateurId: 'user-1',
          displayName: 'Joueur Un',
          disponibilites: { a1: { statut: 'disponible', source: 'journee' } },
        },
      ],
    };
    mockUseDisponibilitesEffectif({ data: reponse });

    const { result } = renderHook(() => useMesActivitesParColonne());

    expect(result.current.renseignees).toEqual([
      { activite, disponibilite: { statut: 'disponible', source: 'journee' } },
    ]);
    expect(result.current.aTraiter).toEqual([]);
  });

  it('place une activité avec une surcharge (source "activite") dans renseignees', () => {
    const activite = makeActivite({ id: 'a1' });
    const reponse: DisponibilitesEffectifResponseDto = {
      activites: [activite],
      joueurs: [
        {
          utilisateurId: 'user-1',
          displayName: 'Joueur Un',
          disponibilites: { a1: { statut: 'absent', source: 'activite', commentaire: 'Blessé' } },
        },
      ],
    };
    mockUseDisponibilitesEffectif({ data: reponse });

    const { result } = renderHook(() => useMesActivitesParColonne());

    expect(result.current.renseignees).toEqual([
      { activite, disponibilite: { statut: 'absent', source: 'activite', commentaire: 'Blessé' } },
    ]);
  });

  it("ne lit que les disponibilités de l'utilisateur connecté, pas celles d'un autre joueur", () => {
    const activite = makeActivite({ id: 'a1' });
    const reponse: DisponibilitesEffectifResponseDto = {
      activites: [activite],
      joueurs: [
        {
          utilisateurId: 'autre-utilisateur',
          displayName: 'Autre Joueur',
          disponibilites: { a1: { statut: 'present', source: 'activite' } },
        },
      ],
    };
    mockUseDisponibilitesEffectif({ data: reponse });

    const { result } = renderHook(() => useMesActivitesParColonne());

    expect(result.current.aTraiter).toEqual([
      { activite, disponibilite: { statut: 'autre', source: 'aucune' } },
    ]);
    expect(result.current.renseignees).toEqual([]);
  });

  it('trie aTraiter par date croissante puis par heure de début croissante à date égale', () => {
    const activitePlusTard = makeActivite({ id: 'a1', date: '2026-07-08', heureDebut: '18:00' });
    const activitePlusProche = makeActivite({ id: 'a2', date: '2026-07-01', heureDebut: '10:00' });
    const activiteMemeDatePlusTot = makeActivite({ id: 'a3', date: '2026-07-08', heureDebut: '09:00' });
    const reponse: DisponibilitesEffectifResponseDto = {
      activites: [activitePlusTard, activitePlusProche, activiteMemeDatePlusTot],
      joueurs: [{ utilisateurId: 'user-1', displayName: 'Joueur Un', disponibilites: {} }],
    };
    mockUseDisponibilitesEffectif({ data: reponse });

    const { result } = renderHook(() => useMesActivitesParColonne());

    expect(result.current.aTraiter.map((l) => l.activite.id)).toEqual(['a2', 'a3', 'a1']);
  });

  it('trie renseignees par date croissante puis par heure de début croissante à date égale', () => {
    const activitePlusTard = makeActivite({ id: 'a1', date: '2026-07-08', heureDebut: '18:00' });
    const activitePlusProche = makeActivite({ id: 'a2', date: '2026-07-01', heureDebut: '10:00' });
    const activiteMemeDatePlusTot = makeActivite({ id: 'a3', date: '2026-07-08', heureDebut: '09:00' });
    const reponse: DisponibilitesEffectifResponseDto = {
      activites: [activitePlusTard, activitePlusProche, activiteMemeDatePlusTot],
      joueurs: [
        {
          utilisateurId: 'user-1',
          displayName: 'Joueur Un',
          disponibilites: {
            a1: { statut: 'present', source: 'journee' },
            a2: { statut: 'present', source: 'journee' },
            a3: { statut: 'present', source: 'journee' },
          },
        },
      ],
    };
    mockUseDisponibilitesEffectif({ data: reponse });

    const { result } = renderHook(() => useMesActivitesParColonne());

    expect(result.current.renseignees.map((l) => l.activite.id)).toEqual(['a2', 'a3', 'a1']);
  });

  it('répartit correctement un mélange d\'activités traitées et non traitées', () => {
    const activiteATraiter = makeActivite({ id: 'a1', date: '2026-07-01' });
    const activiteRenseignee = makeActivite({ id: 'a2', date: '2026-07-02' });
    const reponse: DisponibilitesEffectifResponseDto = {
      activites: [activiteATraiter, activiteRenseignee],
      joueurs: [
        {
          utilisateurId: 'user-1',
          displayName: 'Joueur Un',
          disponibilites: { a2: { statut: 'present', source: 'journee' } },
        },
      ],
    };
    mockUseDisponibilitesEffectif({ data: reponse });

    const { result } = renderHook(() => useMesActivitesParColonne());

    expect(result.current.aTraiter.map((l) => l.activite.id)).toEqual(['a1']);
    expect(result.current.renseignees.map((l) => l.activite.id)).toEqual(['a2']);
  });
});
