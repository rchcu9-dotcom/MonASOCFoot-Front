import { useMutation, useQueryClient } from '@tanstack/react-query';
import { modifierActivite, type ActiviteDto } from '../api/activites';

interface DeplacerActiviteVariables {
  activiteId: string;
  /** `null` = retrait de date (déplacement vers la colonne « Sans date »). */
  cibleDate: string | null;
}

/**
 * Fonction métier unique de déplacement d'une activité, consommée à la fois par le
 * glisser-déposer réel (`onDragEnd` de `DndContext`) et par le mode de repli accessible
 * (sélection-clic puis clic-cible) — cf. spec
 * `pour-grer-les-activits-il-faut-pouvoir-bouger-lactivit-dune-`. Ne jamais dupliquer cette
 * logique ailleurs.
 */
export function useDeplacerActivite() {
  const queryClient = useQueryClient();

  return useMutation<ActiviteDto, Error, DeplacerActiviteVariables>({
    mutationFn: ({ activiteId, cibleDate }) =>
      modifierActivite(activiteId, { date: cibleDate }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['activites-planification'] });
      void queryClient.invalidateQueries({ queryKey: ['activites'] });
    },
  });
}
