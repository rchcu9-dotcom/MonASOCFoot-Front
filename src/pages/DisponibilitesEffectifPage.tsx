import { useState } from 'react';
import { DisponibilitesEffectifTable } from '../components/disponibilites/DisponibilitesEffectifTable';
import {
  FiltreJourneeActivite,
  type FiltreJourneeActiviteValue,
} from '../components/disponibilites/FiltreJourneeActivite';
import { useDisponibilitesEffectif } from '../hooks/useDisponibilitesEffectif';

/** Page de consultation en lecture seule des disponibilités de l'effectif. Aucune mutation. */
export function DisponibilitesEffectifPage() {
  const [filtre, setFiltre] = useState<FiltreJourneeActiviteValue>({});
  const { data, isLoading, isError } = useDisponibilitesEffectif(filtre);

  return (
    <div className="page">
      <h1>Disponibilités de l'effectif</h1>

      {data && (
        <FiltreJourneeActivite
          activites={data.activites}
          value={filtre}
          onChange={setFiltre}
        />
      )}

      {isLoading && <p>Chargement des disponibilités…</p>}
      {isError && <p>Impossible de charger les disponibilités de l'effectif.</p>}

      {data && !isLoading && !isError && (
        <DisponibilitesEffectifTable activites={data.activites} joueurs={data.joueurs} />
      )}
    </div>
  );
}
