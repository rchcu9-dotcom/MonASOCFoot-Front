import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DisponibilitesEffectifPage } from '../DisponibilitesEffectifPage';
import { useEffectifMatch } from '../../hooks/useEffectifMatch';
import type { EffectifMatchResponseDto, JoueurEffectifMatchDto } from '../../api/disponibilites';

vi.mock('../../hooks/useEffectifMatch');

const matchCourant: EffectifMatchResponseDto['matchCourant'] = {
  id: 'm1',
  date: '2026-07-01',
  heureConvocation: '14:00',
  heureDebut: '15:00',
  label: 'Match retour',
  type: 'match',
};

const matchSuivantDto: NonNullable<EffectifMatchResponseDto['matchCourant']> = {
  id: 'm2',
  date: '2026-07-08',
  heureConvocation: '14:00',
  heureDebut: '15:00',
  label: 'Match aller',
  type: 'match',
};

const joueurs: JoueurEffectifMatchDto[] = [
  {
    utilisateurId: 'u1',
    displayName: 'Alice Dupont',
    pourcentageMatchsAVenirRenseignes: 50,
    disponibiliteMatchCourant: { statut: 'present', source: 'activite' },
  },
];

const reponseAvecMatch: EffectifMatchResponseDto = {
  matchCourant,
  matchPrecedentId: 'm0',
  matchSuivantId: 'm2',
  badge: { nbPresents: 1, nbDisponibles: 0, pourcentageSaisie: 100 },
  matchsAVenir: [matchCourant!, matchSuivantDto],
  joueurs,
};

const reponseAucunMatch: EffectifMatchResponseDto = {
  matchCourant: null,
  matchPrecedentId: null,
  matchSuivantId: null,
  badge: null,
  matchsAVenir: [],
  joueurs: [],
};

function mockUseEffectifMatch(overrides: Partial<ReturnType<typeof useEffectifMatch>>) {
  vi.mocked(useEffectifMatch).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    ...overrides,
  } as ReturnType<typeof useEffectifMatch>);
}

describe('DisponibilitesEffectifPage', () => {
  beforeEach(() => {
    vi.mocked(useEffectifMatch).mockReset();
  });

  it('affiche le message de chargement pendant isLoading, sans navigation ni cartes joueurs', () => {
    mockUseEffectifMatch({ isLoading: true });

    const { container } = render(<DisponibilitesEffectifPage />);

    expect(screen.getByText(/Chargement des disponibilités/)).toBeInTheDocument();
    expect(container.querySelector('.effectif-joueur-carte')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it("affiche un message d'erreur quand isError est vrai", () => {
    mockUseEffectifMatch({ isError: true });

    const { container } = render(<DisponibilitesEffectifPage />);

    expect(screen.getByText(/Impossible de charger les disponibilités/)).toBeInTheDocument();
    expect(container.querySelector('.effectif-joueur-carte')).not.toBeInTheDocument();
  });

  it('affiche la navigation et les cartes des joueurs quand un match est à afficher', () => {
    mockUseEffectifMatch({ data: reponseAvecMatch });

    const { container } = render(<DisponibilitesEffectifPage />);

    expect(screen.getByText('Match retour')).toBeInTheDocument();
    expect(container.querySelectorAll('.effectif-joueur-carte')).toHaveLength(1);
    expect(screen.getByText('Alice Dupont')).toBeInTheDocument();
  });

  it('affiche "Aucun match à venir." quand matchCourant est null, sans navigation ni cartes joueurs', () => {
    mockUseEffectifMatch({ data: reponseAucunMatch });

    const { container } = render(<DisponibilitesEffectifPage />);

    expect(screen.getByText('Aucun match à venir.')).toBeInTheDocument();
    expect(container.querySelector('.effectif-joueur-carte')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it("n'affiche plus de menu déroulant (liste des activités) : navigation uniquement par flèches", () => {
    mockUseEffectifMatch({ data: reponseAvecMatch });

    render(<DisponibilitesEffectifPage />);

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Match précédent' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Match suivant' })).toBeInTheDocument();
  });

  it('sélectionne le match suivant au clic sur la flèche droite (re-render avec le nouveau matchId)', () => {
    mockUseEffectifMatch({ data: reponseAvecMatch });

    render(<DisponibilitesEffectifPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Match suivant' }));

    const lastCallArgs = vi.mocked(useEffectifMatch).mock.calls.at(-1);
    expect(lastCallArgs?.[0]).toBe('m2');
  });

  it('sélectionne le match précédent au clic sur la flèche gauche (re-render avec le nouveau matchId)', () => {
    mockUseEffectifMatch({ data: reponseAvecMatch });

    render(<DisponibilitesEffectifPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Match précédent' }));

    const lastCallArgs = vi.mocked(useEffectifMatch).mock.calls.at(-1);
    expect(lastCallArgs?.[0]).toBe('m0');
  });

  it("n'expose aucun élément de modification de donnée (aucun lien ni champ de saisie ; seuls navigation et sélecteur de match sont interactifs)", () => {
    mockUseEffectifMatch({ data: reponseAvecMatch });

    render(<DisponibilitesEffectifPage />);

    expect(screen.queryAllByRole('link')).toHaveLength(0);
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
    // Flèche précédente, flèche suivante, bouton déclencheur de la pop-up de sélection.
    expect(screen.queryAllByRole('button')).toHaveLength(3);
  });

  it('ouvre la pop-up de sélection au clic sur le bloc Catégorie/Label/Date et sélectionne un autre match', () => {
    mockUseEffectifMatch({ data: reponseAvecMatch });

    render(<DisponibilitesEffectifPage />);

    fireEvent.click(screen.getByRole('button', { name: /Match retour/ }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Match aller/ }));

    const lastCallArgs = vi.mocked(useEffectifMatch).mock.calls.at(-1);
    expect(lastCallArgs?.[0]).toBe('m2');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
