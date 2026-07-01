import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActiviteCarte } from '../ActiviteCarte';
import type { ActiviteDto } from '../../../api/activites';

function makeActivite(overrides: Partial<ActiviteDto> = {}): ActiviteDto {
  return {
    id: 'a1',
    date: '2026-07-01',
    heureConvocation: '14:00',
    heureDebut: '15:00',
    label: 'Match amical contre Cesson',
    type: 'match',
    source: 'manuel',
    ...overrides,
  };
}

describe('ActiviteCarte', () => {
  it('affiche le type, l\'heure de début et le début du libellé', () => {
    render(<ActiviteCarte activite={makeActivite()} onClick={vi.fn()} />);

    expect(screen.getByText('Match')).toBeInTheDocument();
    expect(screen.getByText('15:00')).toBeInTheDocument();
  });

  it('affiche le libellé tronqué quand il dépasse la longueur maximale', () => {
    const activite = makeActivite({ label: 'Un libellé volontairement très long pour le test' });
    render(<ActiviteCarte activite={activite} onClick={vi.fn()} />);

    expect(screen.getByText(/…$/)).toBeInTheDocument();
  });

  it("affiche le label de l'équipe quand elle est renseignée", () => {
    render(<ActiviteCarte activite={makeActivite({ equipe: 'B' })} onClick={vi.fn()} />);

    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it("n'affiche aucun badge d'équipe quand elle n'est pas renseignée", () => {
    render(<ActiviteCarte activite={makeActivite({ equipe: undefined })} onClick={vi.fn()} />);

    expect(screen.queryByText('A')).not.toBeInTheDocument();
    expect(screen.queryByText('B')).not.toBeInTheDocument();
    expect(screen.queryByText('Vét')).not.toBeInTheDocument();
  });

  it("expose le détail complet de l'activité dans le titre (infobulle native au survol)", () => {
    const activite = makeActivite({ commentaire: 'RDV au stade' });
    render(<ActiviteCarte activite={activite} onClick={vi.fn()} />);

    const carte = screen.getByRole('button');
    expect(carte).toHaveAttribute('title', expect.stringContaining(activite.label));
    expect(carte).toHaveAttribute('title', expect.stringContaining('Match'));
    expect(carte).toHaveAttribute('title', expect.stringContaining('14:00'));
    expect(carte).toHaveAttribute('title', expect.stringContaining('15:00'));
    expect(carte).toHaveAttribute('title', expect.stringContaining('RDV au stade'));
  });

  it('appelle onClick avec l\'activité quand on clique sur la carte', () => {
    const onClick = vi.fn();
    const activite = makeActivite();
    render(<ActiviteCarte activite={activite} onClick={onClick} />);

    fireEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledWith(activite);
  });

  it('applique une classe distincte quand la carte est sélectionnée (mode de repli)', () => {
    render(<ActiviteCarte activite={makeActivite()} selectionnee onClick={vi.fn()} />);

    expect(screen.getByRole('button').className).toContain('activite-carte--selectionnee');
  });
});
