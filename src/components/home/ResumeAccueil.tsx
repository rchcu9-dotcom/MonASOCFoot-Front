import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ResumeAccueilDto } from '../../api/disponibilites';
import { useMesDisponibilitesJournee } from '../../hooks/useMesDisponibilitesJournee';
import { DisponibiliteDetailModal } from '../disponibilites/DisponibiliteDetailModal';
import { ProchainesDatesActivites } from './ProchainesDatesActivites';
import { TableauDeBordAccueil } from './TableauDeBordAccueil';

interface Props {
  resume: ResumeAccueilDto;
}

/**
 * Tableau de bord personnel de la page Accueil : indicateurs, puis 3 prochaines dates.
 * Orchestre l'ouverture de `DisponibiliteDetailModal` (réutilisée telle quelle,
 * cf. `MesDisponibilitesPage`) au clic sur une activité.
 */
export function ResumeAccueil({ resume }: Props) {
  const { data: mesDisponibilitesJournee } = useMesDisponibilitesJournee();
  const [activiteSelectionneeId, setActiviteSelectionneeId] = useState<string | null>(null);

  const disponibiliteJourneeParDate = new Map(
    (mesDisponibilitesJournee ?? []).map((d) => [d.date, d]),
  );

  const toutesLesLignes = resume.prochainesDates.flatMap(
    (prochaineDate) => prochaineDate.activites,
  );

  const ligneSelectionnee = toutesLesLignes.find(
    (ligne) => ligne.activite.id === activiteSelectionneeId,
  );

  return (
    <div className="resume-accueil">
      <TableauDeBordAccueil tableauDeBord={resume.tableauDeBord} />
      <ProchainesDatesActivites
        prochainesDates={resume.prochainesDates}
        onSelect={setActiviteSelectionneeId}
      />

      <p>
        <Link to="/mes-disponibilites">Voir toutes mes disponibilités</Link>
      </p>

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
