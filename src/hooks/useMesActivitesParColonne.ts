import { useAuth } from '../auth/AuthContext';
import type {
  ActiviteAvecDisponibiliteDto,
  DisponibiliteEffectiveDto,
} from '../api/disponibilites';
import { useDisponibilitesEffectif } from './useDisponibilitesEffectif';

export type LigneActiviteDisponibilite = ActiviteAvecDisponibiliteDto;

/**
 * Dérive, à partir de `useDisponibilitesEffectif()` (sans filtre — toutes les activités à venir)
 * et de l'utilisateur connecté, la partition gauche/droite de `MesDisponibilitesPage` :
 * `aTraiter` (`source === 'aucune'`) / `renseignees` (`source !== 'aucune'`), chacune triée par
 * date puis heure de début croissantes. Aucun appel réseau propre — même pattern que
 * `useProchainesJourneesAvecActivites`.
 */
export function useMesActivitesParColonne(): {
  aTraiter: LigneActiviteDisponibilite[];
  renseignees: LigneActiviteDisponibilite[];
  isLoading: boolean;
  isError: boolean;
} {
  const { user } = useAuth();
  const { data: effectif, isLoading, isError } = useDisponibilitesEffectif();

  if (!effectif || !user) {
    return { aTraiter: [], renseignees: [], isLoading, isError };
  }

  const ligneUtilisateurConnecte = effectif.joueurs.find(
    (joueur) => joueur.utilisateurId === user.id,
  );

  const aTraiter: LigneActiviteDisponibilite[] = [];
  const renseignees: LigneActiviteDisponibilite[] = [];

  for (const activite of effectif.activites) {
    const disponibilite: DisponibiliteEffectiveDto =
      ligneUtilisateurConnecte?.disponibilites[activite.id] ?? {
        statut: 'autre',
        source: 'aucune',
      };

    const ligne: LigneActiviteDisponibilite = { activite, disponibilite };

    if (disponibilite.source === 'aucune') {
      aTraiter.push(ligne);
    } else {
      renseignees.push(ligne);
    }
  }

  const parDateHeure = (a: LigneActiviteDisponibilite, b: LigneActiviteDisponibilite) =>
    a.activite.date === b.activite.date
      ? a.activite.heureDebut.localeCompare(b.activite.heureDebut)
      : a.activite.date.localeCompare(b.activite.date);

  aTraiter.sort(parDateHeure);
  renseignees.sort(parDateHeure);

  return { aTraiter, renseignees, isLoading, isError };
}
