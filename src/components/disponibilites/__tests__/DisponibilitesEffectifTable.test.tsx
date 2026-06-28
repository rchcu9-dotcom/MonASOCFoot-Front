import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DisponibilitesEffectifTable } from '../DisponibilitesEffectifTable';
import type { ActiviteColonneDto, LigneJoueurDto } from '../../../api/disponibilites';

const activites: ActiviteColonneDto[] = [
  { id: 'a1', date: '2026-07-01', heureConvocation: '14:00', heureDebut: '15:00', label: 'Match', type: 'match' },
  { id: 'a2', date: '2026-07-08', heureConvocation: '09:00', heureDebut: '10:00', label: 'Entraînement', type: 'autre' },
];

const joueurs: LigneJoueurDto[] = [
  {
    utilisateurId: 'u1',
    displayName: 'Alice Dupont',
    disponibilites: {
      a1: { statut: 'present', source: 'activite' },
      a2: { statut: 'disponible', source: 'journee' },
    },
  },
  {
    utilisateurId: 'u2',
    displayName: 'Bob Martin',
    disponibilites: {
      a1: { statut: 'absent', source: 'journee' },
      a2: { statut: 'autre', source: 'aucune' },
    },
  },
];

describe('DisponibilitesEffectifTable', () => {
  it('affiche un message quand aucune activité ne correspond au filtre, sans rendre de tableau', () => {
    render(<DisponibilitesEffectifTable activites={[]} joueurs={[]} />);

    expect(screen.getByText(/Aucune activité à venir/)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('affiche une colonne par activité avec son libellé et sa date', () => {
    render(<DisponibilitesEffectifTable activites={activites} joueurs={joueurs} />);

    expect(screen.getByRole('columnheader', { name: /Match/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Entraînement/ })).toBeInTheDocument();
    expect(screen.getByText('2026-07-01')).toBeInTheDocument();
    expect(screen.getByText('2026-07-08')).toBeInTheDocument();
  });

  it('affiche une ligne par joueur avec son displayName', () => {
    render(<DisponibilitesEffectifTable activites={activites} joueurs={joueurs} />);

    expect(screen.getByRole('rowheader', { name: 'Alice Dupont' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Bob Martin' })).toBeInTheDocument();
  });

  it("affiche la disponibilité effective de chaque cellule (priorité activité > journée déjà résolue côté back)", () => {
    render(<DisponibilitesEffectifTable activites={activites} joueurs={joueurs} />);

    const aliceRow = screen.getByRole('rowheader', { name: 'Alice Dupont' }).closest('tr');
    expect(aliceRow).not.toBeNull();
    expect(aliceRow!.textContent).toContain('Présent');
    expect(aliceRow!.textContent).toContain('Disponible');
  });

  it('affiche une cellule neutre pour une disponibilité de source "aucune"', () => {
    render(<DisponibilitesEffectifTable activites={activites} joueurs={joueurs} />);

    const bobRow = screen.getByRole('rowheader', { name: 'Bob Martin' }).closest('tr');
    expect(bobRow!.textContent).toContain('—');
  });

  it("n'expose aucun élément interactif de modification (aucun bouton, aucun lien, aucun input)", () => {
    render(<DisponibilitesEffectifTable activites={activites} joueurs={joueurs} />);

    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });

  it('rend un tableau vide de lignes (en-tête seule) quand il y a des activités mais aucun joueur', () => {
    render(<DisponibilitesEffectifTable activites={activites} joueurs={[]} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.queryAllByRole('row')).toHaveLength(1);
  });
});
