import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DisponibiliteDetailModal } from '../DisponibiliteDetailModal';
import { useDeclarerDisponibiliteActivite } from '../../../hooks/useDeclarerDisponibiliteActivite';
import { useDeclarerDisponibiliteJournee } from '../../../hooks/useDeclarerDisponibiliteJournee';
import { useSupprimerDisponibiliteActivite } from '../../../hooks/useSupprimerDisponibiliteActivite';
import type {
  ActiviteColonneDto,
  DisponibiliteEffectiveDto,
  DisponibiliteJourneeDto,
} from '../../../api/disponibilites';

vi.mock('../../../hooks/useDeclarerDisponibiliteActivite');
vi.mock('../../../hooks/useDeclarerDisponibiliteJournee');
vi.mock('../../../hooks/useSupprimerDisponibiliteActivite');

const activite: ActiviteColonneDto = {
  id: 'activite-1',
  date: '2026-07-10',
  heureConvocation: '13:30',
  heureDebut: '15:00',
  label: 'Match amical',
  type: 'match',
  commentaire: 'RDV au stade',
};

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

describe('DisponibiliteDetailModal', () => {
  beforeEach(() => {
    vi.mocked(useDeclarerDisponibiliteActivite).mockReset();
    vi.mocked(useDeclarerDisponibiliteJournee).mockReset();
    vi.mocked(useSupprimerDisponibiliteActivite).mockReset();
  });

  describe('source "aucune" — première saisie', () => {
    it('affiche le statut par défaut "present" et la cible par défaut "journee" (toggle décoché)', () => {
      mockMutationHooks();
      const disponibiliteEffective: DisponibiliteEffectiveDto = { statut: 'autre', source: 'aucune' };

      render(
        <DisponibiliteDetailModal
          activite={activite}
          disponibiliteEffective={disponibiliteEffective}
          onClose={vi.fn()}
        />,
      );

      expect(screen.getByText('Présent').closest('button')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('checkbox')).not.toBeChecked();
      expect(screen.queryByText('Retirer la surcharge')).not.toBeInTheDocument();
    });

    it('soumet via useDeclarerDisponibiliteJournee sur activite.date par défaut', () => {
      const { declarerJourneeMutate, declarerActiviteMutate } = mockMutationHooks();
      const disponibiliteEffective: DisponibiliteEffectiveDto = { statut: 'autre', source: 'aucune' };

      render(
        <DisponibiliteDetailModal
          activite={activite}
          disponibiliteEffective={disponibiliteEffective}
          onClose={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByText('Absent').closest('button')!);
      fireEvent.click(screen.getByText('Enregistrer'));

      expect(declarerJourneeMutate).toHaveBeenCalledWith(
        { date: '2026-07-10', dto: { statut: 'absent', commentaire: undefined } },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
      expect(declarerActiviteMutate).not.toHaveBeenCalled();
    });

    it('bascule vers la cible "activite" via le toggle puis soumet sur activite.id', () => {
      const { declarerActiviteMutate, declarerJourneeMutate } = mockMutationHooks();
      const disponibiliteEffective: DisponibiliteEffectiveDto = { statut: 'autre', source: 'aucune' };

      render(
        <DisponibiliteDetailModal
          activite={activite}
          disponibiliteEffective={disponibiliteEffective}
          onClose={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByRole('checkbox'));
      fireEvent.click(screen.getByText('Disponible').closest('button')!);
      fireEvent.click(screen.getByText('Enregistrer'));

      expect(declarerActiviteMutate).toHaveBeenCalledWith(
        { activiteId: 'activite-1', dto: { statut: 'disponible', commentaire: undefined } },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
      expect(declarerJourneeMutate).not.toHaveBeenCalled();
    });

    it('coche puis décoche la case sans cliquer sur Enregistrer : aucune mutation n\'est appelée à la fermeture', () => {
      const { declarerActiviteMutate, declarerJourneeMutate, supprimerMutate } = mockMutationHooks();
      const disponibiliteEffective: DisponibiliteEffectiveDto = { statut: 'autre', source: 'aucune' };
      const onClose = vi.fn();

      render(
        <DisponibiliteDetailModal
          activite={activite}
          disponibiliteEffective={disponibiliteEffective}
          onClose={onClose}
        />,
      );

      const toggle = screen.getByRole('checkbox');
      fireEvent.click(toggle);
      fireEvent.click(toggle);
      fireEvent.click(screen.getByText('Annuler'));

      expect(declarerActiviteMutate).not.toHaveBeenCalled();
      expect(declarerJourneeMutate).not.toHaveBeenCalled();
      expect(supprimerMutate).not.toHaveBeenCalled();
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('source "journee" — édition d\'une dispo de journée existante', () => {
    const disponibiliteEffective: DisponibiliteEffectiveDto = {
      statut: 'disponible',
      source: 'journee',
      commentaire: 'Dispo toute la journée',
    };

    it('pré-remplit le statut et le commentaire actuels, cible par défaut "journee", toggle visible', () => {
      mockMutationHooks();

      render(
        <DisponibiliteDetailModal
          activite={activite}
          disponibiliteEffective={disponibiliteEffective}
          onClose={vi.fn()}
        />,
      );

      expect(screen.getByText('Disponible').closest('button')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('textbox')).toHaveValue('Dispo toute la journée');
      expect(screen.getByRole('checkbox')).not.toBeChecked();
      expect(screen.queryByText('Retirer la surcharge')).not.toBeInTheDocument();
    });

    it('soumet la modification via useDeclarerDisponibiliteJournee', () => {
      const { declarerJourneeMutate } = mockMutationHooks();

      render(
        <DisponibiliteDetailModal
          activite={activite}
          disponibiliteEffective={disponibiliteEffective}
          onClose={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByText('Présent').closest('button')!);
      fireEvent.click(screen.getByText('Enregistrer'));

      expect(declarerJourneeMutate).toHaveBeenCalledWith(
        {
          date: '2026-07-10',
          dto: { statut: 'present', commentaire: 'Dispo toute la journée' },
        },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });

    it('permet de basculer vers "activite" via le toggle pour affiner cette seule activité', () => {
      const { declarerActiviteMutate } = mockMutationHooks();

      render(
        <DisponibiliteDetailModal
          activite={activite}
          disponibiliteEffective={disponibiliteEffective}
          onClose={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByRole('checkbox'));
      fireEvent.click(screen.getByText('Absent').closest('button')!);
      fireEvent.click(screen.getByText('Enregistrer'));

      expect(declarerActiviteMutate).toHaveBeenCalledWith(
        { activiteId: 'activite-1', dto: { statut: 'absent', commentaire: 'Dispo toute la journée' } },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });

    it('revient à la valeur de journée fournie quand le toggle repasse de "activite" à "journee"', () => {
      mockMutationHooks();
      const dispoJourneeActuelle: DisponibiliteJourneeDto = {
        id: 'dj-1',
        utilisateurId: 'user-1',
        date: '2026-07-10',
        statut: 'disponible',
        commentaire: 'Dispo toute la journée',
      };

      render(
        <DisponibiliteDetailModal
          activite={activite}
          disponibiliteEffective={disponibiliteEffective}
          dispoJourneeActuelle={dispoJourneeActuelle}
          onClose={vi.fn()}
        />,
      );

      const toggle = screen.getByRole('checkbox');
      fireEvent.click(toggle);
      fireEvent.click(screen.getByText('Absent').closest('button')!);
      fireEvent.click(toggle); // retour à "journee"

      expect(screen.getByText('Disponible').closest('button')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('textbox')).toHaveValue('Dispo toute la journée');
    });
  });

  describe('source "activite" — édition d\'une surcharge existante', () => {
    const disponibiliteEffective: DisponibiliteEffectiveDto = {
      statut: 'absent',
      source: 'activite',
      commentaire: 'Blessé pour ce match',
    };

    it('pré-remplit le statut/commentaire de la surcharge, case cochée, pas de bouton "Retirer la surcharge"', () => {
      mockMutationHooks();

      render(
        <DisponibiliteDetailModal
          activite={activite}
          disponibiliteEffective={disponibiliteEffective}
          onClose={vi.fn()}
        />,
      );

      expect(screen.getByText('Absent').closest('button')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('textbox')).toHaveValue('Blessé pour ce match');
      expect(screen.getByRole('checkbox')).toBeChecked();
      expect(screen.queryByText('Retirer la surcharge')).not.toBeInTheDocument();
    });

    it('soumet la modification via useDeclarerDisponibiliteActivite sur activite.id', () => {
      const { declarerActiviteMutate, declarerJourneeMutate } = mockMutationHooks();

      render(
        <DisponibiliteDetailModal
          activite={activite}
          disponibiliteEffective={disponibiliteEffective}
          onClose={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByText('Présent').closest('button')!);
      fireEvent.click(screen.getByText('Enregistrer'));

      expect(declarerActiviteMutate).toHaveBeenCalledWith(
        { activiteId: 'activite-1', dto: { statut: 'present', commentaire: 'Blessé pour ce match' } },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
      expect(declarerJourneeMutate).not.toHaveBeenCalled();
    });

    it('décocher la case puis cliquer sur Enregistrer retire la surcharge via useSupprimerDisponibiliteActivite', () => {
      const { supprimerMutate, declarerActiviteMutate, declarerJourneeMutate } = mockMutationHooks();

      render(
        <DisponibiliteDetailModal
          activite={activite}
          disponibiliteEffective={disponibiliteEffective}
          onClose={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByRole('checkbox'));
      fireEvent.click(screen.getByText('Enregistrer'));

      expect(supprimerMutate).toHaveBeenCalledWith(
        { activiteId: 'activite-1' },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
      expect(declarerActiviteMutate).not.toHaveBeenCalled();
      expect(declarerJourneeMutate).not.toHaveBeenCalled();
    });

    it('décoche puis recoche la case sans cliquer sur Enregistrer : aucune mutation n\'est appelée à la fermeture', () => {
      const { declarerActiviteMutate, declarerJourneeMutate, supprimerMutate } = mockMutationHooks();
      const onClose = vi.fn();

      render(
        <DisponibiliteDetailModal
          activite={activite}
          disponibiliteEffective={disponibiliteEffective}
          onClose={onClose}
        />,
      );

      const toggle = screen.getByRole('checkbox');
      fireEvent.click(toggle);
      fireEvent.click(toggle);
      fireEvent.click(screen.getByText('Annuler'));

      expect(declarerActiviteMutate).not.toHaveBeenCalled();
      expect(declarerJourneeMutate).not.toHaveBeenCalled();
      expect(supprimerMutate).not.toHaveBeenCalled();
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('fermeture de la modale', () => {
    it('appelle onClose au clic sur l\'overlay', () => {
      mockMutationHooks();
      const onClose = vi.fn();
      const disponibiliteEffective: DisponibiliteEffectiveDto = { statut: 'autre', source: 'aucune' };

      render(
        <DisponibiliteDetailModal
          activite={activite}
          disponibiliteEffective={disponibiliteEffective}
          onClose={onClose}
        />,
      );

      fireEvent.click(screen.getByRole('presentation'));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('n\'appelle pas onClose au clic à l\'intérieur de la boîte de dialogue (stopPropagation)', () => {
      mockMutationHooks();
      const onClose = vi.fn();
      const disponibiliteEffective: DisponibiliteEffectiveDto = { statut: 'autre', source: 'aucune' };

      render(
        <DisponibiliteDetailModal
          activite={activite}
          disponibiliteEffective={disponibiliteEffective}
          onClose={onClose}
        />,
      );

      fireEvent.click(screen.getByRole('dialog'));

      expect(onClose).not.toHaveBeenCalled();
    });

    it('appelle onClose au clic sur le bouton "Annuler"', () => {
      mockMutationHooks();
      const onClose = vi.fn();
      const disponibiliteEffective: DisponibiliteEffectiveDto = { statut: 'autre', source: 'aucune' };

      render(
        <DisponibiliteDetailModal
          activite={activite}
          disponibiliteEffective={disponibiliteEffective}
          onClose={onClose}
        />,
      );

      fireEvent.click(screen.getByText('Annuler'));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('contenu informatif de la modale', () => {
    it('affiche le label, le type, la date, l\'heure de convocation/début et le commentaire de l\'activité', () => {
      mockMutationHooks();
      const disponibiliteEffective: DisponibiliteEffectiveDto = { statut: 'autre', source: 'aucune' };

      render(
        <DisponibiliteDetailModal
          activite={activite}
          disponibiliteEffective={disponibiliteEffective}
          onClose={vi.fn()}
        />,
      );

      expect(screen.getByText('Match amical')).toBeInTheDocument();
      expect(screen.getByText('Match')).toBeInTheDocument();
      expect(screen.getByText('2026-07-10')).toBeInTheDocument();
      expect(screen.getByText('13:30')).toBeInTheDocument();
      expect(screen.getByText('15:00')).toBeInTheDocument();
      expect(screen.getByText('RDV au stade')).toBeInTheDocument();
    });

    it('affiche un tiret quand l\'activité n\'a pas de commentaire', () => {
      mockMutationHooks();
      const activiteSansCommentaire: ActiviteColonneDto = { ...activite, commentaire: undefined };
      const disponibiliteEffective: DisponibiliteEffectiveDto = { statut: 'autre', source: 'aucune' };

      render(
        <DisponibiliteDetailModal
          activite={activiteSansCommentaire}
          disponibiliteEffective={disponibiliteEffective}
          onClose={vi.fn()}
        />,
      );

      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });
});
