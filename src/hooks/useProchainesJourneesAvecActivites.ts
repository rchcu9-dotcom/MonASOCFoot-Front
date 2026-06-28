import type { ActiviteColonneDto } from '../api/disponibilites';
import { useDisponibilitesEffectif } from './useDisponibilitesEffectif';

export interface JourneeAvecActivites {
  date: string;
  activites: ActiviteColonneDto[];
}

/**
 * Dérive, à partir de `useDisponibilitesEffectif()` (sans filtre — toutes les activités à venir),
 * la liste des journées distinctes avec leurs activités regroupées par date, triée par date
 * croissante. Aucun appel réseau propre : isole la logique de regroupement pour ne pas la
 * dupliquer dans `MesDisponibilitesPage`.
 */
export function useProchainesJourneesAvecActivites(): {
  data?: JourneeAvecActivites[];
  isLoading: boolean;
  isError: boolean;
} {
  const { data, isLoading, isError } = useDisponibilitesEffectif();

  if (!data) {
    return { data: undefined, isLoading, isError };
  }

  const activitesParDate = new Map<string, ActiviteColonneDto[]>();
  for (const activite of data.activites) {
    const activites = activitesParDate.get(activite.date) ?? [];
    activites.push(activite);
    activitesParDate.set(activite.date, activites);
  }

  const journees: JourneeAvecActivites[] = Array.from(
    activitesParDate.entries(),
  )
    .map(([date, activites]) => ({ date, activites }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { data: journees, isLoading, isError };
}
