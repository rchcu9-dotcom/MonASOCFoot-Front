import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const testDir = dirname(fileURLToPath(import.meta.url));
const frontRoot = resolve(testDir, '../../..');

/**
 * Garde-fous pour `organisation-git-deploiement-monasocfoot`. Lionel a explicitement validé
 * le passage à l'étape suivante (push + CI/CD + premier déploiement staging, 2026-07-01) :
 * remote GitHub et workflows CI/CD sont désormais attendus. Seule l'absence de secrets commités
 * reste une limite absolue.
 */
function git(args: string[]): string {
  return execFileSync('git', args, { cwd: frontRoot, encoding: 'utf-8' }).trim();
}

// Ces tests inspectent l'état du dépôt Git local (branches, remote, arbre de travail) — sans
// objet dans un runner CI, dont le checkout est superficiel et limité à la branche déclenchante
// (`main` n'y est ni fetché ni résolvable).
describe.skipIf(!!process.env.CI)('front/ — organisation Git locale', () => {
  it('est un dépôt Git valide', () => {
    expect(git(['rev-parse', '--is-inside-work-tree'])).toBe('true');
  });

  it('a au moins un commit sur la branche main', () => {
    expect(git(['rev-parse', '--verify', 'main'])).toMatch(/^[0-9a-f]{40}$/);
  });

  it('a une branche staging locale', () => {
    const branches = git(['branch', '--list']);
    expect(branches).toMatch(/\bmain\b/);
    expect(branches).toMatch(/\bstaging\b/);
  });

  it("a un remote origin configuré vers le dépôt GitHub MonASOCFoot-Front", () => {
    expect(git(['remote'])).toContain('origin');
    expect(git(['remote', 'get-url', 'origin'])).toContain('MonASOCFoot-Front');
  });

  it('a un répertoire .github/workflows (CI/CD staging)', () => {
    expect(existsSync(resolve(frontRoot, '.github', 'workflows'))).toBe(true);
  });

  it("n'a aucun fichier .env réel (uniquement le gabarit .env.example) ni clé/secret suivi par Git", () => {
    const trackedFiles = git(['ls-files']).split('\n');
    const fichiersSensibles = trackedFiles.filter((f) => {
      if (f === '.env.example') return false; // gabarit sans valeur réelle, volontairement committé
      return /(^|\/)\.env(\..*)?$|service-account|-key\.json$/i.test(f);
    });
    expect(fichiersSensibles).toEqual([]);
  });

  it('ignore node_modules, dist, coverage et les artefacts de build TypeScript', () => {
    const gitignore = readFileSync(resolve(frontRoot, '.gitignore'), 'utf-8');
    for (const entry of ['node_modules', 'dist', 'coverage', '*.tsbuildinfo']) {
      expect(gitignore).toContain(entry);
    }
  });
});
