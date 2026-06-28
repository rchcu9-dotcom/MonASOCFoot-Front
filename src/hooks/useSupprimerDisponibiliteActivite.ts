import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supprimerDisponibiliteActivite } from '../api/disponibilites';

interface SupprimerDisponibiliteActiviteVariables {
  activiteId: string;
  utilisateurId?: string;
}

export function useSupprimerDisponibiliteActivite() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, SupprimerDisponibiliteActiviteVariables>({
    mutationFn: ({ activiteId, utilisateurId }) =>
      supprimerDisponibiliteActivite(activiteId, utilisateurId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['disponibilites-effectif'] });
    },
  });
}
