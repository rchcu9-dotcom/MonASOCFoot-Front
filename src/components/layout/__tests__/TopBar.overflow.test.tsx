import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TopBar } from '../TopBar';
import { AuthProvider } from '../../../auth/AuthContext';

// Isolé dans son propre fichier car tabsConfig est mocké avec un surplus d'items, à la
// différence de TopBar.test.tsx qui reflète l'état réel actuel (une seule route Accueil).
// Vérifie que le mécanisme "Plus" (généré par l'architecture mais inutilisé pour l'instant,
// cf. decisions.json) fonctionnera dès qu'une future spec ajoutera un deuxième tab primaire.
vi.mock('../tabsConfig', () => ({
  tabsConfig: [
    { id: 'accueil', label: 'Accueil', shortLabel: 'Accueil', path: '/', primary: true },
    { id: 'dispos', label: 'Mes disponibilités', shortLabel: 'Dispos', path: '/dispos' },
    { id: 'effectif', label: 'Effectif', shortLabel: 'Effectif', path: '/effectif' },
  ],
}));

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

describe('TopBar — surplus d\'items (tabs visibles > tabs primaires)', () => {
  it('shows a dedicated "Plus" button when there are secondary tabs', () => {
    renderTopBar();

    expect(screen.getByRole('button', { name: "Plus d'options de navigation" })).toBeInTheDocument();
  });

  it('toggles the "Plus" menu and only lists the secondary tabs', () => {
    renderTopBar();

    const more = screen.getByRole('button', { name: "Plus d'options de navigation" });
    fireEvent.click(more);

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Accueil' })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Mes disponibilités' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Effectif' })).toBeInTheDocument();

    fireEvent.click(more);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes the "Plus" menu after selecting a secondary item', () => {
    renderTopBar();

    fireEvent.click(screen.getByRole('button', { name: "Plus d'options de navigation" }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Effectif' }));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('the hamburger menu lists every visible tab, including the primary one', () => {
    renderTopBar();

    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir le menu' }));

    expect(screen.getByRole('menuitem', { name: 'Accueil' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Mes disponibilités' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Effectif' })).toBeInTheDocument();
  });

  it('opening the "Plus" menu closes the hamburger menu and vice versa', () => {
    renderTopBar();

    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir le menu' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: "Plus d'options de navigation" }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Accueil' })).not.toBeInTheDocument();
  });
});
