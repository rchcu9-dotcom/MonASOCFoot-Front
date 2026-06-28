import { useQuery } from '@tanstack/react-query';
import { fetchActivites, type ActiviteDto } from '../api/activites';

export function useActivites(options?: { enabled?: boolean }) {
  return useQuery<ActiviteDto[]>({
    queryKey: ['activites'],
    queryFn: fetchActivites,
    enabled: options?.enabled,
  });
}
