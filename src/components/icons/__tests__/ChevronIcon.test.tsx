import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ChevronIcon } from '../ChevronIcon';

describe('ChevronIcon', () => {
  it('affiche un SVG décoratif (aria-hidden)', () => {
    const { container } = render(<ChevronIcon direction="right" />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('ne porte aucun texte ni nom accessible propre (délégué au bouton parent)', () => {
    const { container } = render(<ChevronIcon direction="right" />);

    expect(container.textContent).toBe('');
  });

  it("n'applique aucune transformation miroir pour direction=\"right\"", () => {
    const { container } = render(<ChevronIcon direction="right" />);

    const svg = container.querySelector('svg');
    expect(svg?.style.transform).toBe('');
  });

  it('applique un miroir horizontal (scaleX(-1)) pour direction="left"', () => {
    const { container } = render(<ChevronIcon direction="left" />);

    const svg = container.querySelector('svg');
    expect(svg?.style.transform).toBe('scaleX(-1)');
  });

  it('dimensionne le SVG en 1em pour suivre le font-size du parent', () => {
    const { container } = render(<ChevronIcon direction="right" />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '1em');
    expect(svg).toHaveAttribute('height', '1em');
  });

  it('utilise currentColor pour le trait, cohérent en thème clair/sombre', () => {
    const { container } = render(<ChevronIcon direction="right" />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('stroke', 'currentColor');
  });
});
