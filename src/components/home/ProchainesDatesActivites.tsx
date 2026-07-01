import type { ProchaineDateAccueilDto } from '../../api/disponibilites';
import { ActiviteCarte } from '../disponibilites/ActiviteCarte';

interface Props {
  prochainesDates: ProchaineDateAccueilDto[];
  onSelect: (activiteId: string) => void;
}

/**
 * Les 3 prochaines dates distinctes d'activités à venir, chacune avec le statut du joueur
 * connecté pour ses activités (réutilise `ActiviteCarte`). N'affiche que les dates présentes
 * dans `prochainesDates` (0 à 3) — pas de remplissage artificiel.
 */
export function ProchainesDatesActivites({ prochainesDates, onSelect }: Props) {
  if (prochainesDates.length === 0) {
    return (
      <section className="dispos-colonne">
        <h2 className="dispos-colonne__titre">Prochaines activités</h2>
        <p className="dispos-colonne__vide">Aucune activité à venir.</p>
      </section>
    );
  }

  return (
    <>
      {prochainesDates.map(({ date, activites }) => (
        <section key={date} className="dispos-colonne">
          <h2 className="dispos-colonne__titre">{date}</h2>
          <div className="dispos-colonne__liste">
            {activites.map(({ activite, disponibilite }) => (
              <ActiviteCarte
                key={activite.id}
                activite={activite}
                disponibilite={disponibilite}
                onClick={() => onSelect(activite.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
