import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategorieActivite } from '../CategorieActivite';

describe('CategorieActivite', () => {
  it('affiche "A" pour equipe="A"', () => {
    render(<CategorieActivite equipe="A" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('affiche "B" pour equipe="B"', () => {
    render(<CategorieActivite equipe="B" />);
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('affiche "Vét" pour equipe="Vet"', () => {
    render(<CategorieActivite equipe="Vet" />);
    expect(screen.getByText('Vét')).toBeInTheDocument();
  });

  it('affiche un tiret quand equipe est absente (ex. AG, barbecue)', () => {
    render(<CategorieActivite />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
