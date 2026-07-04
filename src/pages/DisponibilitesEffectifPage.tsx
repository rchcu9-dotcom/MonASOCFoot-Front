import { useState } from 'react';
import { EffectifJoueursTable } from '../components/disponibilites/EffectifJoueursTable';
import { EffectifMatchNavigation } from '../components/disponibilites/EffectifMatchNavigation';
import { useEffectifMatch } from '../hooks/useEffectifMatch';

/**
 * Page de consultation en lecture seule des disponibilités de l'effectif, un match à la fois.
 * Les flèches de navigation ne changent que le match affiché, jamais les données (aucune mutation).
 */
export function DisponibilitesEffectifPage() {
  const [matchIdSelectionne, setMatchIdSelectionne] = useState<string | undefined>(undefined);
  const { data, isLoading, isError } = useEffectifMatch(matchIdSelectionne);

  return (
    <div className="page">
      <h1>Disponibilités de l'effectif</h1>

      {isLoading && <p>Chargement des disponibilités…</p>}
      {isError && <p>Impossible de charger les disponibilités de l'effectif.</p>}

      {data && !isLoading && !isError && (
        data.matchCourant && data.badge ? (
          <>
            <EffectifMatchNavigation
              matchCourant={data.matchCourant}
              matchsAVenir={data.matchsAVenir}
              badge={data.badge}
              peutReculer={data.matchPrecedentId !== null}
              peutAvancer={data.matchSuivantId !== null}
              onPrecedent={() => {
                if (data.matchPrecedentId) setMatchIdSelectionne(data.matchPrecedentId);
              }}
              onSuivant={() => {
                if (data.matchSuivantId) setMatchIdSelectionne(data.matchSuivantId);
              }}
              onSelectionnerMatch={setMatchIdSelectionne}
            />
            <EffectifJoueursTable joueurs={data.joueurs} />
          </>
        ) : (
          <p>Aucun match à venir.</p>
        )
      )}
    </div>
  );
}
