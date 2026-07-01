import { useQuery } from '@tanstack/react-query';
import { fetchResumeAccueil, type ResumeAccueilDto } from '../api/disponibilites';

export function useResumeAccueil(options?: { enabled?: boolean }) {
  return useQuery<ResumeAccueilDto>({
    queryKey: ['resume-accueil'],
    queryFn: fetchResumeAccueil,
    enabled: options?.enabled,
  });
}
