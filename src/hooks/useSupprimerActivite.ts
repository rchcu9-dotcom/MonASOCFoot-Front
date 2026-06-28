import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supprimerActivite } from '../api/activites';

export function useSupprimerActivite() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => supprimerActivite(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['activites'] });
    },
  });
}
