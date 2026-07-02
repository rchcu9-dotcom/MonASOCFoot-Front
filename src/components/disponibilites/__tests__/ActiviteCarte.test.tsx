import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActiviteCarte } from '../ActiviteCarte';
import type { ActiviteColonneDto } from '../../../api/disponibilites';

const activite: ActiviteColonneDto = {
  id: 'activite-1',
  date: '2026-07-10',
  heureConvocation: '13:30',
  heureDebut: '15:00',
  label: 'Match amical contre une équipe du district avec un nom particulièrement long',
  type: 'match',
  commentaire: 'Penser aux maillots de rechange',
  equipe: 'A',
};

describe('ActiviteCarte', () => {
  it('affiche la date, l\'heure de début, le label tronqué et la catégorie', () => {
    render(
      <ActiviteCarte
        activite={activite}
        disponibilite={{ statut: 'present', source: 'activite' }}
        onClick={vi.fn()}
      />,
    );

    expect(screen.getByText('2026-07-10')).toBeInTheDocument();
    expect(screen.getByText('15:00')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    // Label tronqué à 40 caractères par défaut (cf. tronquerLabel) : ne doit pas afficher le label complet.
    expect(screen.queryByText(activite.label)).not.toBeInTheDocument();
    expect(screen.getByText(/^Match amical.*…$/)).toBeInTheDocument();
  });

  it('affiche un StatutBadge coloré (non muted) quand la disponibilité a une source connue', () => {
    render(
      <ActiviteCarte
        activite={activite}
        disponibilite={{ statut: 'present', source: 'activite' }}
        onClick={vi.fn()}
      />,
    );

    const badge = screen.getByText('Présent');
    expect(badge.className).not.toContain('statut-badge--muted');
  });

  it('affiche un badge neutre "À renseigner" quand source === "aucune"', () => {
    render(
      <ActiviteCarte
        activite={activite}
        disponibilite={{ statut: 'autre', source: 'aucune' }}
        onClick={vi.fn()}
      />,
    );

    const badge = screen.getByText('À renseigner');
    expect(badge.className).toContain('statut-badge--muted');
    expect(screen.queryByText('Autre')).not.toBeInTheDocument();
  });

  it('appelle onClick au clic sur la carte', () => {
    const onClick = vi.fn();
    render(
      <ActiviteCarte
        activite={activite}
        disponibilite={{ statut: 'present', source: 'journee' }}
        onClick={onClick}
      />,
    );

    fireEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('porte un attribut title avec le label complet, le type, l\'heure de convocation et le commentaire', () => {
    render(
      <ActiviteCarte
        activite={activite}
        disponibilite={{ statut: 'present', source: 'journee' }}
        onClick={vi.fn()}
      />,
    );

    const titre = screen.getByRole('button').getAttribute('title');
    expect(titre).toContain(activite.label);
    expect(titre).toContain('Match');
    expect(titre).toContain('Convocation 13:30');
    expect(titre).toContain('Penser aux maillots de rechange');
  });

  it('omet le commentaire du title quand il est absent (filter(Boolean))', () => {
    const activiteSansCommentaire: ActiviteColonneDto = { ...activite, commentaire: undefined };
    render(
      <ActiviteCarte
        activite={activiteSansCommentaire}
        disponibilite={{ statut: 'present', source: 'journee' }}
        onClick={vi.fn()}
      />,
    );

    const titre = screen.getByRole('button').getAttribute('title');
    expect(titre).not.toContain('undefined');
    expect(titre).toContain('Convocation 13:30');
  });

  it('affiche "Autre" comme libellé de type pour une activité non-match', () => {
    const activiteAutre: ActiviteColonneDto = { ...activite, type: 'autre', label: 'AG annuelle' };
    render(
      <ActiviteCarte
        activite={activiteAutre}
        disponibilite={{ statut: 'present', source: 'journee' }}
        onClick={vi.fn()}
      />,
    );

    const titre = screen.getByRole('button').getAttribute('title');
    expect(titre).toContain('Autre');
  });
});
