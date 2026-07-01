import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TopBar } from '../TopBar';
import { AuthProvider } from '../../../auth/AuthContext';

// Utilise tabsConfig réel (3 tabs primaires : Accueil, Mes disponibilités, Disponibilités de
// l'effectif ; 3 tabs admin-only en secondaire) : reflète l'état actuel de production, où un
// utilisateur anonyme n'a aucun tab secondaire visible (les tabs admin sont filtrés en amont par
// useVisibleTabs) et ne voit donc pas de bouton "Plus".
// Le cas avec un mock à surplus arbitraire est couvert par TopBar.overflow.test.tsx, dans un
// fichier séparé pour isoler son propre mock de tabsConfig. Le cas admin (bouton "Plus" avec les
// 3 tabs admin réels) est couvert par TopBar.admin.test.tsx.
function renderTopBar() {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider>
          <TopBar />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('TopBar', () => {
  it('renders the app brand', () => {
    renderTopBar();

    expect(screen.getByText('MonASOCFoot')).toBeInTheDocument();
  });

  it('renders the club logo next to the brand name (charte graphique)', () => {
    const { container } = renderTopBar();

    const logo = container.querySelector('img.app-topbar__logo');
    expect(logo).not.toBeNull();
    expect(logo).toHaveAttribute('src', '/logo-asocf.svg');
    expect(logo).toHaveAttribute('alt', '');
  });

  it('toggles the hamburger menu on click', () => {
    renderTopBar();

    const toggle = screen.getByRole('button', { name: 'Ouvrir le menu' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    fireEvent.click(toggle);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes the menu after selecting an item', () => {
    renderTopBar();

    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir le menu' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Accueil' }));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('hides the "Plus" button for an anonymous user (the 3 primary tabs are the only visible ones)', () => {
    renderTopBar();

    expect(screen.queryByRole('button', { name: "Plus d'options de navigation" })).not.toBeInTheDocument();
  });

  it('shows exactly the 3 primary tabs in the top navigation (current tabsConfig)', () => {
    renderTopBar();

    expect(screen.getByRole('link', { name: 'Accueil' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mes disponibilités' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: "Disponibilités de l'effectif" })).toBeInTheDocument();
  });

  it('shows a link to login when no user is connected', () => {
    renderTopBar();

    expect(screen.getByRole('link', { name: 'Connexion' })).toBeInTheDocument();
  });
});
