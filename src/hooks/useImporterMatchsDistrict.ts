import { useMutation, useQueryClient } from '@tanstack/react-query';
import { importerMatchsDistrict, type ImportMatchsResultatDto } from '../api/activites';

export function useImporterMatchsDistrict() {
  const queryClient = useQueryClient();

  return useMutation<ImportMatchsResultatDto, Error, void>({
    mutationFn: importerMatchsDistrict,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['activites'] });
    },
  });
}
