import { STATUT_DISPONIBILITE_COLORS } from '../components/disponibilites/statutDisponibilite.constants';

/**
 * Retourne la couleur CSS hex du taux de renseignement selon les seuils :
 *   - pourcentage > 80  → vert  (#4ade80, STATUT_DISPONIBILITE_COLORS.present)
 *   - pourcentage > 60  → jaune (#facc15, STATUT_DISPONIBILITE_COLORS.disponible)
 *   - sinon             → rouge (#f87171, STATUT_DISPONIBILITE_COLORS.absent)
 *
 * Seuils strictement non inclusifs : 80% exact = jaune, 60% exact = rouge.
 *
 * @param pourcentage  Entier 0–100 (valeur de TableauDeBordAccueilDto.pourcentageRenseignement)
 */
export function getPourcentageCouleur(pourcentage: number): string {
  if (pourcentage > 80) return STATUT_DISPONIBILITE_COLORS.present;
  if (pourcentage > 60) return STATUT_DISPONIBILITE_COLORS.disponible;
  return STATUT_DISPONIBILITE_COLORS.absent;
}

/**
 * Style « pastille » (fond teinté translucide + texte vif) du badge de taux de renseignement,
 * sur le même principe que `STATUT_DISPONIBILITE_BADGE_STYLES` (`StatutBadge`) : `fg` est la
 * couleur pleine (`getPourcentageCouleur`), `bg` la même couleur en ~16 % d'opacité via un
 * suffixe alpha hex (évite un parsing hex→rgba pour un besoin aussi simple).
 */
export function getPourcentageBadgeStyle(pourcentage: number): { bg: string; fg: string } {
  const fg = getPourcentageCouleur(pourcentage);
  return { bg: `${fg}29`, fg };
}
