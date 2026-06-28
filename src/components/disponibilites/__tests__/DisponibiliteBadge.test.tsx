import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DisponibiliteBadge } from '../DisponibiliteBadge';
import type { DisponibiliteEffectiveDto } from '../../../api/disponibilites';

describe('DisponibiliteBadge', () => {
  it('affiche "Présent" pour le statut "present" avec la source "activite"', () => {
    const disponibilite: DisponibiliteEffectiveDto = { statut: 'present', source: 'activite' };

    render(<DisponibiliteBadge disponibilite={disponibilite} />);

    expect(screen.getByText(/Présent/)).toBeInTheDocument();
  });

  it('affiche "Disponible" pour le statut "disponible" avec la source "journee"', () => {
    const disponibilite: DisponibiliteEffectiveDto = { statut: 'disponible', source: 'journee' };

    render(<DisponibiliteBadge disponibilite={disponibilite} />);

    expect(screen.getByText('Disponible')).toBeInTheDocument();
  });

  it('affiche "Absent" pour le statut "absent"', () => {
    const disponibilite: DisponibiliteEffectiveDto = { statut: 'absent', source: 'journee' };

    render(<DisponibiliteBadge disponibilite={disponibilite} />);

    expect(screen.getByText('Absent')).toBeInTheDocument();
  });

  it('marque visuellement une surcharge d\'activité (source "activite") différemment d\'une dispo de journée', () => {
    const disponibilite: DisponibiliteEffectiveDto = { statut: 'present', source: 'activite' };

    render(<DisponibiliteBadge disponibilite={disponibilite} />);

    expect(screen.getByText(/Présent\s*\*/)).toBeInTheDocument();
  });

  it('affiche une cellule neutre "—" quand source === "aucune", sans afficher le libellé du statut factice', () => {
    const disponibilite: DisponibiliteEffectiveDto = { statut: 'autre', source: 'aucune' };

    render(<DisponibiliteBadge disponibilite={disponibilite} />);

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByText('Autre')).not.toBeInTheDocument();
  });

  it('ignore complètement la valeur de "statut" quand source === "aucune", même si "statut" porte une valeur signifiante par erreur', () => {
    // Le contrat back documenté dans le track.md garantit `statut: 'autre'` pour `source: 'aucune'`,
    // mais le composant doit discriminer uniquement sur `source` : on vérifie qu'une valeur de
    // statut différente (ex. 'present') n'est jamais affichée si la source reste 'aucune'.
    const disponibilite = { statut: 'present', source: 'aucune' } as DisponibiliteEffectiveDto;

    render(<DisponibiliteBadge disponibilite={disponibilite} />);

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByText(/Présent/)).not.toBeInTheDocument();
  });

  it('affiche le commentaire en tooltip (attribut title) quand il est renseigné', () => {
    const disponibilite: DisponibiliteEffectiveDto = {
      statut: 'present',
      source: 'journee',
      commentaire: 'Arrivée tardive',
    };

    render(<DisponibiliteBadge disponibilite={disponibilite} />);

    expect(screen.getByText('Présent')).toHaveAttribute('title', 'Arrivée tardive');
  });
});
