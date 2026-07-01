import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColonneDate } from '../ColonneDate';
import type { ActiviteDto } from '../../../api/activites';

function makeActivite(overrides: Partial<ActiviteDto> = {}): ActiviteDto {
  return {
    id: 'a1',
    date: '2026-07-10',
    heureConvocation: '14:00',
    heureDebut: '15:00',
    label: 'Match amical',
    type: 'match',
    source: 'manuel',
    ...overrides,
  };
}

describe('ColonneDate', () => {
  it('affiche les activités rattachées à la date', () => {
    const activite = makeActivite();
    render(
      <ColonneDate
        date="2026-07-10"
        activites={[activite]}
        selectionId={null}
        onClickCarte={vi.fn()}
        onClickCible={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /Match amical/ })).toBeInTheDocument();
  });

  it("n'affiche aucune carte quand aucune activité n'est rattachée à cette date", () => {
    render(
      <ColonneDate
        date="2026-07-10"
        activites={[]}
        selectionId={null}
        onClickCarte={vi.fn()}
        onClickCible={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('appelle onClickCarte avec l\'activité quand on clique sur une carte sans sélection active', () => {
    const onClickCarte = vi.fn();
    const activite = makeActivite();
    render(
      <ColonneDate
        date="2026-07-10"
        activites={[activite]}
        selectionId={null}
        onClickCarte={onClickCarte}
        onClickCible={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Match amical/ }));

    expect(onClickCarte).toHaveBeenCalledWith(activite);
  });

  it('appelle onClickCible avec la date quand on clique sur la colonne alors qu\'une carte est sélectionnée (mode de repli)', () => {
    const onClickCible = vi.fn();
    render(
      <ColonneDate
        date="2026-07-10"
        activites={[]}
        selectionId="activite-selectionnee"
        onClickCarte={vi.fn()}
        onClickCible={onClickCible}
      />,
    );

    fireEvent.click(document.querySelector('.colonne-date') as HTMLElement);

    expect(onClickCible).toHaveBeenCalledWith('2026-07-10');
  });

  it("n'appelle pas onClickCible quand on clique sur la colonne sans sélection active", () => {
    const onClickCible = vi.fn();
    render(
      <ColonneDate
        date="2026-07-10"
        activites={[]}
        selectionId={null}
        onClickCarte={vi.fn()}
        onClickCible={onClickCible}
      />,
    );

    fireEvent.click(document.querySelector('.colonne-date') as HTMLElement);

    expect(onClickCible).not.toHaveBeenCalled();
  });
});
