import { useQuery } from '@tanstack/react-query';
import { fetchEffectifMatch, type EffectifMatchResponseDto } from '../api/disponibilites';

export function useEffectifMatch(matchId?: string) {
  return useQuery<EffectifMatchResponseDto>({
    queryKey: ['effectif-match', matchId ?? null],
    queryFn: () => fetchEffectifMatch(matchId),
  });
}
