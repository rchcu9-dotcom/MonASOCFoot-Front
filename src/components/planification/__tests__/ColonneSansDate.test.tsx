import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColonneSansDate } from '../ColonneSansDate';
import type { ActiviteDto } from '../../../api/activites';

function makeActivite(overrides: Partial<ActiviteDto> = {}): ActiviteDto {
  return {
    id: 'a1',
    date: undefined,
    heureConvocation: '14:00',
    heureDebut: '15:00',
    label: 'Match amical',
    type: 'match',
    source: 'manuel',
    ...overrides,
  };
}

describe('ColonneSansDate', () => {
  it("affiche un message quand aucune activité n'est sans date", () => {
    render(
      <ColonneSansDate activites={[]} selectionId={null} onClickCarte={vi.fn()} onClickCible={vi.fn()} />,
    );

    expect(screen.getByText('Aucune activité sans date.')).toBeInTheDocument();
  });

  it('affiche une carte par activité sans date', () => {
    const activite = makeActivite();
    render(
      <ColonneSansDate
        activites={[activite]}
        selectionId={null}
        onClickCarte={vi.fn()}
        onClickCible={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /Match amical/ })).toBeInTheDocument();
  });

  it('appelle onClickCarte quand on clique sur une carte alors qu\'aucune sélection n\'est active', () => {
    const onClickCarte = vi.fn();
    const activite = makeActivite();
    render(
      <ColonneSansDate
        activites={[activite]}
        selectionId={null}
        onClickCarte={onClickCarte}
        onClickCible={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Match amical/ }));

    expect(onClickCarte).toHaveBeenCalledWith(activite);
  });

  it('appelle onClickCible (mode de repli) quand on clique sur la colonne alors qu\'une carte est sélectionnée', () => {
    const onClickCible = vi.fn();
    render(
      <ColonneSansDate
        activites={[]}
        selectionId="activite-selectionnee"
        onClickCarte={vi.fn()}
        onClickCible={onClickCible}
      />,
    );

    fireEvent.click(screen.getByText('Aucune activité sans date.').parentElement as HTMLElement);

    expect(onClickCible).toHaveBeenCalledTimes(1);
  });

  it("n'appelle pas onClickCible quand on clique sur la colonne sans sélection active", () => {
    const onClickCible = vi.fn();
    render(
      <ColonneSansDate
        activites={[]}
        selectionId={null}
        onClickCarte={vi.fn()}
        onClickCible={onClickCible}
      />,
    );

    fireEvent.click(screen.getByText('Aucune activité sans date.').parentElement as HTMLElement);

    expect(onClickCible).not.toHaveBeenCalled();
  });
});
