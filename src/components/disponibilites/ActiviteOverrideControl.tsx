import { useState } from 'react';
import type { StatutDisponibilite, TypeActivite } from '../../api/disponibilites';
import { STATUT_DISPONIBILITE_LABELS as LABELS } from './statutDisponibilite.constants';

export interface ActiviteOverrideControlProps {
  activite: { id: string; label: string; heureDebut: string; type: TypeActivite };
  /** Surcharge déjà déclarée par l'utilisateur connecté pour cette activité, le cas échéant. */
  surchargeActuelle?: { statut: StatutDisponibilite; commentaire?: string };
  /** Disponibilité de journée en vigueur, affichée comme valeur de repli si la surcharge est retirée. */
  statutJourneeParDefaut?: StatutDisponibilite;
  onEnregistrer: (statut: StatutDisponibilite, commentaire?: string) => void;
  onRetirerSurcharge: () => void;
  enregistrementEnCours?: boolean;
  suppressionEnCours?: boolean;
}

/**
 * Ligne de contrôle pour la surcharge de disponibilité d'une activité. Composant pur : ne fait
 * aucun appel réseau lui-même, branché sur `useDeclarerDisponibiliteActivite`/
 * `useSupprimerDisponibiliteActivite` par le composant parent (cf. `onEnregistrer`/
 * `onRetirerSurcharge`) — même convention que `ActiviteForm`/`ConfirmDeleteDialog`.
 */
export function ActiviteOverrideControl({
  activite,
  surchargeActuelle,
  statutJourneeParDefaut,
  onEnregistrer,
  onRetirerSurcharge,
  enregistrementEnCours = false,
  suppressionEnCours = false,
}: ActiviteOverrideControlProps) {
  const [statut, setStatut] = useState<StatutDisponibilite>(
    surchargeActuelle?.statut ?? statutJourneeParDefaut ?? 'present',
  );
  const [commentaire, setCommentaire] = useState(surchargeActuelle?.commentaire ?? '');

  return (
    <div className="activite-override-control">
      <p className="activite-override-control__activite">
        {activite.heureDebut} — {activite.label} ({activite.type})
      </p>

      <label>
        Disponibilité
        <select
          value={statut}
          onChange={(event) => setStatut(event.target.value as StatutDisponibilite)}
        >
          {Object.entries(LABELS).map(([valeur, libelle]) => (
            <option key={valeur} value={valeur}>
              {libelle}
            </option>
          ))}
        </select>
      </label>

      <label>
        Commentaire
        <textarea
          value={commentaire}
          onChange={(event) => setCommentaire(event.target.value)}
        />
      </label>

      <div className="activite-override-control__actions">
        <button
          type="button"
          disabled={enregistrementEnCours}
          onClick={() => onEnregistrer(statut, commentaire || undefined)}
        >
          Enregistrer
        </button>

        {surchargeActuelle && (
          <button type="button" disabled={suppressionEnCours} onClick={onRetirerSurcharge}>
            Retirer la surcharge
            {statutJourneeParDefaut && ` (revenir à ${LABELS[statutJourneeParDefaut]})`}
          </button>
        )}
      </div>
    </div>
  );
}
