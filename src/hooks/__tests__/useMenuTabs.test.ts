import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMenuTabs } from '../useMenuTabs';
import { useVisibleTabs } from '../useVisibleTabs';
import type { TabConfig } from '../../components/layout/tabsConfig';

vi.mock('../useVisibleTabs');

const ALL_TABS: TabConfig[] = [
  { id: 'accueil', label: 'Accueil', shortLabel: 'Accueil', path: '/', primary: true },
  { id: 'dispos', label: 'Mes disponibilités', shortLabel: 'Dispos', path: '/dispos', primary: true },
  { id: 'effectif', label: 'Effectif', shortLabel: 'Effectif', path: '/effectif' },
  { id: 'admin', label: 'Admin', shortLabel: 'Admin', path: '/admin', requiresAdmin: true },
];

function mockVisibleTabs(tabs: TabConfig[]) {
  vi.mocked(useVisibleTabs).mockReturnValue(tabs);
}

describe('useMenuTabs', () => {
  it('partitions allTabs into primaryTabs (flag primary) and secondaryTabs (the rest)', () => {
    mockVisibleTabs(ALL_TABS);

    const { result } = renderHook(() => useMenuTabs());

    expect(result.current.allTabs).toEqual(ALL_TABS);
    expect(result.current.primaryTabs.map((tab) => tab.id)).toEqual(['accueil', 'dispos']);
    expect(result.current.secondaryTabs.map((tab) => tab.id)).toEqual(['effectif', 'admin']);
  });

  it('never puts the Admin tab in primaryTabs, even when it is visible', () => {
    mockVisibleTabs(ALL_TABS);

    const { result } = renderHook(() => useMenuTabs());

    expect(result.current.primaryTabs.find((tab) => tab.id === 'admin')).toBeUndefined();
    expect(result.current.secondaryTabs.find((tab) => tab.id === 'admin')).toBeDefined();
  });

  it('returns an empty secondaryTabs list when every visible tab is primary (current production tabsConfig)', () => {
    mockVisibleTabs([{ id: 'accueil', label: 'Accueil', shortLabel: 'Accueil', path: '/', primary: true }]);

    const { result } = renderHook(() => useMenuTabs());

    expect(result.current.primaryTabs.map((tab) => tab.id)).toEqual(['accueil']);
    expect(result.current.secondaryTabs).toEqual([]);
  });
});
