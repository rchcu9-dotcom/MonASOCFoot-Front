import { STATUT_DISPONIBILITE_COLORS } from '../components/disponibilites/statutDisponibilite.constants';

/**
 * Retourne la couleur CSS hex du nombre de présents selon les seuils :
 *   - nbPresents < 11         → rouge (#f87171, STATUT_DISPONIBILITE_COLORS.absent)
 *   - 11 <= nbPresents <= 13  → jaune (#facc15, STATUT_DISPONIBILITE_COLORS.disponible)
 *   - nbPresents >= 14        → vert  (#4ade80, STATUT_DISPONIBILITE_COLORS.present)
 *
 * Seuils calés sur l'effectif minimal d'une équipe de football à 11.
 *
 * @param nbPresents  Nombre de joueurs au statut « présent » pour le match affiché.
 */
export function getNombrePresentsCouleur(nbPresents: number): string {
  if (nbPresents < 11) return STATUT_DISPONIBILITE_COLORS.absent;
  if (nbPresents <= 13) return STATUT_DISPONIBILITE_COLORS.disponible;
  return STATUT_DISPONIBILITE_COLORS.present;
}

/**
 * Style « pastille » (fond teinté translucide + texte vif) du nombre de présents,
 * sur le même principe que `getPourcentageBadgeStyle` : `fg` est la couleur pleine
 * (`getNombrePresentsCouleur`), `bg` la même couleur en ~16 % d'opacité via un suffixe
 * alpha hex (évite un parsing hex→rgba pour un besoin aussi simple).
 */
export function getNombrePresentsBadgeStyle(nbPresents: number): { bg: string; fg: string } {
  const fg = getNombrePresentsCouleur(nbPresents);
  return { bg: `${fg}29`, fg };
}
