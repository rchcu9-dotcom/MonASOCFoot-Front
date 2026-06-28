import type { StatutDisponibilite } from '../../api/disponibilites';

export const STATUT_DISPONIBILITE_LABELS: Record<StatutDisponibilite, string> = {
  present: 'Présent',
  disponible: 'Disponible',
  absent: 'Absent',
  autre: 'Autre',
};

export const STATUT_DISPONIBILITE_COLORS: Record<StatutDisponibilite, string> = {
  present: '#1a7f37',
  disponible: '#2563eb',
  absent: '#b91c1c',
  autre: '#6b7280',
};
