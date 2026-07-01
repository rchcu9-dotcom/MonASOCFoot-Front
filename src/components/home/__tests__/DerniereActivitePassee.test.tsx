import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DerniereActivitePassee } from '../DerniereActivitePassee';
import type { ActiviteAvecDisponibiliteDto } from '../../../api/disponibilites';

function makeLigne(overrides: Partial<ActiviteAvecDisponibiliteDto> = {}): ActiviteAvecDisponibiliteDto {
  return {
    activite: {
      id: 'a1',
      date: '2026-06-20',
      heureConvocation: '14:00',
      heureDebut: '15:00',
      label: 'Match retour',
      type: 'match',
    },
    disponibilite: { statut: 'present', source: 'activite' },
    ...overrides,
  };
}

describe('DerniereActivitePassee', () => {
  it('affiche le message neutre quand dernierePassee est null (aucune activité passée)', () => {
    render(<DerniereActivitePassee dernierePassee={null} onSelect={vi.fn()} />);

    expect(screen.getByText("Aucune activité passée pour l'instant.")).toBeInTheDocument();
  });

  it("affiche une carte d'activité avec le statut quand dernierePassee est fournie", () => {
    render(<DerniereActivitePassee dernierePassee={makeLigne()} onSelect={vi.fn()} />);

    expect(screen.getByText('Match retour')).toBeInTheDocument();
    expect(screen.getByText('Présent')).toBeInTheDocument();
  });

  it('affiche le badge neutre "À renseigner" quand la source est "aucune"', () => {
    render(
      <DerniereActivitePassee
        dernierePassee={makeLigne({ disponibilite: { statut: 'autre', source: 'aucune' } })}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText('À renseigner')).toBeInTheDocument();
  });

  it('appelle onSelect avec activite.id au clic sur la carte', () => {
    const onSelect = vi.fn();
    render(<DerniereActivitePassee dernierePassee={makeLigne()} onSelect={onSelect} />);

    fireEvent.click(screen.getByText('Match retour'));

    expect(onSelect).toHaveBeenCalledWith('a1');
  });
});
