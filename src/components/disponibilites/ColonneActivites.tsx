import type { ActiviteColonneDto, DisponibiliteEffectiveDto } from '../../api/disponibilites';
import { ActiviteCarte } from './ActiviteCarte';

interface Ligne {
  activite: ActiviteColonneDto;
  disponibilite: DisponibiliteEffectiveDto;
}

interface Props {
  titre: string;
  lignes: Ligne[];
  onSelect: (activiteId: string) => void;
  messageVide?: string;
}

/** Colonne de la page « Mes disponibilités » : titre + liste de cartes d'activité. */
export function ColonneActivites({ titre, lignes, onSelect, messageVide }: Props) {
  return (
    <section className="dispos-colonne">
      <h2 className="dispos-colonne__titre">{titre}</h2>

      {lignes.length === 0 && (
        <p className="dispos-colonne__vide">{messageVide ?? 'Rien à signaler.'}</p>
      )}

      <div className="dispos-colonne__liste">
        {lignes.map(({ activite, disponibilite }) => (
          <ActiviteCarte
            key={activite.id}
            activite={activite}
            disponibilite={disponibilite}
            onClick={() => onSelect(activite.id)}
          />
        ))}
      </div>
    </section>
  );
}
