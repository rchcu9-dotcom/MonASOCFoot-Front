import { describe, it, expect } from 'vitest';
import { tronquerLabel } from '../troncature';

describe('tronquerLabel', () => {
  it('renvoie le label inchangé quand sa longueur est inférieure ou égale à max', () => {
    expect(tronquerLabel('Match amical', 40)).toBe('Match amical');
  });

  it('renvoie le label inchangé quand sa longueur est exactement égale à max', () => {
    const label = 'a'.repeat(40);
    expect(tronquerLabel(label, 40)).toBe(label);
  });

  it('tronque le label et ajoute "…" quand sa longueur dépasse max', () => {
    const label = 'a'.repeat(45);
    const resultat = tronquerLabel(label, 40);

    expect(resultat).toBe(`${'a'.repeat(40)}…`);
    expect(resultat).toHaveLength(41);
  });

  it('utilise 40 comme valeur par défaut de max quand non fournie', () => {
    const label = 'b'.repeat(50);
    expect(tronquerLabel(label)).toBe(`${'b'.repeat(40)}…`);
  });

  it('respecte une valeur de max personnalisée', () => {
    expect(tronquerLabel('Bonjour tout le monde', 7)).toBe('Bonjour…');
  });

  it('ne tronque pas une chaîne vide', () => {
    expect(tronquerLabel('', 40)).toBe('');
  });
});
