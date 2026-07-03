import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import App from '../App';
import { AuthProvider } from '../auth/AuthContext';
import { queryClient } from '../queryClient';

describe('App', () => {
  it("affiche HomePage sur la route '/'", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/']}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByRole('heading', { name: 'MonASOCFoot' })).toBeInTheDocument();
  });

  it("redirige vers '/' sur la route '/admin/activites' quand aucun utilisateur n'est connecté", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/admin/activites']}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByRole('heading', { name: 'MonASOCFoot' })).toBeInTheDocument();
  });

  it("redirige vers '/' sur la route '/admin/utilisateurs' quand aucun utilisateur n'est connecté", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/admin/utilisateurs']}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByRole('heading', { name: 'MonASOCFoot' })).toBeInTheDocument();
  });

  it("redirige vers '/login' sur la route '/profil' quand aucun utilisateur n'est connecté", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/profil']}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByRole('heading', { name: 'Connexion' })).toBeInTheDocument();
  });
});
