import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProchainesJourneesAvecActivites } from '../useProchainesJourneesAvecActivites';
import { useDisponibilitesEffectif } from '../useDisponibilitesEffectif';
import type { ActiviteColonneDto, DisponibilitesEffectifResponseDto } from '../../api/disponibilites';

vi.mock('../useDisponibilitesEffectif');

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

const activiteA: ActiviteColonneDto = {
  id: 'a1',
  date: '2026-07-08',
  heureConvocation: '14:00',
  heureDebut: '15:00',
  label: 'Match A',
  type: 'match',
};

const activiteB: ActiviteColonneDto = {
  id: 'a2',
  date: '2026-07-01',
  heureConvocation: '09:00',
  heureDebut: '10:00',
  label: 'Match B',
  type: 'match',
};

const activiteC: ActiviteColonneDto = {
  id: 'a3',
  date: '2026-07-01',
  heureConvocation: '17:00',
  heureDebut: '18:00',
  label: 'AG',
  type: 'autre',
};

describe('useProchainesJourneesAvecActivites', () => {
  beforeEach(() => {
    vi.mocked(useDisponibilitesEffectif).mockReset();
  });

  it('renvoie data undefined tant que useDisponibilitesEffectif est en chargement', () => {
    mockUseDisponibilitesEffectif({ isLoading: true, data: undefined });

    const { result } = renderHook(() => useProchainesJourneesAvecActivites());

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
  });

  it('propage isError depuis useDisponibilitesEffectif', () => {
    mockUseDisponibilitesEffectif({ isError: true, data: undefined });

    const { result } = renderHook(() => useProchainesJourneesAvecActivites());

    expect(result.current.isError).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('renvoie un tableau vide quand aucune activité à venir', () => {
    const reponse: DisponibilitesEffectifResponseDto = { activites: [], joueurs: [] };
    mockUseDisponibilitesEffectif({ data: reponse });

    const { result } = renderHook(() => useProchainesJourneesAvecActivites());

    expect(result.current.data).toEqual([]);
  });

  it('regroupe les activités de la même date sous une seule entrée', () => {
    const reponse: DisponibilitesEffectifResponseDto = {
      activites: [activiteB, activiteC],
      joueurs: [],
    };
    mockUseDisponibilitesEffectif({ data: reponse });

    const { result } = renderHook(() => useProchainesJourneesAvecActivites());

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0]).toEqual({
      date: '2026-07-01',
      activites: [activiteB, activiteC],
    });
  });

  it('trie les journées par date croissante', () => {
    const reponse: DisponibilitesEffectifResponseDto = {
      activites: [activiteA, activiteB],
      joueurs: [],
    };
    mockUseDisponibilitesEffectif({ data: reponse });

    const { result } = renderHook(() => useProchainesJourneesAvecActivites());

    expect(result.current.data?.map((j) => j.date)).toEqual(['2026-07-01', '2026-07-08']);
  });

  it('produit une entrée par date, y compris pour une date à activité unique', () => {
    const reponse: DisponibilitesEffectifResponseDto = {
      activites: [activiteA],
      joueurs: [],
    };
    mockUseDisponibilitesEffectif({ data: reponse });

    const { result } = renderHook(() => useProchainesJourneesAvecActivites());

    expect(result.current.data).toEqual([{ date: '2026-07-08', activites: [activiteA] }]);
  });
});
