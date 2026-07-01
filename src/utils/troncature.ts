/** Tronque `label` à `max` caractères, en ajoutant `…` si nécessaire. */
export function tronquerLabel(label: string, max = 40): string {
  if (label.length <= max) {
    return label;
  }
  return `${label.slice(0, max)}…`;
}
