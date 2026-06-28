import { useMutation, useQueryClient } from '@tanstack/react-query';
import { modifierActivite, type ActiviteDto, type ModifierActiviteInput } from '../api/activites';

interface ModifierActiviteVariables {
  id: string;
  dto: ModifierActiviteInput;
}

export function useModifierActivite() {
  const queryClient = useQueryClient();

  return useMutation<ActiviteDto, Error, ModifierActiviteVariables>({
    mutationFn: ({ id, dto }) => modifierActivite(id, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['activites'] });
    },
  });
}
