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
  it('affiche un message quand la liste est vide, sans carte', () => {
    const { container } = render(<ActivitesList activites={[]} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Aucune activité pour le moment.')).toBeInTheDocument();
    expect(container.querySelectorAll('.activite-admin-carte')).toHaveLength(0);
  });

  it('affiche une carte par activité avec ses champs', () => {
    const activite = makeActivite({ commentaire: 'RDV au stade' });
    render(<ActivitesList activites={[activite]} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Match amical')).toBeInTheDocument();
    expect(screen.getByText('2026-07-01')).toBeInTheDocument();
    expect(screen.getByText('14:00 → 15:00')).toBeInTheDocument();
    expect(screen.getByText('Match')).toBeInTheDocument();
    expect(screen.getByText('RDV au stade')).toBeInTheDocument();
  });

  it('trie les activités par date croissante, indépendamment de l\'ordre reçu', () => {
    const recent = makeActivite({ id: 'a-recent', date: '2026-09-01', label: 'Activité récente' });
    const ancienne = makeActivite({ id: 'a-ancienne', date: '2026-01-01', label: 'Activité ancienne' });
    const { container } = render(
      <ActivitesList activites={[recent, ancienne]} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );

    const cartes = container.querySelectorAll('.activite-admin-carte');
    expect(cartes[0]).toHaveTextContent('Activité ancienne');
    expect(cartes[1]).toHaveTextContent('Activité récente');
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
    const activite2 = makeActivite({ id: 'a2', date: '2026-07-01', label: 'Match retour' });
    const { container } = render(
      <ActivitesList activites={[activite1, activite2]} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(screen.getByText('Entraînement')).toBeInTheDocument();
    expect(screen.getByText('Match retour')).toBeInTheDocument();
    expect(container.querySelectorAll('.activite-admin-carte')).toHaveLength(2);
  });

  it('affiche "Sans date" pour une activité dont la date est absente', () => {
    const activite = makeActivite({ date: undefined });
    render(<ActivitesList activites={[activite]} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Sans date')).toBeInTheDocument();
  });

  it("affiche l'équipe quand elle est renseignée sur l'activité", () => {
    const activite = makeActivite({ equipe: 'B' });
    render(<ActivitesList activites={[activite]} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it("n'affiche pas de valeur d'équipe quand elle n'est pas renseignée (tiret neutre affiché à la place)", () => {
    const activite = makeActivite({ equipe: undefined });
    const { container } = render(<ActivitesList activites={[activite]} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(within(container).getByText('—')).toBeInTheDocument();
  });

  it('affiche le lieu quand il est renseigné sur l\'activité', () => {
    const activite = makeActivite({ lieu: 'Stade municipal' });
    render(<ActivitesList activites={[activite]} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Stade municipal')).toBeInTheDocument();
  });

  it("n'affiche pas de badge lieu quand il n'est pas renseigné (y compris activités créées avant cette feature)", () => {
    const activite = makeActivite({ lieu: undefined });
    const { container } = render(<ActivitesList activites={[activite]} onEdit={vi.fn()} onDelete={vi.fn()} />);

    // Sur cette carte : date + type + horaires = 3 pastilles ".statut-badge", pas de 4e pour le lieu.
    expect(container.querySelectorAll('.statut-badge')).toHaveLength(3);
  });
});
