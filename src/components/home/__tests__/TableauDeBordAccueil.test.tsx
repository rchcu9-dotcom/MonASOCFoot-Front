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

  describe('couleur du taux de renseignement', () => {
    const VERT = 'rgb(74, 222, 128)';
    const JAUNE = 'rgb(250, 204, 21)';
    const ROUGE = 'rgb(248, 113, 113)';

    it('affiche le pourcentage en vert au-dessus de 80 (85%)', () => {
      render(
        <TableauDeBordAccueil
          tableauDeBord={{ totalAVenir: 10, renseigneesAVenir: 8, pourcentageRenseignement: 85 }}
        />,
      );

      expect(screen.getByText('85%').style.color).toBe(VERT);
    });

    it('affiche le pourcentage en jaune à exactement 80 (borne non inclusive du vert)', () => {
      render(
        <TableauDeBordAccueil
          tableauDeBord={{ totalAVenir: 10, renseigneesAVenir: 8, pourcentageRenseignement: 80 }}
        />,
      );

      expect(screen.getByText('80%').style.color).toBe(JAUNE);
    });

    it('affiche le pourcentage en rouge à exactement 60 (borne non inclusive du jaune)', () => {
      render(
        <TableauDeBordAccueil
          tableauDeBord={{ totalAVenir: 10, renseigneesAVenir: 6, pourcentageRenseignement: 60 }}
        />,
      );

      expect(screen.getByText('60%').style.color).toBe(ROUGE);
    });

    it('affiche le pourcentage en rouge à 0 (aucune activité à venir)', () => {
      render(
        <TableauDeBordAccueil
          tableauDeBord={{ totalAVenir: 0, renseigneesAVenir: 0, pourcentageRenseignement: 0 }}
        />,
      );

      expect(screen.getByText('0%').style.color).toBe(ROUGE);
    });

    it("n'applique pas de couleur inline aux deux autres indicateurs", () => {
      render(
        <TableauDeBordAccueil
          tableauDeBord={{ totalAVenir: 5, renseigneesAVenir: 2, pourcentageRenseignement: 40 }}
        />,
      );

      expect(screen.getByText('5').style.color).toBe('');
      expect(screen.getByText('2').style.color).toBe('');
    });
  });
});
