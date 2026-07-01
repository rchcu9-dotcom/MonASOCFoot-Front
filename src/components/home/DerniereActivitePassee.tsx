import type { ActiviteAvecDisponibiliteDto } from '../../api/disponibilites';
import { ActiviteCarte } from '../disponibilites/ActiviteCarte';

interface Props {
  dernierePassee: ActiviteAvecDisponibiliteDto | null;
  onSelect: (activiteId: string) => void;
}

/** Disponibilité du joueur connecté pour sa dernière activité passée (réutilise `ActiviteCarte`). */
export function DerniereActivitePassee({ dernierePassee, onSelect }: Props) {
  return (
    <section className="dispos-colonne">
      <h2 className="dispos-colonne__titre">Ma dernière activité</h2>

      {dernierePassee ? (
        <div className="dispos-colonne__liste">
          <ActiviteCarte
            activite={dernierePassee.activite}
            disponibilite={dernierePassee.disponibilite}
            onClick={() => onSelect(dernierePassee.activite.id)}
          />
        </div>
      ) : (
        <p className="dispos-colonne__vide">Aucune activité passée pour l'instant.</p>
      )}
    </section>
  );
}
