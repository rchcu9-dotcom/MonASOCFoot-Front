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
  it("affiche un message neutre quand prochainesDates est vide (aucune activité à venir)", () => {
    render(<ProchainesDatesActivites prochainesDates={[]} onSelect={vi.fn()} />);

    expect(screen.getByText('Aucune activité à venir.')).toBeInTheDocument();
  });

  it('affiche une section par date avec le titre = la date', () => {
    const prochainesDates: ProchaineDateAccueilDto[] = [
      { date: '2026-07-01', activites: [makeLigne('a1', 'Entraînement')] },
      { date: '2026-07-08', activites: [makeLigne('a2', 'Match')] },
    ];

    render(<ProchainesDatesActivites prochainesDates={prochainesDates} onSelect={vi.fn()} />);

    expect(screen.getByRole('heading', { level: 2, name: '2026-07-01' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '2026-07-08' })).toBeInTheDocument();
  });

  it("n'affiche que les dates fournies (pas de remplissage à 3 dates)", () => {
    const prochainesDates: ProchaineDateAccueilDto[] = [
      { date: '2026-07-01', activites: [makeLigne('a1', 'Entraînement')] },
    ];

    render(<ProchainesDatesActivites prochainesDates={prochainesDates} onSelect={vi.fn()} />);

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1);
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
});
