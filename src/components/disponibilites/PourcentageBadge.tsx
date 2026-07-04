import { getPourcentageBadgeStyle } from '../../utils/pourcentageRenseignement';

interface Props {
  pourcentage: number;
}

/** Pastille colorée du taux de matchs à venir renseignés (couleur selon `getPourcentageCouleur`). */
export function PourcentageBadge({ pourcentage }: Props) {
  const { bg, fg } = getPourcentageBadgeStyle(pourcentage);

  return (
    <span className="statut-badge" style={{ backgroundColor: bg, color: fg }}>
      {pourcentage}% renseigné
    </span>
  );
}
