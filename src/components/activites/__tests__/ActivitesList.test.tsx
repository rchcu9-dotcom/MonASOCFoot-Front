import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { ActivitesList } from '../ActivitesList';
import type { ActiviteDto } from '../../../api/activites';

function makeActivite(overrides: Partial<ActiviteDto> = {}): ActiviteDto {
  return {
    id: 'a1',
    date: '2026-07-01',
    heureConvocation: '14:00',
    heureDebut: '15:00',
    label: 'Match amical',
    type: 'match',
    source: 'manuel',
    ...overrides,
  };
}

describe('ActivitesList', () => {
  it("affiche un message quand la liste est vide, sans tableau", () => {
    render(<ActivitesList activites={[]} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Aucune activité pour le moment.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('affiche une ligne par activité avec ses champs', () => {
    const activite = makeActivite({ commentaire: 'RDV au stade' });
    render(<ActivitesList activites={[activite]} onEdit={vi.fn()} onDelete={vi.fn()} />);

    const row = screen.getByRole('row', { name: /Match amical/ });
    expect(within(row).getByText('2026-07-01')).toBeInTheDocument();
    expect(within(row).getByText('14:00')).toBeInTheDocument();
    expect(within(row).getByText('15:00')).toBeInTheDocument();
    expect(within(row).getByText('match')).toBeInTheDocument();
    expect(within(row).getByText('RDV au stade')).toBeInTheDocument();
  });

  it('trie les activités par date croissante, indépendamment de l\'ordre reçu', () => {
    const recent = makeActivite({ id: 'a-recent', date: '2026-09-01', label: 'Activité récente' });
    const ancienne = makeActivite({ id: 'a-ancienne', date: '2026-01-01', label: 'Activité ancienne' });
    render(<ActivitesList activites={[recent, ancienne]} onEdit={vi.fn()} onDelete={vi.fn()} />);

    const labels = screen.getAllByRole('row').slice(1).map((row) => within(row).getAllByRole('cell')[3].textContent);
    expect(labels).toEqual(['Activité ancienne', 'Activité récente']);
  });

  it('appelle onEdit avec l\'activité correspondante quand on clique sur "Modifier"', () => {
    const onEdit = vi.fn();
    const activite = makeActivite();
    render(<ActivitesList activites={[activite]} onEdit={onEdit} onDelete={vi.fn()} />);

    screen.getByRole('button', { name: 'Modifier' }).click();

    expect(onEdit).toHaveBeenCalledWith(activite);
  });

  it('appelle onDelete avec l\'id correspondant quand on clique sur "Supprimer"', () => {
    const onDelete = vi.fn();
    const activite = makeActivite({ id: 'a-a-supprimer' });
    render(<ActivitesList activites={[activite]} onEdit={vi.fn()} onDelete={onDelete} />);

    screen.getByRole('button', { name: 'Supprimer' }).click();

    expect(onDelete).toHaveBeenCalledWith('a-a-supprimer');
  });

  it('affiche plusieurs activités à la même date sans conflit', () => {
    const activite1 = makeActivite({ id: 'a1', date: '2026-07-01', label: 'Entraînement' });
    const activite2 = makeActivite({ id: 'a2', date: '2026-07-01', label: 'Match' });
    render(<ActivitesList activites={[activite1, activite2]} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Entraînement')).toBeInTheDocument();
    expect(screen.getByText('Match')).toBeInTheDocument();
  });
});
