import { describe, it, expect } from 'vitest';
import { getPourcentageBadgeStyle, getPourcentageCouleur } from '../pourcentageRenseignement';

// Couleurs attendues (définies dans STATUT_DISPONIBILITE_COLORS)
const VERT = '#4ade80';
const JAUNE = '#facc15';
const ROUGE = '#f87171';

describe('getPourcentageCouleur', () => {
  describe('vert — pourcentage strictement supérieur à 80', () => {
    it('retourne vert à 81', () => {
      expect(getPourcentageCouleur(81)).toBe(VERT);
    });

    it('retourne vert à 100', () => {
      expect(getPourcentageCouleur(100)).toBe(VERT);
    });
  });

  describe('jaune — pourcentage strictement supérieur à 60 et inférieur ou égal à 80', () => {
    it('retourne jaune à 61 (borne basse exclue du rouge)', () => {
      expect(getPourcentageCouleur(61)).toBe(JAUNE);
    });

    it('retourne jaune à 80 (borne haute incluse, pas encore vert)', () => {
      expect(getPourcentageCouleur(80)).toBe(JAUNE);
    });
  });

  describe('rouge — pourcentage inférieur ou égal à 60, y compris 0', () => {
    it('retourne rouge à 60 (borne incluse)', () => {
      expect(getPourcentageCouleur(60)).toBe(ROUGE);
    });

    it('retourne rouge à 0 (cas totalAVenir === 0)', () => {
      expect(getPourcentageCouleur(0)).toBe(ROUGE);
    });

    it('retourne rouge pour une valeur intermédiaire basse (30)', () => {
      expect(getPourcentageCouleur(30)).toBe(ROUGE);
    });
  });
});

describe('getPourcentageBadgeStyle', () => {
  it('retourne fg = getPourcentageCouleur(pourcentage) et bg = fg suffixé de l\'alpha hex "29" (~16 %)', () => {
    expect(getPourcentageBadgeStyle(90)).toEqual({ fg: VERT, bg: `${VERT}29` });
    expect(getPourcentageBadgeStyle(70)).toEqual({ fg: JAUNE, bg: `${JAUNE}29` });
    expect(getPourcentageBadgeStyle(10)).toEqual({ fg: ROUGE, bg: `${ROUGE}29` });
  });
});
