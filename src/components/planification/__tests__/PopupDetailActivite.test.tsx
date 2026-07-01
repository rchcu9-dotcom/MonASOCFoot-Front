import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PopupDetailActivite } from '../PopupDetailActivite';
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

function renderPopup(activite: ActiviteDto, onClose = vi.fn()) {
  return render(<PopupDetailActivite activite={activite} onClose={onClose} />, {
    wrapper: MemoryRouter,
  });
}

describe('PopupDetailActivite', () => {
  it("affiche le détail complet de l'activité", () => {
    renderPopup(makeActivite({ equipe: 'B', commentaire: 'RDV au stade' }));

    expect(screen.getByRole('heading', { name: 'Match amical' })).toBeInTheDocument();
    expect(screen.getByText('Match')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('2026-07-01')).toBeInTheDocument();
    expect(screen.getByText('14:00')).toBeInTheDocument();
    expect(screen.getByText('15:00')).toBeInTheDocument();
    expect(screen.getByText('RDV au stade')).toBeInTheDocument();
  });

  it('affiche "Sans date" quand l\'activité n\'a pas de date assignée', () => {
    renderPopup(makeActivite({ date: undefined }));

    expect(screen.getByText('Sans date')).toBeInTheDocument();
  });

  it("affiche 'Non renseignée' quand l'équipe n'est pas renseignée", () => {
    renderPopup(makeActivite({ equipe: undefined }));

    expect(screen.getByText('Non renseignée')).toBeInTheDocument();
  });

  it('appelle onClose quand on clique sur "Fermer"', () => {
    const onClose = vi.fn();
    renderPopup(makeActivite(), onClose);

    fireEvent.click(screen.getByRole('button', { name: 'Fermer' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("appelle onClose quand on clique sur l'overlay en dehors de la popup", () => {
    const onClose = vi.fn();
    renderPopup(makeActivite(), onClose);

    fireEvent.click(screen.getByRole('presentation'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("n'appelle pas onClose quand on clique à l'intérieur de la popup", () => {
    const onClose = vi.fn();
    renderPopup(makeActivite(), onClose);

    fireEvent.click(screen.getByRole('dialog'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('propose un lien vers le CRUD pour modifier l\'activité', () => {
    renderPopup(makeActivite());

    expect(screen.getByRole('link', { name: 'Modifier dans le CRUD' })).toHaveAttribute(
      'href',
      '/admin/activites',
    );
  });
});
