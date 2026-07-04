import type { JoueurEffectifMatchDto, DisponibiliteEffectiveDto } from '../api/disponibilites';

/**
 * Retourne le rang de tri d'une disponibilité.
 * 0 = présent, 1 = disponible, 2 = absent/autre, 3 = non renseigné (source === 'aucune').
 *
 * La source est vérifiée en premier : quand source === 'aucune', le statut vaut une valeur
 * placeholder non significative renvoyée par le back — seule la source fait foi pour le 4e rang.
 */
function getRangTri(dispo: DisponibiliteEffectiveDto): number {
  if (dispo.source === 'aucune') return 3;
  switch (dispo.statut) {
    case 'present':
      return 0;
    case 'disponible':
      return 1;
    case 'absent':
    case 'autre':
      return 2;
    default:
      return 3;
  }
}

/**
 * Trie les joueurs selon leur disponibilité pour le match affiché :
 *   1. Présents
 *   2. Disponibles
 *   3. Absents / Autre (regroupés)
 *   4. Non renseignés (source === 'aucune')
 *
 * À rang égal, tri secondaire alphabétique sur displayName (locale 'fr', insensible à la casse).
 * Ne mute pas le tableau source.
 */
export function sortJoueursByDisponibilite(
  joueurs: JoueurEffectifMatchDto[],
): JoueurEffectifMatchDto[] {
  return [...joueurs].sort((a, b) => {
    const delta =
      getRangTri(a.disponibiliteMatchCourant) - getRangTri(b.disponibiliteMatchCourant);
    return delta !== 0
      ? delta
      : a.displayName.localeCompare(b.displayName, 'fr', { sensitivity: 'base' });
  });
}
