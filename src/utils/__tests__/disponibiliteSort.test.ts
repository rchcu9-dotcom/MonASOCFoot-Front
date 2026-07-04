import { describe, it, expect } from 'vitest';
import { sortJoueursByDisponibilite } from '../disponibiliteSort';
import type { JoueurEffectifMatchDto, DisponibiliteEffectiveDto } from '../../api/disponibilites';

function makeJoueur(
  id: string,
  displayName: string,
  dispo: Partial<DisponibiliteEffectiveDto> = {},
): JoueurEffectifMatchDto {
  return {
    utilisateurId: id,
    displayName,
    pourcentageMatchsAVenirRenseignes: 0,
    disponibiliteMatchCourant: {
      statut: 'autre',
      source: 'aucune',
      ...dispo,
    },
  };
}

describe('sortJoueursByDisponibilite', () => {
  describe('ordre des rangs principaux', () => {
    it('place "présent" avant "disponible"', () => {
      const joueurs = [
        makeJoueur('u1', 'Bob', { statut: 'disponible', source: 'activite' }),
        makeJoueur('u2', 'Alice', { statut: 'present', source: 'activite' }),
      ];

      const résultat = sortJoueursByDisponibilite(joueurs);

      expect(résultat[0].utilisateurId).toBe('u2'); // présent
      expect(résultat[1].utilisateurId).toBe('u1'); // disponible
    });

    it('place "disponible" avant "absent"', () => {
      const joueurs = [
        makeJoueur('u1', 'Bob', { statut: 'absent', source: 'activite' }),
        makeJoueur('u2', 'Alice', { statut: 'disponible', source: 'journee' }),
      ];

      const résultat = sortJoueursByDisponibilite(joueurs);

      expect(résultat[0].utilisateurId).toBe('u2'); // disponible
      expect(résultat[1].utilisateurId).toBe('u1'); // absent
    });

    it('place "absent" déclaré avant un joueur non renseigné (source: "aucune")', () => {
      const joueurs = [
        makeJoueur('u1', 'Charlie', { statut: 'autre', source: 'aucune' }), // non renseigné
        makeJoueur('u2', 'Alice', { statut: 'absent', source: 'journee' }), // absent déclaré
      ];

      const résultat = sortJoueursByDisponibilite(joueurs);

      expect(résultat[0].utilisateurId).toBe('u2'); // absent déclaré (rang 2)
      expect(résultat[1].utilisateurId).toBe('u1'); // non renseigné (rang 3)
    });

    it('trie 4 joueurs de statuts différents dans l\'ordre présent > disponible > absent > non renseigné', () => {
      const joueurs = [
        makeJoueur('u4', 'Dave', { statut: 'autre', source: 'aucune' }),      // non renseigné
        makeJoueur('u2', 'Bob', { statut: 'disponible', source: 'journee' }), // disponible
        makeJoueur('u3', 'Charlie', { statut: 'absent', source: 'activite' }), // absent
        makeJoueur('u1', 'Alice', { statut: 'present', source: 'activite' }), // présent
      ];

      const résultat = sortJoueursByDisponibilite(joueurs);

      expect(résultat.map((j) => j.utilisateurId)).toEqual(['u1', 'u2', 'u3', 'u4']);
    });
  });

  describe('regroupement absent / autre déclaré (rang identique)', () => {
    it('regroupe "absent" et "autre" (source renseignée) dans le même rang, triés alphabétiquement', () => {
      const joueurs = [
        makeJoueur('u1', 'Zoé', { statut: 'absent', source: 'journee' }),
        makeJoueur('u2', 'Alice', { statut: 'autre', source: 'activite' }),
        makeJoueur('u3', 'Marc', { statut: 'absent', source: 'activite' }),
      ];

      const résultat = sortJoueursByDisponibilite(joueurs);

      // Tri secondaire alphabétique à rang égal : Alice, Marc, Zoé
      expect(résultat.map((j) => j.displayName)).toEqual(['Alice', 'Marc', 'Zoé']);
    });

    it('ne sépare pas "absent" et "autre" (source renseignée) en deux groupes distincts', () => {
      const joueurs = [
        makeJoueur('u1', 'Éric', { statut: 'absent', source: 'journee' }),
        makeJoueur('u2', 'Alice', { statut: 'autre', source: 'activite' }),
        makeJoueur('u3', 'Zoé', { statut: 'absent', source: 'activite' }),
      ];

      const résultat = sortJoueursByDisponibilite(joueurs);
      const ids = résultat.map((j) => j.utilisateurId);

      // Les 3 joueurs sont en rang 2 — aucun d'eux ne se retrouve séparé
      expect(ids).toContain('u1');
      expect(ids).toContain('u2');
      expect(ids).toContain('u3');
      // Vérifier qu'aucun ne s'est retrouvé au rang 3 (non renseigné) :
      // c'est garanti si les 3 sont bien avant un joueur source='aucune'
      const joueurAvecAucune = makeJoueur('u9', 'Béatrice', { statut: 'autre', source: 'aucune' });
      const résultatAvecAucune = sortJoueursByDisponibilite([...joueurs, joueurAvecAucune]);
      expect(résultatAvecAucune[3].utilisateurId).toBe('u9'); // non renseigné en dernière position
    });
  });

  describe('discrimination source: "aucune" vs statut: "autre" déclaré (point critique)', () => {
    it('classe statut "autre" avec source "journee" au rang 2 (pas au rang 3 "non renseigné")', () => {
      const joueurs = [
        makeJoueur('u1', 'Bob', { statut: 'autre', source: 'aucune' }),    // rang 3 : non renseigné
        makeJoueur('u2', 'Alice', { statut: 'autre', source: 'journee' }), // rang 2 : autre déclaré
      ];

      const résultat = sortJoueursByDisponibilite(joueurs);

      // Alice (autre/journee = rang 2) précède Bob (autre/aucune = rang 3)
      expect(résultat[0].utilisateurId).toBe('u2');
      expect(résultat[1].utilisateurId).toBe('u1');
    });

    it('classe statut "autre" avec source "activite" au rang 2 (pas au rang 3 "non renseigné")', () => {
      const joueurs = [
        makeJoueur('u1', 'Zoé', { statut: 'autre', source: 'aucune' }),     // rang 3
        makeJoueur('u2', 'Alice', { statut: 'autre', source: 'activite' }), // rang 2
      ];

      const résultat = sortJoueursByDisponibilite(joueurs);

      expect(résultat[0].utilisateurId).toBe('u2'); // rang 2 d'abord
      expect(résultat[1].utilisateurId).toBe('u1'); // rang 3 ensuite
    });

    it('deux joueurs avec statut "autre", distingués uniquement par source : activite < aucune', () => {
      // Scénario exact du point critique du track.md :
      // le back renvoie statut='autre' comme placeholder quand source='aucune' →
      // seule la source fait foi pour identifier le 4e rang
      const joueurDeclaré = makeJoueur('decl', 'Même Prénom', { statut: 'autre', source: 'activite' });
      const joueurNonRenseigné = makeJoueur('nr', 'Même Prénom', { statut: 'autre', source: 'aucune' });

      const résultat = sortJoueursByDisponibilite([joueurNonRenseigné, joueurDeclaré]);

      expect(résultat[0].utilisateurId).toBe('decl');
      expect(résultat[1].utilisateurId).toBe('nr');
    });
  });

  describe('tri secondaire alphabétique à rang égal', () => {
    it('trie par displayName en ordre alphabétique quand le rang est identique', () => {
      const joueurs = [
        makeJoueur('u3', 'Charles Dupont', { statut: 'present', source: 'activite' }),
        makeJoueur('u1', 'Alice Martin', { statut: 'present', source: 'activite' }),
        makeJoueur('u2', 'Bob Leblanc', { statut: 'present', source: 'journee' }),
      ];

      const résultat = sortJoueursByDisponibilite(joueurs);

      expect(résultat.map((j) => j.displayName)).toEqual([
        'Alice Martin',
        'Bob Leblanc',
        'Charles Dupont',
      ]);
    });

    it('tri alphabétique insensible à la casse (locale "fr", sensitivity "base")', () => {
      const joueurs = [
        makeJoueur('u2', 'éric Durand', { statut: 'disponible', source: 'journee' }),
        makeJoueur('u1', 'Albert Morin', { statut: 'disponible', source: 'journee' }),
      ];

      const résultat = sortJoueursByDisponibilite(joueurs);

      // 'Albert' précède 'éric' en ordre alphabétique français
      expect(résultat[0].displayName).toBe('Albert Morin');
      expect(résultat[1].displayName).toBe('éric Durand');
    });

    it('tri secondaire alphabétique s\'applique indépendamment au sein de chaque rang', () => {
      const joueurs = [
        makeJoueur('p2', 'Zoé', { statut: 'present', source: 'activite' }),
        makeJoueur('p1', 'Alice', { statut: 'present', source: 'activite' }),
        makeJoueur('d2', 'Marc', { statut: 'disponible', source: 'journee' }),
        makeJoueur('d1', 'Bob', { statut: 'disponible', source: 'journee' }),
      ];

      const résultat = sortJoueursByDisponibilite(joueurs);

      expect(résultat.map((j) => j.displayName)).toEqual(['Alice', 'Zoé', 'Bob', 'Marc']);
    });
  });

  describe('immutabilité du tableau source', () => {
    it('ne modifie pas l\'ordre du tableau passé en entrée', () => {
      const joueurs = [
        makeJoueur('u2', 'Bob', { statut: 'absent', source: 'journee' }),
        makeJoueur('u1', 'Alice', { statut: 'present', source: 'activite' }),
      ];
      const idAvant = joueurs.map((j) => j.utilisateurId);

      sortJoueursByDisponibilite(joueurs);

      const idAprès = joueurs.map((j) => j.utilisateurId);
      expect(idAprès).toEqual(idAvant);
    });

    it('renvoie un nouveau tableau distinct du tableau source', () => {
      const joueurs = [makeJoueur('u1', 'Alice', { statut: 'present', source: 'activite' })];

      const résultat = sortJoueursByDisponibilite(joueurs);

      expect(résultat).not.toBe(joueurs);
    });
  });

  describe('cas limites', () => {
    it('renvoie un tableau vide si l\'entrée est vide', () => {
      expect(sortJoueursByDisponibilite([])).toEqual([]);
    });

    it('renvoie un tableau d\'un seul élément inchangé', () => {
      const joueurs = [makeJoueur('u1', 'Alice', { statut: 'present', source: 'activite' })];

      const résultat = sortJoueursByDisponibilite(joueurs);

      expect(résultat).toHaveLength(1);
      expect(résultat[0].utilisateurId).toBe('u1');
    });

    it('gère plusieurs joueurs non renseignés triés alphabétiquement entre eux', () => {
      const joueurs = [
        makeJoueur('u3', 'Zoé', { statut: 'autre', source: 'aucune' }),
        makeJoueur('u1', 'Alice', { statut: 'autre', source: 'aucune' }),
        makeJoueur('u2', 'Marc', { statut: 'autre', source: 'aucune' }),
      ];

      const résultat = sortJoueursByDisponibilite(joueurs);

      expect(résultat.map((j) => j.displayName)).toEqual(['Alice', 'Marc', 'Zoé']);
    });
  });
});
