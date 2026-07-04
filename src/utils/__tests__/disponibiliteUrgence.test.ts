import { describe, it, expect } from 'vitest';
import { getContourCouleur, getContourCouleurParRang } from '../disponibiliteUrgence';
import type { DisponibiliteEffectiveDto } from '../../api/disponibilites';

// Couleurs attendues (définies dans STATUT_DISPONIBILITE_COLORS)
const VERT = '#4ade80';
const ROUGE = '#f87171';
const JAUNE = '#facc15';

// Date de référence injectée pour des tests déterministes (indépendants de new Date() réel)
const AUJOURD_HUI = '2026-07-03';
// J+7 calendaires à partir de 2026-07-03 : 2026-07-10
// J+8 : 2026-07-11

function makeDispo(source: DisponibiliteEffectiveDto['source'] = 'aucune'): DisponibiliteEffectiveDto {
  return { statut: 'autre', source };
}

describe('getContourCouleur', () => {
  describe('Règle 1 — disponibilité renseignée → vert (priorité absolue)', () => {
    it('retourne vert quand source === "activite", quel que soit la date', () => {
      expect(
        getContourCouleur({ statut: 'present', source: 'activite' }, '2026-07-05', AUJOURD_HUI),
      ).toBe(VERT);
    });

    it('retourne vert quand source === "journee", quel que soit la date', () => {
      expect(
        getContourCouleur({ statut: 'absent', source: 'journee' }, '2026-07-10', AUJOURD_HUI),
      ).toBe(VERT);
    });

    it('retourne vert même si l\'activité est aujourd\'hui (J+0) — priorité vert > rouge', () => {
      // Date J+0 serait rouge si non renseignée, mais la dispo est renseignée → vert
      expect(
        getContourCouleur({ statut: 'disponible', source: 'activite' }, AUJOURD_HUI, AUJOURD_HUI),
      ).toBe(VERT);
    });

    it('retourne vert même si l\'activité est dans le passé — priorité vert > rouge', () => {
      expect(
        getContourCouleur({ statut: 'present', source: 'activite' }, '2025-01-01', AUJOURD_HUI),
      ).toBe(VERT);
    });

    it('vert > rouge : source renseignée + activité à J+3 (zone rouge) → toujours vert', () => {
      expect(
        getContourCouleur({ statut: 'present', source: 'activite' }, '2026-07-06', AUJOURD_HUI),
      ).toBe(VERT);
    });

    it('vert > jaune : source renseignée + activité lointaine (J+30) → toujours vert', () => {
      expect(
        getContourCouleur({ statut: 'disponible', source: 'journee' }, '2026-09-01', AUJOURD_HUI),
      ).toBe(VERT);
    });
  });

  describe('Garde défensive — non renseignée + activiteDate absente → jaune', () => {
    it('retourne jaune quand activiteDate est undefined (activité sans date)', () => {
      expect(getContourCouleur(makeDispo('aucune'), undefined, AUJOURD_HUI)).toBe(JAUNE);
    });
  });

  describe('Règle 2 — non renseignée + activité dans ≤ 7 jours calendaires → rouge', () => {
    it('retourne rouge quand l\'activité est exactement à J+7 (borne incluse)', () => {
      // 2026-07-03 + 7j = 2026-07-10 ; '2026-07-10' <= '2026-07-10' → vrai
      expect(getContourCouleur(makeDispo('aucune'), '2026-07-10', AUJOURD_HUI)).toBe(ROUGE);
    });

    it('retourne rouge quand l\'activité est à J+1', () => {
      expect(getContourCouleur(makeDispo('aucune'), '2026-07-04', AUJOURD_HUI)).toBe(ROUGE);
    });

    it('retourne rouge quand l\'activité est aujourd\'hui (J+0)', () => {
      expect(getContourCouleur(makeDispo('aucune'), '2026-07-03', AUJOURD_HUI)).toBe(ROUGE);
    });
  });

  describe('Règle 3 — non renseignée + activité dans > 7 jours calendaires → jaune', () => {
    it('retourne jaune quand l\'activité est à J+8 (borne exclue du rouge)', () => {
      // 2026-07-03 + 7j = 2026-07-10 ; J+8 = 2026-07-11
      expect(getContourCouleur(makeDispo('aucune'), '2026-07-11', AUJOURD_HUI)).toBe(JAUNE);
    });

    it('retourne jaune quand l\'activité est lointaine (J+30)', () => {
      // 2026-07-03 + 30 jours = 2026-08-02
      expect(getContourCouleur(makeDispo('aucune'), '2026-08-02', AUJOURD_HUI)).toBe(JAUNE);
    });
  });

  describe('Paramètre "aujourdhui" — testabilité déterministe sans dépendance à new Date()', () => {
    it('utilise le paramètre "aujourdhui" injecté pour le calcul du seuil (pas new Date() réel)', () => {
      // Référence fictive : 2025-12-25 → J+7 = 2026-01-01
      const ref = '2025-12-25';
      // 2026-01-01 est exactement à J+7 de 2025-12-25 → rouge
      expect(getContourCouleur(makeDispo('aucune'), '2026-01-01', ref)).toBe(ROUGE);
      // 2026-01-02 est à J+8 → jaune
      expect(getContourCouleur(makeDispo('aucune'), '2026-01-02', ref)).toBe(JAUNE);
    });

    it('produit des résultats distincts pour deux dates "aujourdhui" différentes appliquées à la même activiteDate', () => {
      const activiteDate = '2026-07-10';
      // Si aujourd'hui = 2026-07-03 → J+7 = 2026-07-10 → rouge (inclus)
      expect(getContourCouleur(makeDispo('aucune'), activiteDate, '2026-07-03')).toBe(ROUGE);
      // Si aujourd'hui = 2026-07-04 → J+7 = 2026-07-11 → 2026-07-10 ≤ 2026-07-11 → rouge aussi
      expect(getContourCouleur(makeDispo('aucune'), activiteDate, '2026-07-04')).toBe(ROUGE);
      // Si aujourd'hui = 2026-07-04 → J+7 = 2026-07-11 → 2026-07-12 > 2026-07-11 → jaune
      expect(getContourCouleur(makeDispo('aucune'), '2026-07-12', '2026-07-04')).toBe(JAUNE);
    });
  });
});

describe('getContourCouleurParRang', () => {
  describe('disponibilité renseignée → vert, quel que soit le rang (priorité absolue)', () => {
    it('retourne vert quand renseignée et rang "premiere"', () => {
      expect(
        getContourCouleurParRang({ statut: 'present', source: 'activite' }, 'premiere'),
      ).toBe(VERT);
    });

    it('retourne vert quand renseignée et rang "suivante"', () => {
      expect(
        getContourCouleurParRang({ statut: 'absent', source: 'journee' }, 'suivante'),
      ).toBe(VERT);
    });
  });

  describe('disponibilité non renseignée → couleur dépend du rang', () => {
    it('retourne rouge quand non renseignée et rang "premiere" (date la plus proche affichée)', () => {
      expect(getContourCouleurParRang(makeDispo('aucune'), 'premiere')).toBe(ROUGE);
    });

    it('retourne jaune quand non renseignée et rang "suivante" (2ᵉ ou 3ᵉ date affichée)', () => {
      expect(getContourCouleurParRang(makeDispo('aucune'), 'suivante')).toBe(JAUNE);
    });
  });
});
