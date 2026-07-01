import { useState } from 'react';
import type {
  ActiviteColonneDto,
  DisponibiliteEffectiveDto,
  DisponibiliteJourneeDto,
  StatutDisponibilite,
} from '../../api/disponibilites';
import { useDeclarerDisponibiliteActivite } from '../../hooks/useDeclarerDisponibiliteActivite';
import { useDeclarerDisponibiliteJournee } from '../../hooks/useDeclarerDisponibiliteJournee';
import { useSupprimerDisponibiliteActivite } from '../../hooks/useSupprimerDisponibiliteActivite';
import { StatutBadgeSelector } from './StatutBadgeSelector';

interface Props {
  activite: ActiviteColonneDto;
  disponibiliteEffective: DisponibiliteEffectiveDto;
  /** Dispo de journée du joueur pour `activite.date`, si elle existe. */
  dispoJourneeActuelle?: DisponibiliteJourneeDto;
  onClose: () => void;
}

const LABEL_TYPE: Record<ActiviteColonneDto['type'], string> = {
  match: 'Match',
  autre: 'Autre',
};

type Cible = 'journee' | 'activite';

/**
 * Popup de détail + formulaire de saisie/modification de la disponibilité du joueur connecté
 * pour une activité. Reprend le pattern markup/CSS `.confirm-dialog` (cf. `PopupDetailActivite`).
 */
export function DisponibiliteDetailModal({
  activite,
  disponibiliteEffective,
  dispoJourneeActuelle,
  onClose,
}: Props) {
  const surchargeExistaitALOuverture = disponibiliteEffective.source === 'activite';
  const [cible, setCible] = useState<Cible>(
    disponibiliteEffective.source === 'aucune' ? 'journee' : disponibiliteEffective.source,
  );
  const [statut, setStatut] = useState<StatutDisponibilite>(
    disponibiliteEffective.source !== 'aucune'
      ? disponibiliteEffective.statut
      : (dispoJourneeActuelle?.statut ?? 'present'),
  );
  const [commentaire, setCommentaire] = useState(
    disponibiliteEffective.source !== 'aucune'
      ? disponibiliteEffective.commentaire ?? ''
      : dispoJourneeActuelle?.commentaire ?? '',
  );

  const declarerDisponibiliteJournee = useDeclarerDisponibiliteJournee();
  const declarerDisponibiliteActivite = useDeclarerDisponibiliteActivite();
  const supprimerDisponibiliteActivite = useSupprimerDisponibiliteActivite();

  function handleChangeCible(nouvelleCible: Cible) {
    setCible(nouvelleCible);
    if (nouvelleCible === 'journee' && dispoJourneeActuelle) {
      setStatut(dispoJourneeActuelle.statut);
      setCommentaire(dispoJourneeActuelle.commentaire ?? '');
    }
  }

  function handleEnregistrer() {
    if (cible === 'activite') {
      declarerDisponibiliteActivite.mutate(
        { activiteId: activite.id, dto: { statut, commentaire: commentaire || undefined } },
        { onSuccess: onClose },
      );
    } else if (surchargeExistaitALOuverture) {
      supprimerDisponibiliteActivite.mutate(
        { activiteId: activite.id },
        { onSuccess: onClose },
      );
    } else {
      declarerDisponibiliteJournee.mutate(
        { date: activite.date, dto: { statut, commentaire: commentaire || undefined } },
        { onSuccess: onClose },
      );
    }
  }

  const enregistrementEnCours =
    declarerDisponibiliteJournee.isPending ||
    declarerDisponibiliteActivite.isPending ||
    supprimerDisponibiliteActivite.isPending;

  return (
    <div className="confirm-dialog__overlay" role="presentation" onClick={onClose}>
      <div
        className="confirm-dialog disponibilite-detail-modal"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <h2>{activite.label}</h2>
        <dl>
          <dt>Type</dt>
          <dd>{LABEL_TYPE[activite.type]}</dd>
          <dt>Date</dt>
          <dd>{activite.date}</dd>
          <dt>Heure de convocation</dt>
          <dd>{activite.heureConvocation}</dd>
          <dt>Heure de début</dt>
          <dd>{activite.heureDebut}</dd>
          <dt>Commentaire de l'activité</dt>
          <dd>{activite.commentaire ?? '—'}</dd>
        </dl>

        <label className="disponibilite-detail-modal__cible">
          <input
            type="checkbox"
            checked={cible === 'activite'}
            onChange={(event) =>
              handleChangeCible(event.target.checked ? 'activite' : 'journee')
            }
          />
          Affiner uniquement pour cette activité (sans changer le reste de la journée)
        </label>

        <div className="disponibilite-detail-modal__form">
          <p>Disponibilité</p>
          <StatutBadgeSelector value={statut} onChange={setStatut} />

          <label className="disponibilite-detail-modal__commentaire">
            Commentaire
            <textarea
              value={commentaire}
              onChange={(event) => setCommentaire(event.target.value)}
            />
          </label>
        </div>

        <div className="confirm-dialog__actions">
          <button type="button" onClick={onClose}>
            Annuler
          </button>
          <button
            type="button"
            disabled={enregistrementEnCours}
            onClick={handleEnregistrer}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
