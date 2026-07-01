import { useQuery } from '@tanstack/react-query';
import { fetchPlanificationActivites, type PlanificationActivitesDto } from '../api/activites';

export function usePlanificationActivites(semaines: number) {
  return useQuery<PlanificationActivitesDto>({
    queryKey: ['activites-planification', semaines],
    queryFn: () => fetchPlanificationActivites(semaines),
  });
}
