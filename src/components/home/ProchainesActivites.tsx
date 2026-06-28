import type { ActiviteDto } from '../../api/activites';

interface Props {
  activites: ActiviteDto[];
  /** Date ISO (yyyy-mm-dd) du jour, injectable pour les tests — défaut: aujourd'hui. */
  aujourdhui?: string;
}

/** Liste en lecture seule des activités à venir, pour la page d'accueil (mobile-first). */
export function ProchainesActivites({ activites, aujourdhui }: Props) {
  const dateReference = aujourdhui ?? new Date().toISOString().slice(0, 10);

  const activitesAVenir = activites
    .filter((activite) => activite.date >= dateReference)
    .sort((a, b) => a.date.localeCompare(b.date) || a.heureDebut.localeCompare(b.heureDebut));

  if (activitesAVenir.length === 0) {
    return <p>Aucune activité à venir.</p>;
  }

  return (
    <ul className="prochaines-activites">
      {activitesAVenir.map((activite) => (
        <li key={activite.id} className="prochaines-activites__item">
          <span className="prochaines-activites__date">{activite.date}</span>
          <span className="prochaines-activites__heure">{activite.heureDebut}</span>
          <span className="prochaines-activites__label">{activite.label}</span>
          <span className="prochaines-activites__type">{activite.type}</span>
        </li>
      ))}
    </ul>
  );
}
