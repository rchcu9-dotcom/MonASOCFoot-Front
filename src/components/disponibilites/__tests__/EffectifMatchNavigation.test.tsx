import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EffectifMatchNavigation } from '../EffectifMatchNavigation';
import type { ActiviteColonneDto, EffectifMatchBadgeDto } from '../../../api/disponibilites';

const matchCourant: ActiviteColonneDto = {
  id: 'm1',
  date: '2026-07-01',
  heureConvocation: '14:00',
  heureDebut: '15:00',
  label: 'Match retour',
  type: 'match',
  equipe: 'A',
};

const badge: EffectifMatchBadgeDto = { nbPresents: 2, nbDisponibles: 1, pourcentageSaisie: 60 };

describe('EffectifMatchNavigation', () => {
  it('affiche le label et la date du match courant', () => {
    render(
      <EffectifMatchNavigation
        matchCourant={matchCourant}
        badge={badge}
        peutReculer
        peutAvancer
        onPrecedent={vi.fn()}
        onSuivant={vi.fn()}
      />,
    );

    expect(screen.getByText('Match retour')).toBeInTheDocument();
    expect(screen.getByText('2026-07-01')).toBeInTheDocument();
  });

  it('affiche le badge de synthèse du match courant', () => {
    render(
      <EffectifMatchNavigation
        matchCourant={matchCourant}
        badge={badge}
        peutReculer
        peutAvancer
        onPrecedent={vi.fn()}
        onSuivant={vi.fn()}
      />,
    );

    expect(screen.getByText('2 présents · 1 disponible · 60% saisi')).toBeInTheDocument();
  });

  it('appelle onPrecedent au clic sur la flèche précédente quand elle est active', () => {
    const onPrecedent = vi.fn();

    render(
      <EffectifMatchNavigation
        matchCourant={matchCourant}
        badge={badge}
        peutReculer
        peutAvancer
        onPrecedent={onPrecedent}
        onSuivant={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Match précédent' }));

    expect(onPrecedent).toHaveBeenCalledTimes(1);
  });

  it('appelle onSuivant au clic sur la flèche suivante quand elle est active', () => {
    const onSuivant = vi.fn();

    render(
      <EffectifMatchNavigation
        matchCourant={matchCourant}
        badge={badge}
        peutReculer
        peutAvancer
        onPrecedent={vi.fn()}
        onSuivant={onSuivant}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Match suivant' }));

    expect(onSuivant).toHaveBeenCalledTimes(1);
  });

  it('désactive la flèche précédente quand peutReculer est faux', () => {
    render(
      <EffectifMatchNavigation
        matchCourant={matchCourant}
        badge={badge}
        peutReculer={false}
        peutAvancer
        onPrecedent={vi.fn()}
        onSuivant={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Match précédent' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Match suivant' })).toBeEnabled();
  });

  it('désactive la flèche suivante quand peutAvancer est faux', () => {
    render(
      <EffectifMatchNavigation
        matchCourant={matchCourant}
        badge={badge}
        peutReculer
        peutAvancer={false}
        onPrecedent={vi.fn()}
        onSuivant={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Match suivant' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Match précédent' })).toBeEnabled();
  });

  it("n'appelle pas onPrecedent au clic sur une flèche désactivée", () => {
    const onPrecedent = vi.fn();

    render(
      <EffectifMatchNavigation
        matchCourant={matchCourant}
        badge={badge}
        peutReculer={false}
        peutAvancer
        onPrecedent={onPrecedent}
        onSuivant={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Match précédent' }));

    expect(onPrecedent).not.toHaveBeenCalled();
  });
});
