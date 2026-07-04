import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProchainesDatesActivites } from '../ProchainesDatesActivites';
import type { ActiviteAvecDisponibiliteDto, ProchaineDateAccueilDto } from '../../../api/disponibilites';

function makeLigne(
  id: string,
  label: string,
  overrides: Partial<ActiviteAvecDisponibiliteDto> = {},
): ActiviteAvecDisponibiliteDto {
  return {
    activite: {
      id,
      date: '2026-07-01',
      heureConvocation: '14:00',
      heureDebut: '15:00',
      label,
      type: 'match',
    },
    disponibilite: { statut: 'autre', source: 'aucune' },
    ...overrides,
  };
}

describe('ProchainesDatesActivites', () => {
  it('affiche le titre englobant « Mes activités à venir » qu\'il y ait ou non des activités à venir', () => {
    const { rerender } = render(<ProchainesDatesActivites prochainesDates={[]} onSelect={vi.fn()} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Mes activités à venir' })).toBeInTheDocument();

    rerender(
      <ProchainesDatesActivites
        prochainesDates={[{ date: '2026-07-01', activites: [makeLigne('a1', 'Entraînement')] }]}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Mes activités à venir' })).toBeInTheDocument();
  });

  it("affiche un message neutre quand prochainesDates est vide (aucune activité à venir)", () => {
    render(<ProchainesDatesActivites prochainesDates={[]} onSelect={vi.fn()} />);

    expect(screen.getByText('Aucune activité à venir.')).toBeInTheDocument();
  });

  it("n'affiche plus le titre générique « Prochaines activités » (remplacé par le titre englobant)", () => {
    render(<ProchainesDatesActivites prochainesDates={[]} onSelect={vi.fn()} />);

    expect(screen.queryByText('Prochaines activités')).not.toBeInTheDocument();
  });

  it('affiche une section par date avec un sous-titre = la date, sous le titre englobant', () => {
    const prochainesDates: ProchaineDateAccueilDto[] = [
      { date: '2026-07-01', activites: [makeLigne('a1', 'Entraînement')] },
      { date: '2026-07-08', activites: [makeLigne('a2', 'Match')] },
    ];

    render(<ProchainesDatesActivites prochainesDates={prochainesDates} onSelect={vi.fn()} />);

    expect(screen.getByRole('heading', { level: 3, name: '2026-07-01' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: '2026-07-08' })).toBeInTheDocument();
  });

  it("n'affiche que les dates fournies (pas de remplissage à 3 dates)", () => {
    const prochainesDates: ProchaineDateAccueilDto[] = [
      { date: '2026-07-01', activites: [makeLigne('a1', 'Entraînement')] },
    ];

    render(<ProchainesDatesActivites prochainesDates={prochainesDates} onSelect={vi.fn()} />);

    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1);
  });

  it("affiche toutes les activités d'une même date avec leur statut respectif", () => {
    const prochainesDates: ProchaineDateAccueilDto[] = [
      {
        date: '2026-07-01',
        activites: [
          makeLigne('a1', 'Entraînement', { disponibilite: { statut: 'present', source: 'journee' } }),
          makeLigne('a2', 'Match', { disponibilite: { statut: 'absent', source: 'activite' } }),
        ],
      },
    ];

    render(<ProchainesDatesActivites prochainesDates={prochainesDates} onSelect={vi.fn()} />);

    expect(screen.getByText('Entraînement')).toBeInTheDocument();
    expect(screen.getByText('Présent')).toBeInTheDocument();
    expect(screen.getByText('Match')).toBeInTheDocument();
    expect(screen.getByText('Absent')).toBeInTheDocument();
  });

  it("appelle onSelect avec l'id de l'activité cliquée", () => {
    const onSelect = vi.fn();
    const prochainesDates: ProchaineDateAccueilDto[] = [
      { date: '2026-07-01', activites: [makeLigne('a1', 'Entraînement')] },
    ];

    render(<ProchainesDatesActivites prochainesDates={prochainesDates} onSelect={onSelect} />);

    fireEvent.click(screen.getByText('Entraînement'));

    expect(onSelect).toHaveBeenCalledWith('a1');
  });

  describe('couleur de contour par rang de date (CA1 à CA4)', () => {
    const VERT = '#4ade80';
    const JAUNE = '#facc15';
    const ROUGE = '#f87171';

    it('CA1 — applique le contour rouge à une activité non renseignée de la 1ʳᵉ date (la plus proche)', () => {
      const prochainesDates: ProchaineDateAccueilDto[] = [
        { date: '2026-07-01', activites: [makeLigne('a1', 'Entraînement')] },
        { date: '2026-07-08', activites: [makeLigne('a2', 'Match')] },
      ];

      render(<ProchainesDatesActivites prochainesDates={prochainesDates} onSelect={vi.fn()} />);

      const boutons = screen.getAllByRole('button');
      expect(boutons[0].style.getPropertyValue('--contour')).toBe(ROUGE);
    });

    it('CA2 — applique le contour jaune à une activité non renseignée d\'une date suivante (2ᵉ/3ᵉ position)', () => {
      const prochainesDates: ProchaineDateAccueilDto[] = [
        { date: '2026-07-01', activites: [makeLigne('a1', 'Entraînement')] },
        { date: '2026-07-08', activites: [makeLigne('a2', 'Match')] },
        { date: '2026-07-15', activites: [makeLigne('a3', 'AG')] },
      ];

      render(<ProchainesDatesActivites prochainesDates={prochainesDates} onSelect={vi.fn()} />);

      const boutons = screen.getAllByRole('button');
      expect(boutons[1].style.getPropertyValue('--contour')).toBe(JAUNE); // 2ᵉ date
      expect(boutons[2].style.getPropertyValue('--contour')).toBe(JAUNE); // 3ᵉ date
    });

    it('CA3 — applique le contour vert à une activité renseignée quelle que soit sa position, y compris la 1ʳᵉ date', () => {
      const prochainesDates: ProchaineDateAccueilDto[] = [
        {
          date: '2026-07-01',
          activites: [makeLigne('a1', 'Entraînement', { disponibilite: { statut: 'present', source: 'activite' } })],
        },
        {
          date: '2026-07-08',
          activites: [makeLigne('a2', 'Match', { disponibilite: { statut: 'absent', source: 'journee' } })],
        },
      ];

      render(<ProchainesDatesActivites prochainesDates={prochainesDates} onSelect={vi.fn()} />);

      const boutons = screen.getAllByRole('button');
      expect(boutons[0].style.getPropertyValue('--contour')).toBe(VERT);
      expect(boutons[1].style.getPropertyValue('--contour')).toBe(VERT);
    });

    it('CA4 — avec une seule date affichée, une activité non renseignée est rouge, jamais jaune', () => {
      const prochainesDates: ProchaineDateAccueilDto[] = [
        { date: '2026-07-01', activites: [makeLigne('a1', 'Entraînement')] },
      ];

      render(<ProchainesDatesActivites prochainesDates={prochainesDates} onSelect={vi.fn()} />);

      expect(screen.getByRole('button').style.getPropertyValue('--contour')).toBe(ROUGE);
    });

    it('applique la même couleur (rouge) à toutes les activités non renseignées de la 1ʳᵉ date quand il y en a plusieurs', () => {
      const prochainesDates: ProchaineDateAccueilDto[] = [
        {
          date: '2026-07-01',
          activites: [makeLigne('a1', 'Entraînement'), makeLigne('a2', 'Match')],
        },
      ];

      render(<ProchainesDatesActivites prochainesDates={prochainesDates} onSelect={vi.fn()} />);

      const boutons = screen.getAllByRole('button');
      expect(boutons[0].style.getPropertyValue('--contour')).toBe(ROUGE);
      expect(boutons[1].style.getPropertyValue('--contour')).toBe(ROUGE);
    });
  });
});
