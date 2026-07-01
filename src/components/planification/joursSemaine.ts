export const JOURS_SEMAINE = [
  { id: 1, label: 'Lun' },
  { id: 2, label: 'Mar' },
  { id: 3, label: 'Mer' },
  { id: 4, label: 'Jeu' },
  { id: 5, label: 'Ven' },
  { id: 6, label: 'Sam' },
  { id: 0, label: 'Dim' },
] as const;

/** Vendredi présélectionné à l'ouverture de la page (cf. spec). */
export const JOURS_PAR_DEFAUT: number[] = [5];
