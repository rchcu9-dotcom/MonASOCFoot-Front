import { useQuery } from '@tanstack/react-query';
import { fetchUtilisateurs, type UtilisateurDto } from '../api/users';

export function useUtilisateurs() {
  return useQuery<UtilisateurDto[]>({
    queryKey: ['utilisateurs'],
    queryFn: fetchUtilisateurs,
  });
}
