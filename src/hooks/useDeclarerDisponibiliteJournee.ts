import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  declarerDisponibiliteJournee,
  type DeclarerDisponibiliteJourneeInput,
  type DisponibiliteJourneeDto,
} from '../api/disponibilites';

interface DeclarerDisponibiliteJourneeVariables {
  date: string;
  dto: DeclarerDisponibiliteJourneeInput;
}

export function useDeclarerDisponibiliteJournee() {
  const queryClient = useQueryClient();

  return useMutation<DisponibiliteJourneeDto, Error, DeclarerDisponibiliteJourneeVariables>({
    mutationFn: ({ date, dto }) => declarerDisponibiliteJournee(date, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['disponibilites-effectif'] });
      void queryClient.invalidateQueries({ queryKey: ['mes-disponibilites-journee'] });
    },
  });
}
