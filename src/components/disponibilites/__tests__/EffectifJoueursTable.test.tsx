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
  it('affiche un tableau avec une ligne par joueur', () => {
    const joueurs = [
      makeJoueur({ utilisateurId: 'u1', displayName: 'Alice Dupont' }),
      makeJoueur({ utilisateurId: 'u2', displayName: 'Bob Martin' }),
    ];

    render(<EffectifJoueursTable joueurs={joueurs} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3); // 1 en-tête + 2 joueurs
    expect(screen.getByText('Alice Dupont')).toBeInTheDocument();
    expect(screen.getByText('Bob Martin')).toBeInTheDocument();
  });

  it('affiche le % de matchs à venir renseignés du joueur', () => {
    const joueurs = [makeJoueur({ pourcentageMatchsAVenirRenseignes: 67 })];

    render(<EffectifJoueursTable joueurs={joueurs} />);

    expect(screen.getByText('67%')).toBeInTheDocument();
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

  it("n'affiche que l'en-tête quand la liste des joueurs est vide", () => {
    render(<EffectifJoueursTable joueurs={[]} />);

    expect(screen.getAllByRole('row')).toHaveLength(1);
  });
});
