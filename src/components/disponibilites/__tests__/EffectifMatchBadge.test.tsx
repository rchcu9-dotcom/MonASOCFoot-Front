import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { EffectifMatchBadge } from '../EffectifMatchBadge';
import type { EffectifMatchBadgeDto } from '../../../api/disponibilites';

const VERT = '#4ade80';
const JAUNE = '#facc15';
const ROUGE = '#f87171';

function makeBadge(overrides: Partial<EffectifMatchBadgeDto> = {}): EffectifMatchBadgeDto {
  return { nbPresents: 11, nbDisponibles: 0, pourcentageSaisie: 70, ...overrides };
}

function renderBadge(overrides: Partial<EffectifMatchBadgeDto> = {}) {
  const { container } = render(<EffectifMatchBadge badge={makeBadge(overrides)} />);
  return container.querySelector('.effectif-match-badge') as HTMLElement;
}

describe('EffectifMatchBadge', () => {
  describe('contenu textuel (inchangé par rapport à l\'existant, cf. critère d\'acceptation 8)', () => {
    it('affiche les 3 informations au singulier (1 présent, 1 disponible)', () => {
      const el = renderBadge({ nbPresents: 1, nbDisponibles: 1, pourcentageSaisie: 50 });

      expect(el.textContent?.replace(/\s+/g, ' ').trim()).toBe('1 présent · 1 disponible · 50% saisi');
    });

    it('accorde au pluriel quand plusieurs présents et plusieurs disponibles', () => {
      const el = renderBadge({ nbPresents: 3, nbDisponibles: 2, pourcentageSaisie: 100 });

      expect(el.textContent?.replace(/\s+/g, ' ').trim()).toBe('3 présents · 2 disponibles · 100% saisi');
    });

    it("affiche 0 présent / 0 disponible / 0% quand personne n'a renseigné sa disponibilité", () => {
      const el = renderBadge({ nbPresents: 0, nbDisponibles: 0, pourcentageSaisie: 0 });

      expect(el.textContent?.replace(/\s+/g, ' ').trim()).toBe('0 présent · 0 disponible · 0% saisi');
    });
  });

  describe('segment « présents » (nouveau seuil dédié : rouge < 11, jaune 11-13, vert >= 14)', () => {
    it.each([
      [0, ROUGE],
      [10, ROUGE],
      [11, JAUNE],
      [13, JAUNE],
      [14, VERT],
      [20, VERT],
    ])('nbPresents = %i → couleur %s', (nbPresents, couleur) => {
      const el = renderBadge({ nbPresents });

      const pill = el.querySelector('.statut-badge')!;
      expect(pill).toHaveTextContent(`${nbPresents} présent${nbPresents > 1 ? 's' : ''}`);
      expect(pill).toHaveStyle({ color: couleur });
    });
  });

  describe('segment « % saisi » (mêmes seuils que la saisie joueur : vert > 80, jaune > 60, rouge sinon)', () => {
    it.each([
      [0, ROUGE],
      [60, ROUGE],
      [61, JAUNE],
      [80, JAUNE],
      [81, VERT],
      [100, VERT],
    ])('pourcentageSaisie = %i → couleur %s', (pourcentageSaisie, couleur) => {
      const el = renderBadge({ pourcentageSaisie });

      const pills = el.querySelectorAll('.statut-badge');
      const pillSaisie = pills[pills.length - 1];
      expect(pillSaisie).toHaveTextContent(`${pourcentageSaisie}% saisi`);
      expect(pillSaisie).toHaveStyle({ color: couleur });
    });
  });

  describe('segment « disponibles » (non concerné par la demande, reste neutre)', () => {
    it.each([0, 1, 5])('nbDisponibles = %i : affiché en texte neutre, sans pastille colorée', (nbDisponibles) => {
      const el = renderBadge({ nbDisponibles });

      // Seuls les segments « présents » et « % saisi » sont des pastilles colorées.
      expect(el.querySelectorAll('.statut-badge')).toHaveLength(2);
      expect(el.textContent?.replace(/\s+/g, ' ')).toContain(
        `${nbDisponibles} disponible${nbDisponibles > 1 ? 's' : ''}`,
      );
    });
  });

  it('les deux segments colorés utilisent le style pastille (fond teinté translucide + texte plein), comme PourcentageBadge/StatutBadge', () => {
    const el = renderBadge({ nbPresents: 2, pourcentageSaisie: 60 });

    const pills = el.querySelectorAll('.statut-badge');
    expect(pills).toHaveLength(2);
    pills.forEach((pill) => {
      expect(pill).toHaveStyle({ color: ROUGE });
      expect((pill as HTMLElement).style.backgroundColor).not.toBe('');
    });
  });
});
