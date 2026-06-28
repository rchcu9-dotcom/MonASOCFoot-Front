import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LayoutRoot } from '../LayoutRoot';
import { AuthProvider } from '../../../auth/AuthContext';

// Mock minimal d'un deuxième tab top-level pour exercer le fil d'Ariane sur une route autre
// que '/', qu'aucune route de tabsConfig réelle ne couvre encore (cf. decisions.json).
vi.mock('../tabsConfig', () => ({
  tabsConfig: [
    { id: 'accueil', label: 'Accueil', shortLabel: 'Accueil', path: '/', primary: true },
    { id: 'dispos', label: 'Mes disponibilités', shortLabel: 'Dispos', path: '/dispos', primary: true },
  ],
}));

function renderLayoutRoot(initialPath = '/') {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <AuthProvider>
          <LayoutRoot>
            <p>Contenu de la page</p>
          </LayoutRoot>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('LayoutRoot', () => {
  it('renders the top bar, the page content and the bottom navigation', () => {
    renderLayoutRoot();

    expect(screen.getByText('MonASOCFoot')).toBeInTheDocument();
    expect(screen.getByText('Contenu de la page')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Accueil' }).length).toBeGreaterThan(0);
  });

  it('the bottom navigation lists every primary tab', () => {
    const { container } = renderLayoutRoot();

    const bottomNav = container.querySelector('.app-tabs--bottom');
    expect(bottomNav).not.toBeNull();

    expect(within(bottomNav as HTMLElement).getByRole('link', { name: 'Accueil' })).toBeInTheDocument();
    expect(within(bottomNav as HTMLElement).getByRole('link', { name: 'Dispos' })).toBeInTheDocument();
  });

  it('does not show a breadcrumb on the Accueil page', () => {
    renderLayoutRoot('/');

    expect(screen.queryByRole('navigation', { name: "Fil d'Ariane" })).not.toBeInTheDocument();
  });

  it('shows a breadcrumb trail on a top-level page', () => {
    renderLayoutRoot('/dispos');

    const nav = screen.getByRole('navigation', { name: "Fil d'Ariane" });

    const accueilLink = within(nav).getByRole('link', { name: 'Accueil' });
    expect(accueilLink).toHaveAttribute('href', '/');

    expect(within(nav).getByText('Mes disponibilités')).toBeInTheDocument();
    expect(within(nav).queryByRole('link', { name: 'Mes disponibilités' })).not.toBeInTheDocument();
  });
});
