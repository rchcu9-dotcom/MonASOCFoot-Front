import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActiviteAdminCarte } from '../ActiviteAdminCarte';
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

describe('ActiviteAdminCarte', () => {
  it('affiche le label en position dominante, même long, sans troncature', () => {
    const labelLong =
      "Match amical de préparation contre l'équipe voisine du club partenaire, terrain B";
    render(
      <ActiviteAdminCarte activite={makeActivite({ label: labelLong })} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(screen.getByText(labelLong)).toBeInTheDocument();
  });

  it('affiche un badge avec la date de l\'activité', () => {
    render(
      <ActiviteAdminCarte
        activite={makeActivite({ date: '2026-07-01' })}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('2026-07-01')).toBeInTheDocument();
  });

  it('affiche "Sans date" quand la date est absente', () => {
    render(
      <ActiviteAdminCarte activite={makeActivite({ date: undefined })} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(screen.getByText('Sans date')).toBeInTheDocument();
  });

  it("affiche le badge de catégorie d'équipe (via CategorieActivite) quand l'équipe est renseignée", () => {
    render(<ActiviteAdminCarte activite={makeActivite({ equipe: 'B' })} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it("affiche un tiret pour le badge d'équipe quand elle n'est pas renseignée", () => {
    render(
      <ActiviteAdminCarte activite={makeActivite({ equipe: undefined })} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('affiche un badge "Match" pour le type "match"', () => {
    render(<ActiviteAdminCarte activite={makeActivite({ type: 'match' })} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Match')).toBeInTheDocument();
  });

  it('affiche un badge "Autre" pour le type "autre"', () => {
    render(<ActiviteAdminCarte activite={makeActivite({ type: 'autre' })} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Autre')).toBeInTheDocument();
  });

  it('affiche un badge horaires "convocation → début"', () => {
    render(
      <ActiviteAdminCarte
        activite={makeActivite({ heureConvocation: '14:00', heureDebut: '15:00' })}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('14:00 → 15:00')).toBeInTheDocument();
  });

  it('affiche un badge lieu quand il est renseigné', () => {
    render(
      <ActiviteAdminCarte
        activite={makeActivite({ lieu: 'Stade municipal' })}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('Stade municipal')).toBeInTheDocument();
  });

  it("n'affiche aucun badge lieu quand il n'est pas renseigné", () => {
    const { container } = render(
      <ActiviteAdminCarte activite={makeActivite({ lieu: undefined })} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );

    // 4 badges attendus (date, type, horaires) + le badge d'équipe (CategorieActivite) — pas de 5e pour le lieu.
    expect(container.querySelectorAll('.statut-badge')).toHaveLength(3);
  });

  it('affiche le commentaire en texte visible quand il est renseigné', () => {
    render(
      <ActiviteAdminCarte
        activite={makeActivite({ commentaire: 'RDV au stade' })}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('RDV au stade')).toBeInTheDocument();
  });

  it("n'affiche aucun commentaire quand il n'est pas renseigné", () => {
    const { container } = render(
      <ActiviteAdminCarte activite={makeActivite({ commentaire: undefined })} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(container.querySelector('.activite-admin-carte__commentaire')).not.toBeInTheDocument();
  });

  it("appelle onEdit avec l'activité correspondante quand on clique sur \"Modifier\"", () => {
    const onEdit = vi.fn();
    const activite = makeActivite();
    render(<ActiviteAdminCarte activite={activite} onEdit={onEdit} onDelete={vi.fn()} />);

    screen.getByRole('button', { name: 'Modifier' }).click();

    expect(onEdit).toHaveBeenCalledWith(activite);
  });

  it('appelle onDelete avec l\'id correspondant quand on clique sur "Supprimer"', () => {
    const onDelete = vi.fn();
    render(
      <ActiviteAdminCarte activite={makeActivite({ id: 'a-a-supprimer' })} onEdit={vi.fn()} onDelete={onDelete} />,
    );

    screen.getByRole('button', { name: 'Supprimer' }).click();

    expect(onDelete).toHaveBeenCalledWith('a-a-supprimer');
  });
});
