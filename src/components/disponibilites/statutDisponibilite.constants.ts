import type { StatutDisponibilite } from '../../api/disponibilites';

export const STATUT_DISPONIBILITE_LABELS: Record<StatutDisponibilite, string> = {
  present: 'Présent',
  disponible: 'Disponible',
  absent: 'Absent',
  autre: 'Autre',
};

export const STATUT_DISPONIBILITE_COLORS: Record<StatutDisponibilite, string> = {
  present: '#4ade80',
  disponible: '#facc15',
  absent: '#f87171',
  autre: '#94a3b8',
};

/**
 * Palette « pastille » (fond teinté translucide + texte vif) par statut, pour `StatutBadge`
 * (rendu badge, pas juste texte coloré — cf. spec
 * `fais-moi-une-proposition-de-saisie-de-mes-dispos-o-colonne-d`).
 * Valeurs adaptées au thème sombre MonASOCFoot (cf. docs/adr/0002-theme-sombre-monasocfoot.md) :
 * fond clair remplacé par une teinte translucide, lisible sur le fond slate très foncé.
 */
export const STATUT_DISPONIBILITE_BADGE_STYLES: Record<
  StatutDisponibilite,
  { bg: string; fg: string }
> = {
  present: { bg: 'rgba(74, 222, 128, 0.16)', fg: '#4ade80' },
  disponible: { bg: 'rgba(250, 204, 21, 0.16)', fg: '#facc15' },
  absent: { bg: 'rgba(248, 113, 113, 0.16)', fg: '#f87171' },
  autre: { bg: 'rgba(148, 163, 184, 0.16)', fg: '#cbd5e1' },
};
