import { useState } from 'react';
import { DisponibiliteDetailModal } from '../components/disponibilites/DisponibiliteDetailModal';
import { ColonneActivites } from '../components/disponibilites/ColonneActivites';
import { useMesActivitesParColonne } from '../hooks/useMesActivitesParColonne';
import { useMesDisponibilitesJournee } from '../hooks/useMesDisponibilitesJournee';

/**
 * Page joueur : saisie des disponibilités en deux colonnes — « À renseigner » (aucune dispo
 * connue) et « Mes disponibilités » (dispo de journée ou d'activité déjà renseignée), cf. spec
 * `fais-moi-une-proposition-de-saisie-de-mes-dispos-o-colonne-d`.
 */
export function MesDisponibilitesPage() {
  const { aTraiter, renseignees, isLoading, isError } = useMesActivitesParColonne();
  const { data: mesDisponibilitesJournee } = useMesDisponibilitesJournee();

  const [activiteSelectionneeId, setActiviteSelectionneeId] = useState<string | null>(null);

  const disponibiliteJourneeParDate = new Map(
    (mesDisponibilitesJournee ?? []).map((d) => [d.date, d]),
  );

  const ligneSelectionnee =
    aTraiter.find((ligne) => ligne.activite.id === activiteSelectionneeId) ??
    renseignees.find((ligne) => ligne.activite.id === activiteSelectionneeId);

  return (
    <div className="page page--dispos">
      <h1>Mes disponibilités</h1>

      {isLoading && <p>Chargement des activités à venir…</p>}
      {isError && <p>Impossible de charger les activités à venir.</p>}

      {!isLoading && !isError && (
        <div className="dispos-colonnes">
          <ColonneActivites
            titre="À renseigner"
            lignes={aTraiter}
            onSelect={setActiviteSelectionneeId}
            messageVide="Aucune disponibilité à renseigner."
          />
          <ColonneActivites
            titre="Mes disponibilités"
            lignes={renseignees}
            onSelect={setActiviteSelectionneeId}
            messageVide="Rien à signaler."
          />
        </div>
      )}

      {ligneSelectionnee && (
        <DisponibiliteDetailModal
          activite={ligneSelectionnee.activite}
          disponibiliteEffective={ligneSelectionnee.disponibilite}
          dispoJourneeActuelle={disponibiliteJourneeParDate.get(ligneSelectionnee.activite.date)}
          onClose={() => setActiviteSelectionneeId(null)}
        />
      )}
    </div>
  );
}
