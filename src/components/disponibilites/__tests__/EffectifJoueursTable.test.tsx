import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EffectifJoueursTable } from '../EffectifJoueursTable';
import type { JoueurEffectifMatchDto } from '../../../api/disponibilites';

function makeJoueur(overrides: Partial<JoueurEffectifMatchDto> = {}): JoueurEffectifMatchDto {
  return {
    utilisateurId: 'u1',
    displayName: 'Alice Dupont',
    pourcentageMatchsAVenirRenseignes: 0,
    disponibiliteMatchCourant: { statut: 'autre', source: 'aucune' },
    ...overrides,
  };
}

describe('EffectifJoueursTable', () => {
  it('affiche une carte par joueur', () => {
    const joueurs = [
      makeJoueur({ utilisateurId: 'u1', displayName: 'Alice Dupont' }),
      makeJoueur({ utilisateurId: 'u2', displayName: 'Bob Martin' }),
    ];

    const { container } = render(<EffectifJoueursTable joueurs={joueurs} />);

    expect(container.querySelectorAll('.effectif-joueur-carte')).toHaveLength(2);
    expect(screen.getByText('Alice Dupont')).toBeInTheDocument();
    expect(screen.getByText('Bob Martin')).toBeInTheDocument();
  });

  it('affiche le % de matchs à venir renseignés du joueur via le badge de taux', () => {
    const joueurs = [makeJoueur({ pourcentageMatchsAVenirRenseignes: 67 })];

    render(<EffectifJoueursTable joueurs={joueurs} />);

    expect(screen.getByText('67% renseigné')).toBeInTheDocument();
  });

  it('affiche le statut du joueur pour le match courant via DisponibiliteBadge', () => {
    const joueurs = [
      makeJoueur({ disponibiliteMatchCourant: { statut: 'present', source: 'activite' } }),
    ];

    render(<EffectifJoueursTable joueurs={joueurs} />);

    expect(screen.getByText(/Présent/)).toBeInTheDocument();
  });

  it('affiche une cellule neutre pour un joueur sans disponibilité renseignée', () => {
    const joueurs = [
      makeJoueur({ disponibiliteMatchCourant: { statut: 'autre', source: 'aucune' } }),
    ];

    render(<EffectifJoueursTable joueurs={joueurs} />);

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('affiche un message neutre "Aucun joueur." et aucune carte quand la liste des joueurs est vide', () => {
    const { container } = render(<EffectifJoueursTable joueurs={[]} />);

    expect(screen.getByText('Aucun joueur.')).toBeInTheDocument();
    expect(container.querySelectorAll('.effectif-joueur-carte')).toHaveLength(0);
  });

  describe('ordre de tri : présent > disponible > absent/autre > non renseigné', () => {
    it('affiche les cartes dans l\'ordre présent, disponible, absent, non renseigné pour un jeu mixte', () => {
      const joueurs = [
        makeJoueur({
          utilisateurId: 'u4',
          displayName: 'Dave',
          disponibiliteMatchCourant: { statut: 'autre', source: 'aucune' },
        }),
        makeJoueur({
          utilisateurId: 'u2',
          displayName: 'Bob',
          disponibiliteMatchCourant: { statut: 'disponible', source: 'journee' },
        }),
        makeJoueur({
          utilisateurId: 'u3',
          displayName: 'Charlie',
          disponibiliteMatchCourant: { statut: 'absent', source: 'activite' },
        }),
        makeJoueur({
          utilisateurId: 'u1',
          displayName: 'Alice',
          disponibiliteMatchCourant: { statut: 'present', source: 'activite' },
        }),
      ];

      const { container } = render(<EffectifJoueursTable joueurs={joueurs} />);

      const cartes = container.querySelectorAll('.effectif-joueur-carte');
      expect(cartes[0]).toHaveTextContent('Alice');   // présent → rang 1
      expect(cartes[1]).toHaveTextContent('Bob');     // disponible → rang 2
      expect(cartes[2]).toHaveTextContent('Charlie'); // absent → rang 3
      expect(cartes[3]).toHaveTextContent('Dave');    // non renseigné → rang 4
    });

    it('regroupe "absent" et "autre" déclaré dans le même rang (triés alphabétiquement entre eux)', () => {
      const joueurs = [
        makeJoueur({
          utilisateurId: 'u2',
          displayName: 'Zoé',
          disponibiliteMatchCourant: { statut: 'absent', source: 'journee' },
        }),
        makeJoueur({
          utilisateurId: 'u1',
          displayName: 'Alice',
          disponibiliteMatchCourant: { statut: 'autre', source: 'activite' },
        }),
      ];

      const { container } = render(<EffectifJoueursTable joueurs={joueurs} />);

      const cartes = container.querySelectorAll('.effectif-joueur-carte');
      expect(cartes[0]).toHaveTextContent('Alice'); // 'autre' déclaré, A avant Z
      expect(cartes[1]).toHaveTextContent('Zoé');   // 'absent' déclaré
    });

    it('place statut "autre" avec source "aucune" (non renseigné) après "autre" déclaré (source "activite")', () => {
      const joueurs = [
        makeJoueur({
          utilisateurId: 'u1',
          displayName: 'Bob',
          disponibiliteMatchCourant: { statut: 'autre', source: 'aucune' },
        }),
        makeJoueur({
          utilisateurId: 'u2',
          displayName: 'Alice',
          disponibiliteMatchCourant: { statut: 'autre', source: 'activite' },
        }),
      ];

      const { container } = render(<EffectifJoueursTable joueurs={joueurs} />);

      const cartes = container.querySelectorAll('.effectif-joueur-carte');
      expect(cartes[0]).toHaveTextContent('Alice'); // autre/activite → rang 2
      expect(cartes[1]).toHaveTextContent('Bob');   // autre/aucune  → rang 3 (non renseigné)
    });

    it('trie alphabétiquement les joueurs de même statut (présents : Alice avant Zoé)', () => {
      const joueurs = [
        makeJoueur({
          utilisateurId: 'u2',
          displayName: 'Zoé',
          disponibiliteMatchCourant: { statut: 'present', source: 'activite' },
        }),
        makeJoueur({
          utilisateurId: 'u1',
          displayName: 'Alice',
          disponibiliteMatchCourant: { statut: 'present', source: 'activite' },
        }),
      ];

      const { container } = render(<EffectifJoueursTable joueurs={joueurs} />);

      const cartes = container.querySelectorAll('.effectif-joueur-carte');
      expect(cartes[0]).toHaveTextContent('Alice');
      expect(cartes[1]).toHaveTextContent('Zoé');
    });
  });
});
