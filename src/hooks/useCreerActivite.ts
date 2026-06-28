import { useMutation, useQueryClient } from '@tanstack/react-query';
import { creerActivite, type ActiviteDto, type CreerActiviteInput } from '../api/activites';

export function useCreerActivite() {
  const queryClient = useQueryClient();

  return useMutation<ActiviteDto, Error, CreerActiviteInput>({
    mutationFn: creerActivite,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['activites'] });
    },
  });
}
