import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DisponibilitesEffectifPage } from '../DisponibilitesEffectifPage';
import { useDisponibilitesEffectif } from '../../hooks/useDisponibilitesEffectif';
import type { ActiviteColonneDto, LigneJoueurDto } from '../../api/disponibilites';

vi.mock('../../hooks/useDisponibilitesEffectif');

const activites: ActiviteColonneDto[] = [
  { id: 'a1', date: '2026-07-01', heureConvocation: '14:00', heureDebut: '15:00', label: 'Match', type: 'match' },
];

const joueurs: LigneJoueurDto[] = [
  { utilisateurId: 'u1', displayName: 'Alice Dupont', disponibilites: { a1: { statut: 'present', source: 'activite' } } },
];

function mockUseDisponibilitesEffectif(overrides: Partial<ReturnType<typeof useDisponibilitesEffectif>>) {
  vi.mocked(useDisponibilitesEffectif).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    ...overrides,
  } as ReturnType<typeof useDisponibilitesEffectif>);
}

describe('DisponibilitesEffectifPage', () => {
  beforeEach(() => {
    vi.mocked(useDisponibilitesEffectif).mockReset();
  });

  it('affiche le message de chargement pendant isLoading, sans tableau ni filtre', () => {
    mockUseDisponibilitesEffectif({ isLoading: true });

    render(<DisponibilitesEffectifPage />);

    expect(screen.getByText(/Chargement des disponibilités/)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it("affiche un message d'erreur quand isError est vrai", () => {
    mockUseDisponibilitesEffectif({ isError: true });

    render(<DisponibilitesEffectifPage />);

    expect(screen.getByText(/Impossible de charger les disponibilités/)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('affiche le filtre et le tableau quand les données sont chargées avec succès', () => {
    mockUseDisponibilitesEffectif({ data: { activites, joueurs } });

    render(<DisponibilitesEffectifPage />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Alice Dupont')).toBeInTheDocument();
  });

  it('affiche le message "vide" du tableau quand les données sont chargées mais sans activité', () => {
    mockUseDisponibilitesEffectif({ data: { activites: [], joueurs: [] } });

    render(<DisponibilitesEffectifPage />);

    expect(screen.getByText(/Aucune activité à venir/)).toBeInTheDocument();
  });

  it('met à jour le filtre transmis au hook quand on change la sélection (re-render avec le nouveau filtre)', () => {
    mockUseDisponibilitesEffectif({ data: { activites, joueurs } });

    render(<DisponibilitesEffectifPage />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'a1' } });

    // Le changement de filtre déclenche un nouveau rendu : on vérifie que le hook est rappelé
    // avec le nouveau filtre (deuxième render après le mount).
    const lastCallArgs = vi.mocked(useDisponibilitesEffectif).mock.calls.at(-1);
    expect(lastCallArgs?.[0]).toEqual({ activiteId: 'a1' });
  });

  it("n'expose aucun élément interactif de modification (aucun bouton, lien ou champ de saisie)", () => {
    mockUseDisponibilitesEffectif({ data: { activites, joueurs } });

    render(<DisponibilitesEffectifPage />);

    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
  });
});
