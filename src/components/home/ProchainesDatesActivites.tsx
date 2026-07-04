import type { ProchaineDateAccueilDto } from '../../api/disponibilites';
import { getContourCouleurParRang, type RangDateAccueil } from '../../utils/disponibiliteUrgence';
import { ActiviteCarte } from '../disponibilites/ActiviteCarte';

interface Props {
  prochainesDates: ProchaineDateAccueilDto[];
  onSelect: (activiteId: string) => void;
}

/**
 * Bloc « Mes activités à venir » : titre englobant fixe, puis soit le message d'absence
 * d'activité, soit les 3 prochaines dates distinctes, chacune avec le statut du joueur
 * connecté pour ses activités (réutilise `ActiviteCarte`). N'affiche que les dates présentes
 * dans `prochainesDates` (0 à 3) — pas de remplissage artificiel.
 */
export function ProchainesDatesActivites({ prochainesDates, onSelect }: Props) {
  return (
    <section className="prochaines-activites">
      <h2 className="dispos-colonne__titre">Mes activités à venir</h2>

      {prochainesDates.length === 0 ? (
        <p className="dispos-colonne__vide">Aucune activité à venir.</p>
      ) : (
        <div className="prochaines-activites__liste">
          {prochainesDates.map(({ date, activites }, index) => {
            const rang: RangDateAccueil = index === 0 ? 'premiere' : 'suivante';

            return (
              <section key={date} className="dispos-colonne">
                <h3 className="dispos-colonne__titre">{date}</h3>
                <div className="dispos-colonne__liste">
                  {activites.map(({ activite, disponibilite }) => (
                    <ActiviteCarte
                      key={activite.id}
                      activite={activite}
                      disponibilite={disponibilite}
                      couleurContour={getContourCouleurParRang(disponibilite, rang)}
                      onClick={() => onSelect(activite.id)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}
