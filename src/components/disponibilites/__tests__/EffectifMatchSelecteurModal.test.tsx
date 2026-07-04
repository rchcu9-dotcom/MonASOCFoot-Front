import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EffectifMatchSelecteurModal } from '../EffectifMatchSelecteurModal';
import type { ActiviteColonneDto } from '../../../api/disponibilites';

const match1: ActiviteColonneDto = {
  id: 'm1',
  date: '2026-07-01',
  heureConvocation: '14:00',
  heureDebut: '15:00',
  label: 'Match retour',
  type: 'match',
  equipe: 'A',
};

const match2: ActiviteColonneDto = {
  id: 'm2',
  date: '2026-07-08',
  heureConvocation: '14:00',
  heureDebut: '15:00',
  label: 'Match aller',
  type: 'match',
  equipe: 'B',
};

const match3: ActiviteColonneDto = {
  id: 'm3',
  date: '2026-07-15',
  heureConvocation: '14:00',
  heureDebut: '15:00',
  label: 'Match retour Vét',
  type: 'match',
  equipe: 'Vet',
};

const matchsAVenir = [match1, match2, match3];

describe('EffectifMatchSelecteurModal', () => {
  beforeEach(() => {
    // jsdom n'implémente pas scrollIntoView : on le mocke pour vérifier qu'il est bien appelé.
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('a le rôle dialog, aria-modal et un libellé accessible', () => {
    render(
      <EffectifMatchSelecteurModal
        matchsAVenir={matchsAVenir}
        matchCourantId="m2"
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('Sélectionner un match');
  });

  it('affiche tous les matchs à venir, dans l\'ordre fourni', () => {
    render(
      <EffectifMatchSelecteurModal
        matchsAVenir={matchsAVenir}
        matchCourantId="m2"
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('Match retour');
    expect(items[1]).toHaveTextContent('Match aller');
    expect(items[2]).toHaveTextContent('Match retour Vét');
  });

  it('met en évidence le match courant (aria-current + classe modificatrice), sans affecter les autres lignes', () => {
    render(
      <EffectifMatchSelecteurModal
        matchsAVenir={matchsAVenir}
        matchCourantId="m2"
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    const boutonSelectionne = screen.getByRole('button', { name: /Match aller/ });
    expect(boutonSelectionne).toHaveAttribute('aria-current', 'true');
    expect(boutonSelectionne.className).toContain('effectif-match-selecteur-modal__item--selectionne');

    const autreBouton = screen.getByRole('button', { name: /Match retour Vét/ });
    expect(autreBouton).not.toHaveAttribute('aria-current');
    expect(autreBouton.className).not.toContain('--selectionne');
  });

  it('positionne le scroll sur le match courant au montage (scrollIntoView appelé)', () => {
    render(
      <EffectifMatchSelecteurModal
        matchsAVenir={matchsAVenir}
        matchCourantId="m2"
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({ block: 'center' });
  });

  it('appelle onSelect avec l\'id du match cliqué (match différent du match courant)', () => {
    const onSelect = vi.fn();

    render(
      <EffectifMatchSelecteurModal
        matchsAVenir={matchsAVenir}
        matchCourantId="m2"
        onSelect={onSelect}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Match retour Vét/ }));

    expect(onSelect).toHaveBeenCalledWith('m3');
  });

  it('appelle aussi onSelect en cliquant sur le match déjà sélectionné (pas de cas spécial dans la pop-up)', () => {
    const onSelect = vi.fn();

    render(
      <EffectifMatchSelecteurModal
        matchsAVenir={matchsAVenir}
        matchCourantId="m2"
        onSelect={onSelect}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Match aller/ }));

    expect(onSelect).toHaveBeenCalledWith('m2');
  });

  it("ferme au clic sur l'overlay", () => {
    const onClose = vi.fn();

    const { container } = render(
      <EffectifMatchSelecteurModal
        matchsAVenir={matchsAVenir}
        matchCourantId="m2"
        onSelect={vi.fn()}
        onClose={onClose}
      />,
    );

    fireEvent.click(container.querySelector('.confirm-dialog__overlay')!);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("ne ferme pas au clic à l'intérieur de la pop-up (propagation stoppée)", () => {
    const onClose = vi.fn();

    render(
      <EffectifMatchSelecteurModal
        matchsAVenir={matchsAVenir}
        matchCourantId="m2"
        onSelect={vi.fn()}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByText('Sélectionner un match'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('ferme au clic sur le bouton "Fermer"', () => {
    const onClose = vi.fn();

    render(
      <EffectifMatchSelecteurModal
        matchsAVenir={matchsAVenir}
        matchCourantId="m2"
        onSelect={vi.fn()}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Fermer' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("ferme à l'appui sur la touche Échap", () => {
    const onClose = vi.fn();

    render(
      <EffectifMatchSelecteurModal
        matchsAVenir={matchsAVenir}
        matchCourantId="m2"
        onSelect={vi.fn()}
        onClose={onClose}
      />,
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("ne ferme pas sur une autre touche que Échap", () => {
    const onClose = vi.fn();

    render(
      <EffectifMatchSelecteurModal
        matchsAVenir={matchsAVenir}
        matchCourantId="m2"
        onSelect={vi.fn()}
        onClose={onClose}
      />,
    );

    fireEvent.keyDown(document, { key: 'Enter' });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("affiche un unique match déjà en évidence quand un seul match à venir existe", () => {
    render(
      <EffectifMatchSelecteurModal
        matchsAVenir={[match1]}
        matchCourantId="m1"
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(1);
    expect(screen.getByRole('button', { name: /Match retour/ })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });
});
