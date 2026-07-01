import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatutBadge } from '../StatutBadge';
import {
  STATUT_DISPONIBILITE_BADGE_STYLES,
  STATUT_DISPONIBILITE_LABELS,
} from '../statutDisponibilite.constants';

describe('StatutBadge', () => {
  it('affiche le libellé "Présent" avec les couleurs pastille du statut "present"', () => {
    render(<StatutBadge statut="present" />);

    const badge = screen.getByText('Présent');
    expect(badge).toHaveStyle({
      backgroundColor: STATUT_DISPONIBILITE_BADGE_STYLES.present.bg,
      color: STATUT_DISPONIBILITE_BADGE_STYLES.present.fg,
    });
  });

  it('affiche le libellé "Disponible" avec les couleurs pastille du statut "disponible"', () => {
    render(<StatutBadge statut="disponible" />);

    const badge = screen.getByText('Disponible');
    expect(badge).toHaveStyle({
      backgroundColor: STATUT_DISPONIBILITE_BADGE_STYLES.disponible.bg,
      color: STATUT_DISPONIBILITE_BADGE_STYLES.disponible.fg,
    });
  });

  it('affiche le libellé "Absent" avec les couleurs pastille du statut "absent"', () => {
    render(<StatutBadge statut="absent" />);

    const badge = screen.getByText('Absent');
    expect(badge).toHaveStyle({
      backgroundColor: STATUT_DISPONIBILITE_BADGE_STYLES.absent.bg,
      color: STATUT_DISPONIBILITE_BADGE_STYLES.absent.fg,
    });
  });

  it('affiche le libellé "Autre" avec les couleurs pastille du statut "autre"', () => {
    render(<StatutBadge statut="autre" />);

    const badge = screen.getByText('Autre');
    expect(badge).toHaveStyle({
      backgroundColor: STATUT_DISPONIBILITE_BADGE_STYLES.autre.bg,
      color: STATUT_DISPONIBILITE_BADGE_STYLES.autre.fg,
    });
  });

  it('affiche tous les libellés définis par STATUT_DISPONIBILITE_LABELS pour chaque statut', () => {
    for (const [statut, label] of Object.entries(STATUT_DISPONIBILITE_LABELS)) {
      const { unmount } = render(<StatutBadge statut={statut as never} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    }
  });

  it('applique le rendu neutre (muted) indépendamment de la couleur du statut', () => {
    render(<StatutBadge statut="present" muted />);

    const badge = screen.getByText('Présent');
    expect(badge).toHaveStyle({ backgroundColor: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8' });
    expect(badge.className).toContain('statut-badge--muted');
  });

  it('affiche un libellé personnalisé quand "label" est fourni, à la place du libellé du statut', () => {
    render(<StatutBadge statut="autre" muted label="À renseigner" />);

    expect(screen.getByText('À renseigner')).toBeInTheDocument();
    expect(screen.queryByText('Autre')).not.toBeInTheDocument();
  });
});
