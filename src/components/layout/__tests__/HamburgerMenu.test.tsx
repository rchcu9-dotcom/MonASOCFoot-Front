import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HamburgerMenu } from '../HamburgerMenu';
import type { TabConfig } from '../tabsConfig';

const TABS: TabConfig[] = [
  { id: 'accueil', label: 'Accueil', shortLabel: 'Accueil', path: '/', primary: true },
  { id: 'dispos', label: 'Mes disponibilités', shortLabel: 'Dispos', path: '/dispos' },
  { id: 'admin', label: 'Admin', shortLabel: 'Admin', path: '/admin', requiresAdmin: true },
];

describe('HamburgerMenu', () => {
  it('renders a menu item for each tab provided', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <HamburgerMenu tabs={TABS} onNavigate={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('menuitem', { name: 'Accueil' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('menuitem', { name: 'Mes disponibilités' })).toHaveAttribute(
      'href',
      '/dispos',
    );
    expect(screen.getByRole('menuitem', { name: 'Admin' })).toHaveAttribute('href', '/admin');
  });

  it('marks the active route, without matching every route for Accueil', () => {
    render(
      <MemoryRouter initialEntries={['/dispos']}>
        <HamburgerMenu tabs={TABS} onNavigate={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('menuitem', { name: 'Mes disponibilités' })).toHaveClass('is-active');
    expect(screen.getByRole('menuitem', { name: 'Accueil' })).not.toHaveClass('is-active');
  });

  it('calls onNavigate when an item is clicked', () => {
    const onNavigate = vi.fn();
    render(
      <MemoryRouter initialEntries={['/']}>
        <HamburgerMenu tabs={TABS} onNavigate={onNavigate} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('menuitem', { name: 'Mes disponibilités' }));

    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it('forwards an extra className to the menu container', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <HamburgerMenu tabs={TABS} onNavigate={vi.fn()} className="app-hamburger-menu--anchored" />
      </MemoryRouter>,
    );

    expect(screen.getByRole('menu')).toHaveClass('app-hamburger-menu--anchored');
  });
});
