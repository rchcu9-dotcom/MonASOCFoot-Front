import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EffectifJoueurCarte } from '../EffectifJoueurCarte';
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

describe('EffectifJoueurCarte', () => {
  it('affiche le nom du joueur', () => {
    render(<EffectifJoueurCarte joueur={makeJoueur({ displayName: 'Bob Martin' })} />);

    expect(screen.getByText('Bob Martin')).toBeInTheDocument();
  });

  it('affiche le badge de taux de renseignement du joueur', () => {
    render(<EffectifJoueurCarte joueur={makeJoueur({ pourcentageMatchsAVenirRenseignes: 67 })} />);

    expect(screen.getByText('67% renseigné')).toBeInTheDocument();
  });

  it('affiche le statut du joueur pour le match courant via DisponibiliteBadge', () => {
    render(
      <EffectifJoueurCarte
        joueur={makeJoueur({ disponibiliteMatchCourant: { statut: 'present', source: 'activite' } })}
      />,
    );

    expect(screen.getByText(/Présent/)).toBeInTheDocument();
  });

  it('affiche une cellule neutre pour un joueur sans disponibilité renseignée', () => {
    render(
      <EffectifJoueurCarte
        joueur={makeJoueur({ disponibiliteMatchCourant: { statut: 'autre', source: 'aucune' } })}
      />,
    );

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('rend la carte dans un conteneur ".effectif-joueur-carte"', () => {
    const { container } = render(<EffectifJoueurCarte joueur={makeJoueur()} />);

    expect(container.querySelector('.effectif-joueur-carte')).toBeInTheDocument();
  });
});
