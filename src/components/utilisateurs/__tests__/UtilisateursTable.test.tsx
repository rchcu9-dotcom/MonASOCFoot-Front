import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { UtilisateursTable } from '../UtilisateursTable';
import type { UtilisateurDto } from '../../../api/users';

function makeUtilisateur(overrides: Partial<UtilisateurDto> = {}): UtilisateurDto {
  return {
    id: 'u1',
    providerId: 'provider-1',
    provider: 'google',
    displayName: 'Joueur Un',
    email: 'joueur.un@example.com',
    role: 'joueur',
    dateApparition: '2026-01-01T00:00:00.000Z',
    derniereConnexion: '2026-06-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('UtilisateursTable', () => {
  it("affiche un message quand la liste est vide, sans tableau", () => {
    render(<UtilisateursTable utilisateurs={[]} onChangeRole={vi.fn()} />);

    expect(screen.getByText("Aucun utilisateur ne s'est encore connecté.")).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('affiche une ligne par utilisateur avec ses champs', () => {
    const utilisateur = makeUtilisateur();
    render(<UtilisateursTable utilisateurs={[utilisateur]} onChangeRole={vi.fn()} />);

    const row = screen.getByRole('row', { name: /Joueur Un/ });
    expect(within(row).getByText('joueur.un@example.com')).toBeInTheDocument();
    expect(within(row).getByText('2026-06-01T00:00:00.000Z')).toBeInTheDocument();
  });

  it("affiche « — » quand l'email est absent", () => {
    const utilisateur = makeUtilisateur({ email: undefined });
    render(<UtilisateursTable utilisateurs={[utilisateur]} onChangeRole={vi.fn()} />);

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it("affiche « jamais » quand la dernière connexion est absente", () => {
    const utilisateur = makeUtilisateur({ derniereConnexion: undefined });
    render(<UtilisateursTable utilisateurs={[utilisateur]} onChangeRole={vi.fn()} />);

    expect(screen.getByText('jamais')).toBeInTheDocument();
  });

  it('trie les utilisateurs par displayName, indépendamment de l\'ordre reçu', () => {
    const zoe = makeUtilisateur({ id: 'u-zoe', displayName: 'Zoé', email: 'zoe@example.com' });
    const alice = makeUtilisateur({ id: 'u-alice', displayName: 'Alice', email: 'alice@example.com' });
    render(<UtilisateursTable utilisateurs={[zoe, alice]} onChangeRole={vi.fn()} />);

    const lignes = screen.getAllByRole('row').slice(1);
    expect(within(lignes[0]).getByText('alice@example.com')).toBeInTheDocument();
    expect(within(lignes[1]).getByText('zoe@example.com')).toBeInTheDocument();
  });

  it("reflète le rôle actuel de l'utilisateur dans le sélecteur", () => {
    const admin = makeUtilisateur({ displayName: 'Admin Un', role: 'admin' });
    render(<UtilisateursTable utilisateurs={[admin]} onChangeRole={vi.fn()} />);

    expect(screen.getByRole('combobox', { name: 'Rôle de Admin Un' })).toHaveValue('admin');
  });

  it('appelle onChangeRole avec id et nouveau rôle quand on change la sélection', () => {
    const onChangeRole = vi.fn();
    const utilisateur = makeUtilisateur({ id: 'u-cible', displayName: 'Joueur Un', role: 'joueur' });
    render(<UtilisateursTable utilisateurs={[utilisateur]} onChangeRole={onChangeRole} />);

    const select = screen.getByRole('combobox', { name: 'Rôle de Joueur Un' });
    (select as HTMLSelectElement).value = 'admin';
    select.dispatchEvent(new Event('change', { bubbles: true }));

    expect(onChangeRole).toHaveBeenCalledWith('u-cible', 'admin');
  });

  it("désactive le sélecteur de l'utilisateur connecté (défense en profondeur, ne peut pas se rétrograder lui-même)", () => {
    const admin = makeUtilisateur({ id: 'admin-connecte', displayName: 'Admin Connecté', role: 'admin' });
    render(
      <UtilisateursTable
        utilisateurs={[admin]}
        idUtilisateurConnecte="admin-connecte"
        onChangeRole={vi.fn()}
      />,
    );

    expect(screen.getByRole('combobox', { name: 'Rôle de Admin Connecté' })).toBeDisabled();
  });

  it("désactive le sélecteur de la ligne dont la mutation est en cours", () => {
    const utilisateur = makeUtilisateur({ id: 'u-en-cours', displayName: 'Joueur En Cours' });
    render(
      <UtilisateursTable utilisateurs={[utilisateur]} idEnCours="u-en-cours" onChangeRole={vi.fn()} />,
    );

    expect(screen.getByRole('combobox', { name: 'Rôle de Joueur En Cours' })).toBeDisabled();
  });

  it("laisse actif le sélecteur d'un utilisateur qui n'est ni l'utilisateur connecté ni en cours de mutation", () => {
    const utilisateur = makeUtilisateur({ id: 'u-autre', displayName: 'Autre Joueur' });
    render(
      <UtilisateursTable
        utilisateurs={[utilisateur]}
        idUtilisateurConnecte="admin-connecte"
        idEnCours="un-autre-id"
        onChangeRole={vi.fn()}
      />,
    );

    expect(screen.getByRole('combobox', { name: 'Rôle de Autre Joueur' })).not.toBeDisabled();
  });
});
