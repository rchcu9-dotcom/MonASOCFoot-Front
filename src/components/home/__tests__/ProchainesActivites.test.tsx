import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProchainesActivites } from '../ProchainesActivites';
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

describe('ProchainesActivites', () => {
  it("affiche un message quand la liste d'activités est vide", () => {
    render(<ProchainesActivites activites={[]} aujourdhui="2026-07-01" />);

    expect(screen.getByText('Aucune activité à venir.')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('exclut les activités strictement antérieures à la date de référence', () => {
    const passee = makeActivite({ id: 'passee', date: '2026-06-30' });
    render(<ProchainesActivites activites={[passee]} aujourdhui="2026-07-01" />);

    expect(screen.getByText('Aucune activité à venir.')).toBeInTheDocument();
  });

  it("inclut une activité dont la date est exactement égale à la date de référence (aujourd'hui)", () => {
    const aujourdhuiActivite = makeActivite({ id: 'aujourdhui', date: '2026-07-01', label: "Match du jour" });
    render(<ProchainesActivites activites={[aujourdhuiActivite]} aujourdhui="2026-07-01" />);

    expect(screen.getByText('Match du jour')).toBeInTheDocument();
  });

  it('trie les activités à venir par date croissante puis par heure de début croissante', () => {
    const plusTard = makeActivite({ id: 'plus-tard', date: '2026-07-10', heureDebut: '10:00', label: 'Plus tard' });
    const pluTotMemeJour = makeActivite({ id: 'plus-tot-meme-jour', date: '2026-07-05', heureDebut: '09:00', label: 'Tôt même jour' });
    const plusTotMemeJourMaisApres = makeActivite({ id: 'plus-tot-meme-jour-apres', date: '2026-07-05', heureDebut: '18:00', label: 'Tard même jour' });
    render(
      <ProchainesActivites
        activites={[plusTard, plusTotMemeJourMaisApres, pluTotMemeJour]}
        aujourdhui="2026-07-01"
      />,
    );

    const labels = screen.getAllByText(/Tôt même jour|Tard même jour|Plus tard/).map((el) => el.textContent);
    expect(labels).toEqual(['Tôt même jour', 'Tard même jour', 'Plus tard']);
  });

  it('affiche la date, l\'heure de début, le label et le type de chaque activité à venir', () => {
    const activite = makeActivite({
      date: '2026-07-15',
      heureDebut: '16:30',
      label: 'Tournoi U15',
      type: 'autre',
    });
    render(<ProchainesActivites activites={[activite]} aujourdhui="2026-07-01" />);

    expect(screen.getByText('2026-07-15')).toBeInTheDocument();
    expect(screen.getByText('16:30')).toBeInTheDocument();
    expect(screen.getByText('Tournoi U15')).toBeInTheDocument();
    expect(screen.getByText('autre')).toBeInTheDocument();
  });

  it("utilise la date du jour réelle comme référence quand 'aujourdhui' n'est pas fourni", () => {
    const activiteLointaine = makeActivite({ date: '2099-12-31', label: 'Activité très lointaine' });

    render(<ProchainesActivites activites={[activiteLointaine]} />);

    expect(screen.getByText('Activité très lointaine')).toBeInTheDocument();
  });
});
