import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ResumeAccueil } from '../ResumeAccueil';
import { useMesDisponibilitesJournee } from '../../../hooks/useMesDisponibilitesJournee';
import { useDeclarerDisponibiliteActivite } from '../../../hooks/useDeclarerDisponibiliteActivite';
import { useDeclarerDisponibiliteJournee } from '../../../hooks/useDeclarerDisponibiliteJournee';
import { useSupprimerDisponibiliteActivite } from '../../../hooks/useSupprimerDisponibiliteActivite';
import type { ResumeAccueilDto } from '../../../api/disponibilites';

vi.mock('../../../hooks/useMesDisponibilitesJournee');
vi.mock('../../../hooks/useDeclarerDisponibiliteActivite');
vi.mock('../../../hooks/useDeclarerDisponibiliteJournee');
vi.mock('../../../hooks/useSupprimerDisponibiliteActivite');

function mockDispoJournee(overrides: Partial<ReturnType<typeof useMesDisponibilitesJournee>> = {}) {
  vi.mocked(useMesDisponibilitesJournee).mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
    ...overrides,
  } as ReturnType<typeof useMesDisponibilitesJournee>);
}

function mockMutationHooks() {
  const declarerActiviteMutate = vi.fn();
  const declarerJourneeMutate = vi.fn();
  const supprimerMutate = vi.fn();

  vi.mocked(useDeclarerDisponibiliteActivite).mockReturnValue({
    mutate: declarerActiviteMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useDeclarerDisponibiliteActivite>);

  vi.mocked(useDeclarerDisponibiliteJournee).mockReturnValue({
    mutate: declarerJourneeMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useDeclarerDisponibiliteJournee>);

  vi.mocked(useSupprimerDisponibiliteActivite).mockReturnValue({
    mutate: supprimerMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useSupprimerDisponibiliteActivite>);

  return { declarerActiviteMutate, declarerJourneeMutate, supprimerMutate };
}

function renderResume(resume: ResumeAccueilDto) {
  return render(<ResumeAccueil resume={resume} />, { wrapper: MemoryRouter });
}

const resumeVide: ResumeAccueilDto = {
  prochainesDates: [],
  tableauDeBord: { totalAVenir: 0, renseigneesAVenir: 0, pourcentageRenseignement: 0 },
};

describe('ResumeAccueil', () => {
  beforeEach(() => {
    vi.mocked(useMesDisponibilitesJournee).mockReset();
    vi.mocked(useDeclarerDisponibiliteActivite).mockReset();
    vi.mocked(useDeclarerDisponibiliteJournee).mockReset();
    vi.mocked(useSupprimerDisponibiliteActivite).mockReset();
    mockMutationHooks();
    mockDispoJournee();
  });

  it('affiche les 2 sections : tableau de bord, mes activités à venir (sans bloc "Ma dernière activité")', () => {
    renderResume(resumeVide);

    expect(screen.getByText('Mon tableau de bord')).toBeInTheDocument();
    expect(screen.getByText('Mes activités à venir')).toBeInTheDocument();
    expect(screen.getByText('Aucune activité à venir.')).toBeInTheDocument();
    expect(screen.queryByText('Ma dernière activité')).not.toBeInTheDocument();
  });

  it('affiche un lien vers /mes-disponibilites', () => {
    renderResume(resumeVide);

    const lien = screen.getByText('Voir toutes mes disponibilités');
    expect(lien).toBeInTheDocument();
    expect(lien.closest('a')).toHaveAttribute('href', '/mes-disponibilites');
  });

  it('ouvre la modale au clic sur une activité des prochaines dates', () => {
    const resume: ResumeAccueilDto = {
      ...resumeVide,
      prochainesDates: [
        {
          date: '2026-07-01',
          activites: [
            {
              activite: {
                id: 'a2',
                date: '2026-07-01',
                heureConvocation: '14:00',
                heureDebut: '15:00',
                label: 'Entraînement',
                type: 'autre',
              },
              disponibilite: { statut: 'autre', source: 'aucune' },
            },
          ],
        },
      ],
    };

    renderResume(resume);
    fireEvent.click(screen.getByText('Entraînement'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('transmet la disponibilité de journée correspondant à la date de l\'activité sélectionnée à la modale', () => {
    mockDispoJournee({
      data: [{ id: 'dj-1', utilisateurId: 'u1', date: '2026-07-01', statut: 'disponible' }],
    } as ReturnType<typeof useMesDisponibilitesJournee>);
    const resume: ResumeAccueilDto = {
      ...resumeVide,
      prochainesDates: [
        {
          date: '2026-07-01',
          activites: [
            {
              activite: {
                id: 'a2',
                date: '2026-07-01',
                heureConvocation: '14:00',
                heureDebut: '15:00',
                label: 'Entraînement',
                type: 'autre',
              },
              disponibilite: { statut: 'autre', source: 'aucune' },
            },
          ],
        },
      ],
    };

    renderResume(resume);
    fireEvent.click(screen.getByText('Entraînement'));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Entraînement');
  });

  it('ferme la modale après un clic sur "Annuler"', () => {
    const resume: ResumeAccueilDto = {
      ...resumeVide,
      prochainesDates: [
        {
          date: '2026-07-01',
          activites: [
            {
              activite: {
                id: 'a1',
                date: '2026-07-01',
                heureConvocation: '14:00',
                heureDebut: '15:00',
                label: 'Match retour',
                type: 'match',
              },
              disponibilite: { statut: 'present', source: 'activite' },
            },
          ],
        },
      ],
    };

    renderResume(resume);
    fireEvent.click(screen.getByText('Match retour'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Annuler'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
