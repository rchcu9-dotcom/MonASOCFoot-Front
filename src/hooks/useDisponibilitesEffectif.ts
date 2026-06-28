import { useQuery } from '@tanstack/react-query';
import {
  fetchDisponibilitesEffectif,
  type DisponibilitesEffectifResponseDto,
  type FetchDisponibilitesEffectifParams,
} from '../api/disponibilites';

export function useDisponibilitesEffectif(filtre?: FetchDisponibilitesEffectifParams) {
  return useQuery<DisponibilitesEffectifResponseDto>({
    queryKey: ['disponibilites-effectif', filtre ?? null],
    queryFn: () => fetchDisponibilitesEffectif(filtre),
  });
}
