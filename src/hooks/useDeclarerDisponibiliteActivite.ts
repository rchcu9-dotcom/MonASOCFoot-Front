import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  declarerDisponibiliteActivite,
  type DeclarerDisponibiliteActiviteInput,
  type DisponibiliteActiviteDto,
} from '../api/disponibilites';

interface DeclarerDisponibiliteActiviteVariables {
  activiteId: string;
  dto: DeclarerDisponibiliteActiviteInput;
}

export function useDeclarerDisponibiliteActivite() {
  const queryClient = useQueryClient();

  return useMutation<DisponibiliteActiviteDto, Error, DeclarerDisponibiliteActiviteVariables>({
    mutationFn: ({ activiteId, dto }) => declarerDisponibiliteActivite(activiteId, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['disponibilites-effectif'] });
    },
  });
}
