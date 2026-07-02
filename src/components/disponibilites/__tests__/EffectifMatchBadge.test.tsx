import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EffectifMatchBadge } from '../EffectifMatchBadge';
import type { EffectifMatchBadgeDto } from '../../../api/disponibilites';

describe('EffectifMatchBadge', () => {
  it('affiche les 3 informations au singulier (1 présent, 1 disponible)', () => {
    const badge: EffectifMatchBadgeDto = { nbPresents: 1, nbDisponibles: 1, pourcentageSaisie: 50 };

    render(<EffectifMatchBadge badge={badge} />);

    expect(screen.getByText('1 présent · 1 disponible · 50% saisi')).toBeInTheDocument();
  });

  it('accorde au pluriel quand plusieurs présents et plusieurs disponibles', () => {
    const badge: EffectifMatchBadgeDto = { nbPresents: 3, nbDisponibles: 2, pourcentageSaisie: 100 };

    render(<EffectifMatchBadge badge={badge} />);

    expect(screen.getByText('3 présents · 2 disponibles · 100% saisi')).toBeInTheDocument();
  });

  it('affiche 0 présent / 0 disponible / 0% quand personne n\'a renseigné sa disponibilité', () => {
    const badge: EffectifMatchBadgeDto = { nbPresents: 0, nbDisponibles: 0, pourcentageSaisie: 0 };

    render(<EffectifMatchBadge badge={badge} />);

    expect(screen.getByText('0 présent · 0 disponible · 0% saisi')).toBeInTheDocument();
  });
});
