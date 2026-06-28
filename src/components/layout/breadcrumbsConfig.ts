import { tabsConfig } from './tabsConfig';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbRouteConfig {
  path: string;
  label: string;
  parentPath?: string;
}

const ACCUEIL_ITEM: BreadcrumbItem = { label: 'Accueil', path: '/' };

const breadcrumbsConfig: BreadcrumbRouteConfig[] = tabsConfig
  .filter((tab) => tab.path !== '/')
  .map((tab) => ({ path: tab.path, label: tab.label }));

export function getBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  if (pathname === '/') {
    return [];
  }

  const route = breadcrumbsConfig.find((entry) => entry.path === pathname);

  if (!route) {
    return [];
  }

  const items: BreadcrumbItem[] = [ACCUEIL_ITEM];

  if (route.parentPath) {
    const parentRoute = breadcrumbsConfig.find((entry) => entry.path === route.parentPath);

    if (parentRoute) {
      items.push({ label: parentRoute.label, path: parentRoute.path });
    }
  }

  items.push({ label: route.label });

  return items;
}
