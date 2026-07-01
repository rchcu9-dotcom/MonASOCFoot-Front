import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// jsdom n'applique pas le rendu CSS réel : ce test lit le fichier source pour verrouiller les
// critères d'acceptation visuels de la spec "look n feel hockey-tournoi" qu'aucun test de
// composant ne peut vérifier (bandeau sticky + flou, item actif en pastille, largeur de
// conteneur partagée bandeau/contenu).
const layoutCss = readFileSync(join(__dirname, '..', 'layout.css'), 'utf-8');

function ruleBody(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = layoutCss.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  if (!match) throw new Error(`Rule "${selector}" not found in layout.css`);
  return match[1];
}

describe('layout.css — régression visuelle (look n feel hockey-tournoi)', () => {
  it('keeps the top banner sticky with a backdrop blur effect', () => {
    const rule = ruleBody('.app-topbar');

    expect(rule).toMatch(/position:\s*sticky/);
    expect(rule).toMatch(/backdrop-filter:\s*blur\(/);
  });

  it('renders the active nav link as a rounded pill, not a square block', () => {
    const rule = ruleBody('.app-tabs__link');

    const radiusMatch = rule.match(/border-radius:\s*([\d.]+)(px|%)/);
    expect(radiusMatch).not.toBeNull();
    if (radiusMatch?.[2] === 'px') {
      expect(Number(radiusMatch[1])).toBeGreaterThanOrEqual(999);
    }
  });

  it('shares the same max-width token between the banner inner container and the main content', () => {
    const topbarInner = ruleBody('.app-topbar__inner');
    const main = ruleBody('.app-layout__main');

    expect(topbarInner).toMatch(/max-width:\s*var\(--container-max-width\)/);
    expect(main).toMatch(/max-width:\s*var\(--container-max-width\)/);
  });
});
