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

const matchSuivantDto: ActiviteColonneDto = {
  id: 'm2',
  date: '2026-07-08',
  heureConvocation: '14:00',
  heureDebut: '15:00',
  label: 'Match aller',
  type: 'match',
  equipe: 'B',
};

const matchsAVenir: ActiviteColonneDto[] = [matchCourant, matchSuivantDto];

const badge: EffectifMatchBadgeDto = { nbPresents: 2, nbDisponibles: 1, pourcentageSaisie: 60 };

describe('EffectifMatchNavigation', () => {
  it('affiche le label et la date du match courant', () => {
    render(
      <EffectifMatchNavigation
        matchCourant={matchCourant}
        matchsAVenir={matchsAVenir}
        badge={badge}
        peutReculer
        peutAvancer
        onPrecedent={vi.fn()}
        onSuivant={vi.fn()}
        onSelectionnerMatch={vi.fn()}
      />,
    );

    expect(screen.getByText('Match retour')).toBeInTheDocument();
    expect(screen.getByText('2026-07-01')).toBeInTheDocument();
  });

  it('affiche le badge de synthèse du match courant', () => {
    const { container } = render(
      <EffectifMatchNavigation
        matchCourant={matchCourant}
        matchsAVenir={matchsAVenir}
        badge={badge}
        peutReculer
        peutAvancer
        onPrecedent={vi.fn()}
        onSuivant={vi.fn()}
        onSelectionnerMatch={vi.fn()}
      />,
    );

    const badgeEl = container.querySelector('.effectif-match-badge');
    expect(badgeEl?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      '2 présents · 1 disponible · 60% saisi',
    );
  });

  it('appelle onPrecedent au clic sur la flèche précédente quand elle est active', () => {
    const onPrecedent = vi.fn();

    render(
      <EffectifMatchNavigation
        matchCourant={matchCourant}
        matchsAVenir={matchsAVenir}
        badge={badge}
        peutReculer
        peutAvancer
        onPrecedent={onPrecedent}
        onSuivant={vi.fn()}
        onSelectionnerMatch={vi.fn()}
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
        matchsAVenir={matchsAVenir}
        badge={badge}
        peutReculer
        peutAvancer
        onPrecedent={vi.fn()}
        onSuivant={onSuivant}
        onSelectionnerMatch={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Match suivant' }));

    expect(onSuivant).toHaveBeenCalledTimes(1);
  });

  it('désactive la flèche précédente quand peutReculer est faux', () => {
    render(
      <EffectifMatchNavigation
        matchCourant={matchCourant}
        matchsAVenir={matchsAVenir}
        badge={badge}
        peutReculer={false}
        peutAvancer
        onPrecedent={vi.fn()}
        onSuivant={vi.fn()}
        onSelectionnerMatch={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Match précédent' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Match suivant' })).toBeEnabled();
  });

  it('désactive la flèche suivante quand peutAvancer est faux', () => {
    render(
      <EffectifMatchNavigation
        matchCourant={matchCourant}
        matchsAVenir={matchsAVenir}
        badge={badge}
        peutReculer
        peutAvancer={false}
        onPrecedent={vi.fn()}
        onSuivant={vi.fn()}
        onSelectionnerMatch={vi.fn()}
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
        matchsAVenir={matchsAVenir}
        badge={badge}
        peutReculer={false}
        peutAvancer
        onPrecedent={onPrecedent}
        onSuivant={vi.fn()}
        onSelectionnerMatch={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Match précédent' }));

    expect(onPrecedent).not.toHaveBeenCalled();
  });

  describe('icônes de navigation (chevrons SVG)', () => {
    it('affiche une icône SVG dans la flèche précédente, sans le glyphe texte "←"', () => {
      render(
        <EffectifMatchNavigation
          matchCourant={matchCourant}
          matchsAVenir={matchsAVenir}
          badge={badge}
          peutReculer
          peutAvancer
          onPrecedent={vi.fn()}
          onSuivant={vi.fn()}
          onSelectionnerMatch={vi.fn()}
        />,
      );

      const bouton = screen.getByRole('button', { name: 'Match précédent' });
      expect(bouton.querySelector('svg')).toBeInTheDocument();
      expect(bouton).toHaveTextContent('');
      expect(bouton.textContent).not.toContain('←');
    });

    it('affiche une icône SVG dans la flèche suivante, sans le glyphe texte "→"', () => {
      render(
        <EffectifMatchNavigation
          matchCourant={matchCourant}
          matchsAVenir={matchsAVenir}
          badge={badge}
          peutReculer
          peutAvancer
          onPrecedent={vi.fn()}
          onSuivant={vi.fn()}
          onSelectionnerMatch={vi.fn()}
        />,
      );

      const bouton = screen.getByRole('button', { name: 'Match suivant' });
      expect(bouton.querySelector('svg')).toBeInTheDocument();
      expect(bouton).toHaveTextContent('');
      expect(bouton.textContent).not.toContain('→');
    });

    it('conserve l\'aria-label explicite sur chaque bouton malgré une icône décorative aria-hidden', () => {
      render(
        <EffectifMatchNavigation
          matchCourant={matchCourant}
          matchsAVenir={matchsAVenir}
          badge={badge}
          peutReculer
          peutAvancer
          onPrecedent={vi.fn()}
          onSuivant={vi.fn()}
          onSelectionnerMatch={vi.fn()}
        />,
      );

      expect(screen.getByRole('button', { name: 'Match précédent' })).toHaveAccessibleName(
        'Match précédent',
      );
      expect(screen.getByRole('button', { name: 'Match suivant' })).toHaveAccessibleName(
        'Match suivant',
      );
    });

    it('conserve l\'icône SVG et l\'état désactivé quand la flèche précédente est inactive', () => {
      render(
        <EffectifMatchNavigation
          matchCourant={matchCourant}
          matchsAVenir={matchsAVenir}
          badge={badge}
          peutReculer={false}
          peutAvancer
          onPrecedent={vi.fn()}
          onSuivant={vi.fn()}
          onSelectionnerMatch={vi.fn()}
        />,
      );

      const bouton = screen.getByRole('button', { name: 'Match précédent' });
      expect(bouton).toBeDisabled();
      expect(bouton.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('pop-up de sélection directe (bloc Catégorie/Label/Date cliquable)', () => {
    it("n'affiche aucune pop-up tant qu'on n'a pas cliqué sur le bloc Catégorie/Label/Date", () => {
      render(
        <EffectifMatchNavigation
          matchCourant={matchCourant}
          matchsAVenir={matchsAVenir}
          badge={badge}
          peutReculer
          peutAvancer
          onPrecedent={vi.fn()}
          onSuivant={vi.fn()}
          onSelectionnerMatch={vi.fn()}
        />,
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('ouvre la pop-up de sélection au clic sur le bloc Catégorie/Label/Date', () => {
      render(
        <EffectifMatchNavigation
          matchCourant={matchCourant}
          matchsAVenir={matchsAVenir}
          badge={badge}
          peutReculer
          peutAvancer
          onPrecedent={vi.fn()}
          onSuivant={vi.fn()}
          onSelectionnerMatch={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: /Match retour/ }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Match aller')).toBeInTheDocument();
    });

    it("le clic sur le badge de synthèse n'ouvre pas la pop-up (hors zone cliquable)", () => {
      const { container } = render(
        <EffectifMatchNavigation
          matchCourant={matchCourant}
          matchsAVenir={matchsAVenir}
          badge={badge}
          peutReculer
          peutAvancer
          onPrecedent={vi.fn()}
          onSuivant={vi.fn()}
          onSelectionnerMatch={vi.fn()}
        />,
      );

      fireEvent.click(container.querySelector('.effectif-match-badge')!);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('sélectionner un autre match dans la pop-up appelle onSelectionnerMatch avec son id et referme la pop-up', () => {
      const onSelectionnerMatch = vi.fn();

      render(
        <EffectifMatchNavigation
          matchCourant={matchCourant}
          matchsAVenir={matchsAVenir}
          badge={badge}
          peutReculer
          peutAvancer
          onPrecedent={vi.fn()}
          onSuivant={vi.fn()}
          onSelectionnerMatch={onSelectionnerMatch}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: /Match retour/ }));
      fireEvent.click(screen.getByRole('button', { name: /Match aller/ }));

      expect(onSelectionnerMatch).toHaveBeenCalledWith('m2');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('fermer la pop-up sans sélectionner (bouton "Fermer") ne change pas le match affiché', () => {
      const onSelectionnerMatch = vi.fn();

      render(
        <EffectifMatchNavigation
          matchCourant={matchCourant}
          matchsAVenir={matchsAVenir}
          badge={badge}
          peutReculer
          peutAvancer
          onPrecedent={vi.fn()}
          onSuivant={vi.fn()}
          onSelectionnerMatch={onSelectionnerMatch}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: /Match retour/ }));
      fireEvent.click(screen.getByRole('button', { name: 'Fermer' }));

      expect(onSelectionnerMatch).not.toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('peut être rouverte après fermeture (le déclencheur reste fonctionnel)', () => {
      render(
        <EffectifMatchNavigation
          matchCourant={matchCourant}
          matchsAVenir={matchsAVenir}
          badge={badge}
          peutReculer
          peutAvancer
          onPrecedent={vi.fn()}
          onSuivant={vi.fn()}
          onSelectionnerMatch={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: /Match retour/ }));
      fireEvent.click(screen.getByRole('button', { name: 'Fermer' }));
      fireEvent.click(screen.getByRole('button', { name: /Match retour/ }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
