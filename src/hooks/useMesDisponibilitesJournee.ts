import { useQuery } from '@tanstack/react-query';
import { fetchMesDisponibilitesJournee, type DisponibiliteJourneeDto } from '../api/disponibilites';

export function useMesDisponibilitesJournee() {
  return useQuery<DisponibiliteJourneeDto[]>({
    queryKey: ['mes-disponibilites-journee'],
    queryFn: fetchMesDisponibilitesJournee,
  });
}
