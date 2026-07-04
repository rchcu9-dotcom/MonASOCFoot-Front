import type { DisponibiliteEffectiveDto } from '../api/disponibilites';
import { STATUT_DISPONIBILITE_COLORS } from '../components/disponibilites/statutDisponibilite.constants';

/**
 * Convertit un objet Date local en chaîne YYYY-MM-DD en utilisant l'heure locale
 * (et non UTC) pour éviter les décalages de fuseau horaire.
 */
function dateToYYYYMMDD(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Retourne la couleur CSS du contour d'une carte ActiviteCarte selon la règle :
 *   - dispo source !== 'aucune'                              → vert  (#4ade80)
 *   - non renseignée + activiteDate ≤ J+7 calendaires       → rouge (#f87171)
 *   - non renseignée + activiteDate > J+7 ou date absente   → jaune (#facc15)
 *
 * La comparaison porte sur des chaînes YYYY-MM-DD (ordre lexicographique fiable),
 * sans conversion en timestamp, pour éviter toute dérive de fuseau horaire.
 *
 * @param disponibilite  DisponibiliteEffectiveDto de l'activité
 * @param activiteDate   Date YYYY-MM-DD de l'activité (peut être undefined — activité sans date)
 * @param aujourdhui     Date YYYY-MM-DD du jour (paramètre injecté pour testabilité,
 *                       défaut = date locale du navigateur au moment de l'appel)
 */
export function getContourCouleur(
  disponibilite: DisponibiliteEffectiveDto,
  activiteDate: string | undefined,
  aujourdhui?: string,
): string {
  // Règle 1 : disponibilité renseignée → vert, quoi qu'il arrive.
  if (disponibilite.source !== 'aucune') {
    return STATUT_DISPONIBILITE_COLORS.present;
  }

  // Pas de date → impossible de calculer l'urgence → jaune (garde défensive).
  if (!activiteDate) {
    return STATUT_DISPONIBILITE_COLORS.disponible;
  }

  // Calcul du seuil J+7 en date locale YYYY-MM-DD.
  const baseDate = aujourdhui
    ? new Date(`${aujourdhui}T00:00:00`) // heure locale explicite
    : new Date();
  const seuil = new Date(baseDate);
  seuil.setDate(seuil.getDate() + 7);
  const seuilStr = dateToYYYYMMDD(seuil);

  // Règle 2 : non renseignée + activité dans ≤ 7 jours → rouge.
  if (activiteDate <= seuilStr) {
    return STATUT_DISPONIBILITE_COLORS.absent;
  }

  // Règle 3 : non renseignée + activité dans > 7 jours → jaune.
  return STATUT_DISPONIBILITE_COLORS.disponible;
}

export type RangDateAccueil = 'premiere' | 'suivante';

/**
 * Retourne la couleur CSS du contour d'une carte ActiviteCarte dans le bloc
 * « Prochaines activités » de la page Accueil, selon une règle de rang (pas de seuil temporel) :
 *   - dispo source !== 'aucune'        → vert  (#4ade80), quel que soit le rang
 *   - non renseignée + rang 'premiere' → rouge (#f87171) — date la plus proche affichée
 *   - non renseignée + rang 'suivante' → jaune (#facc15) — 2ᵉ ou 3ᵉ date affichée
 *
 * @param disponibilite  DisponibiliteEffectiveDto de l'activité
 * @param rang           Position de la date de l'activité dans `prochainesDates` :
 *                       'premiere' pour l'index 0, 'suivante' pour tout index > 0
 */
export function getContourCouleurParRang(
  disponibilite: DisponibiliteEffectiveDto,
  rang: RangDateAccueil,
): string {
  if (disponibilite.source !== 'aucune') {
    return STATUT_DISPONIBILITE_COLORS.present;
  }

  return rang === 'premiere'
    ? STATUT_DISPONIBILITE_COLORS.absent
    : STATUT_DISPONIBILITE_COLORS.disponible;
}
