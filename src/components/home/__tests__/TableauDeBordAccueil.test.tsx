import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TableauDeBordAccueil } from '../TableauDeBordAccueil';

describe('TableauDeBordAccueil', () => {
  it('affiche le titre de la section', () => {
    render(
      <TableauDeBordAccueil
        tableauDeBord={{ totalAVenir: 0, renseigneesAVenir: 0, pourcentageRenseignement: 0 }}
      />,
    );

    expect(screen.getByText('Mon tableau de bord')).toBeInTheDocument();
  });

  it('affiche les 3 indicateurs (total, renseignées, pourcentage)', () => {
    render(
      <TableauDeBordAccueil
        tableauDeBord={{ totalAVenir: 5, renseigneesAVenir: 2, pourcentageRenseignement: 40 }}
      />,
    );

    expect(screen.getByText('Activités à venir')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Renseignées')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Taux de renseignement')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('affiche 0% sans erreur quand aucune activité à venir n\'existe', () => {
    render(
      <TableauDeBordAccueil
        tableauDeBord={{ totalAVenir: 0, renseigneesAVenir: 0, pourcentageRenseignement: 0 }}
      />,
    );

    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});
