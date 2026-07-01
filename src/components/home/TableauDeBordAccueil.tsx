import type { TableauDeBordAccueilDto } from '../../api/disponibilites';

interface Props {
  tableauDeBord: TableauDeBordAccueilDto;
}

/** Indicateurs personnels sur les activités à venir : total, renseignées, taux de renseignement. */
export function TableauDeBordAccueil({ tableauDeBord }: Props) {
  const { totalAVenir, renseigneesAVenir, pourcentageRenseignement } = tableauDeBord;

  return (
    <section className="tableau-de-bord">
      <h2 className="dispos-colonne__titre">Mon tableau de bord</h2>
      <dl className="tableau-de-bord__liste">
        <div className="tableau-de-bord__indicateur">
          <dt>Activités à venir</dt>
          <dd>{totalAVenir}</dd>
        </div>
        <div className="tableau-de-bord__indicateur">
          <dt>Renseignées</dt>
          <dd>{renseigneesAVenir}</dd>
        </div>
        <div className="tableau-de-bord__indicateur">
          <dt>Taux de renseignement</dt>
          <dd>{pourcentageRenseignement}%</dd>
        </div>
      </dl>
    </section>
  );
}
