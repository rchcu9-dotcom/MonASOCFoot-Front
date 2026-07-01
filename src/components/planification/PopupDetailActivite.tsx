import { Link } from 'react-router-dom';
import type { ActiviteDto } from '../../api/activites';
import { LABEL_EQUIPE } from '../activites/equipeClub.constants';

interface Props {
  activite: ActiviteDto;
  onClose: () => void;
}

/**
 * Détail complet d'une activité, ouvert au clic sur une carte (colonne gauche ou droite).
 * Réutilise les mêmes informations que le formulaire d'édition du CRUD existant, avec un
 * raccourci vers l'édition complète sur `AdminActivitesPage`.
 */
export function PopupDetailActivite({ activite, onClose }: Props) {
  return (
    <div className="confirm-dialog__overlay" role="presentation" onClick={onClose}>
      <div
        className="confirm-dialog popup-detail-activite"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <h2>{activite.label}</h2>
        <dl>
          <dt>Type</dt>
          <dd>{activite.type === 'match' ? 'Match' : 'Autre'}</dd>
          <dt>Équipe</dt>
          <dd>{activite.equipe ? LABEL_EQUIPE[activite.equipe] : 'Non renseignée'}</dd>
          <dt>Date</dt>
          <dd>{activite.date ?? 'Sans date'}</dd>
          <dt>Heure de convocation</dt>
          <dd>{activite.heureConvocation}</dd>
          <dt>Heure de début</dt>
          <dd>{activite.heureDebut}</dd>
          <dt>Commentaire</dt>
          <dd>{activite.commentaire ?? '—'}</dd>
        </dl>
        <div className="confirm-dialog__actions">
          <Link to="/admin/activites">Modifier dans le CRUD</Link>
          <button type="button" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
