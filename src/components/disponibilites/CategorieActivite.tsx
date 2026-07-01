import type { EquipeClub } from '../../api/activites';
import { LABEL_EQUIPE } from '../activites/equipeClub.constants';

interface Props {
  equipe?: EquipeClub;
}

/** Affiche le libellé de la catégorie (équipe) de l'activité, ou un tiret si absente (AG, barbecue, ...). */
export function CategorieActivite({ equipe }: Props) {
  return <span className="categorie-activite">{equipe ? LABEL_EQUIPE[equipe] : '—'}</span>;
}
