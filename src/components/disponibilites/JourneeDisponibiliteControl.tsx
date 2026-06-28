import { useState } from 'react';
import type { StatutDisponibilite } from '../../api/disponibilites';
import { STATUT_DISPONIBILITE_LABELS as LABELS } from './statutDisponibilite.constants';

export interface JourneeDisponibiliteControlProps {
  date: string;
  /** Dispo de journée déjà déclarée par l'utilisateur connecté pour cette date, le cas échéant. */
  disponibiliteActuelle?: { statut: StatutDisponibilite; commentaire?: string };
  onEnregistrer: (statut: StatutDisponibilite, commentaire?: string) => void;
  enregistrementEnCours?: boolean;
}

/**
 * Contrôle de saisie de la disponibilité de journée. Composant pur : aucun appel réseau interne,
 * branché sur `useDeclarerDisponibiliteJournee` par le composant parent (cf. `onEnregistrer`) —
 * même convention que `ActiviteOverrideControl`. Pas de bouton « Retirer » : il n'existe pas de
 * mécanisme de suppression de la disponibilité de journée.
 */
export function JourneeDisponibiliteControl({
  date,
  disponibiliteActuelle,
  onEnregistrer,
  enregistrementEnCours = false,
}: JourneeDisponibiliteControlProps) {
  const [statut, setStatut] = useState<StatutDisponibilite>(
    disponibiliteActuelle?.statut ?? 'present',
  );
  const [commentaire, setCommentaire] = useState(disponibiliteActuelle?.commentaire ?? '');

  return (
    <div className="journee-disponibilite-control">
      <p className="journee-disponibilite-control__date">{date}</p>

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

      <div className="journee-disponibilite-control__actions">
        <button
          type="button"
          disabled={enregistrementEnCours}
          onClick={() => onEnregistrer(statut, commentaire || undefined)}
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}
