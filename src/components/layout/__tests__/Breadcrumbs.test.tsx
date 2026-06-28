import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Breadcrumbs } from '../Breadcrumbs';
import type { BreadcrumbItem } from '../breadcrumbsConfig';

function renderBreadcrumbs(items: BreadcrumbItem[]) {
  return render(
    <MemoryRouter>
      <Breadcrumbs items={items} />
    </MemoryRouter>,
  );
}

describe('Breadcrumbs', () => {
  it('renders all items, with clickable links for every item except the last', () => {
    renderBreadcrumbs([
      { label: 'Accueil', path: '/' },
      { label: 'Mes disponibilités' },
    ]);

    const nav = screen.getByRole('navigation', { name: "Fil d'Ariane" });

    const accueilLink = within(nav).getByRole('link', { name: 'Accueil' });
    expect(accueilLink).toHaveAttribute('href', '/');

    expect(within(nav).getByText('Mes disponibilités')).toBeInTheDocument();
    expect(within(nav).queryByRole('link', { name: 'Mes disponibilités' })).not.toBeInTheDocument();

    expect(within(nav).getAllByText('›')).toHaveLength(1);
  });

  it('renders nothing when the items list is empty', () => {
    const { container } = renderBreadcrumbs([]);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('navigation', { name: "Fil d'Ariane" })).not.toBeInTheDocument();
  });
});
