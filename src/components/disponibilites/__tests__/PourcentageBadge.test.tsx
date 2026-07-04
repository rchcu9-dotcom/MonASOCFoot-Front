import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PourcentageBadge } from '../PourcentageBadge';
import { getPourcentageBadgeStyle } from '../../../utils/pourcentageRenseignement';

describe('PourcentageBadge', () => {
  it('affiche le pourcentage suivi de "% renseigné"', () => {
    render(<PourcentageBadge pourcentage={67} />);

    expect(screen.getByText('67% renseigné')).toBeInTheDocument();
  });

  it('applique les couleurs de getPourcentageBadgeStyle (cas vert, > 80)', () => {
    render(<PourcentageBadge pourcentage={90} />);

    const { bg, fg } = getPourcentageBadgeStyle(90);
    expect(screen.getByText('90% renseigné')).toHaveStyle({ backgroundColor: bg, color: fg });
  });

  it('applique les couleurs de getPourcentageBadgeStyle (cas jaune, > 60 et <= 80)', () => {
    render(<PourcentageBadge pourcentage={70} />);

    const { bg, fg } = getPourcentageBadgeStyle(70);
    expect(screen.getByText('70% renseigné')).toHaveStyle({ backgroundColor: bg, color: fg });
  });

  it('applique les couleurs de getPourcentageBadgeStyle (cas rouge, <= 60)', () => {
    render(<PourcentageBadge pourcentage={0} />);

    const { bg, fg } = getPourcentageBadgeStyle(0);
    expect(screen.getByText('0% renseigné')).toHaveStyle({ backgroundColor: bg, color: fg });
  });

  it('réutilise la classe CSS "statut-badge" (pastille déjà stylée)', () => {
    render(<PourcentageBadge pourcentage={50} />);

    expect(screen.getByText('50% renseigné')).toHaveClass('statut-badge');
  });
});
