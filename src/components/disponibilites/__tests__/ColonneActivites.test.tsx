import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColonneActivites } from '../ColonneActivites';
import type { ActiviteColonneDto, DisponibiliteEffectiveDto } from '../../../api/disponibilites';

function makeActivite(overrides: Partial<ActiviteColonneDto> = {}): ActiviteColonneDto {
  return {
    id: 'activite-1',
    date: '2026-07-10',
    heureConvocation: '13:30',
    heureDebut: '15:00',
    label: 'Match amical',
    type: 'match',
    ...overrides,
  };
}

const disponibiliteAucune: DisponibiliteEffectiveDto = { statut: 'autre', source: 'aucune' };

describe('ColonneActivites', () => {
  it('affiche le titre de la colonne', () => {
    render(<ColonneActivites titre="À renseigner" lignes={[]} onSelect={vi.fn()} />);

    expect(screen.getByText('À renseigner')).toBeInTheDocument();
  });

  it('affiche le message vide par défaut quand lignes est vide', () => {
    render(<ColonneActivites titre="Mes disponibilités" lignes={[]} onSelect={vi.fn()} />);

    expect(screen.getByText('Rien à signaler.')).toBeInTheDocument();
  });

  it('affiche un message vide personnalisé quand fourni', () => {
    render(
      <ColonneActivites
        titre="À renseigner"
        lignes={[]}
        onSelect={vi.fn()}
        messageVide="Aucune disponibilité à renseigner."
      />,
    );

    expect(screen.getByText('Aucune disponibilité à renseigner.')).toBeInTheDocument();
  });

  it('ne montre pas le message vide quand des lignes sont fournies', () => {
    const lignes = [{ activite: makeActivite(), disponibilite: disponibiliteAucune }];
    render(<ColonneActivites titre="À renseigner" lignes={lignes} onSelect={vi.fn()} />);

    expect(screen.queryByText('Rien à signaler.')).not.toBeInTheDocument();
  });

  it('affiche une carte par ligne fournie', () => {
    const lignes = [
      { activite: makeActivite({ id: 'a1', label: 'Match A' }), disponibilite: disponibiliteAucune },
      { activite: makeActivite({ id: 'a2', label: 'Match B' }), disponibilite: disponibiliteAucune },
    ];
    render(<ColonneActivites titre="À renseigner" lignes={lignes} onSelect={vi.fn()} />);

    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(screen.getByText('Match A')).toBeInTheDocument();
    expect(screen.getByText('Match B')).toBeInTheDocument();
  });

  it('appelle onSelect avec le bon activiteId au clic sur une carte', () => {
    const onSelect = vi.fn();
    const lignes = [
      { activite: makeActivite({ id: 'a1', label: 'Match A' }), disponibilite: disponibiliteAucune },
      { activite: makeActivite({ id: 'a2', label: 'Match B' }), disponibilite: disponibiliteAucune },
    ];
    render(<ColonneActivites titre="À renseigner" lignes={lignes} onSelect={onSelect} />);

    fireEvent.click(screen.getByText('Match B'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('a2');
  });
});
