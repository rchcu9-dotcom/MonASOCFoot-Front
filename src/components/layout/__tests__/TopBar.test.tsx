import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TopBar } from '../TopBar';
import { AuthProvider } from '../../../auth/AuthContext';

// Utilise tabsConfig réel (Accueil + Disponibilités de l'effectif) : reflète l'état actuel de
// production, où le bouton "Plus" affiche le tab secondaire "Disponibilités de l'effectif".
// Le cas avec un mock à surplus arbitraire est couvert par TopBar.overflow.test.tsx, dans un
// fichier séparé pour isoler son propre mock de tabsConfig.
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

  it('shows the "Plus" button with the secondary tab (current tabsConfig)', () => {
    renderTopBar();

    const more = screen.getByRole('button', { name: "Plus d'options de navigation" });
    fireEvent.click(more);

    expect(screen.getByRole('menuitem', { name: /Disponibilités de l'effectif/ })).toBeInTheDocument();
  });

  it('shows a link to login when no user is connected', () => {
    renderTopBar();

    expect(screen.getByRole('link', { name: 'Connexion' })).toBeInTheDocument();
  });
});
