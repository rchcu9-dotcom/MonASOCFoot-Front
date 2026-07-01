import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ActiviteDto } from '../api/activites';
import { ColonneDate } from '../components/planification/ColonneDate';
import { ColonneSansDate } from '../components/planification/ColonneSansDate';
import { FiltreJoursSemaine } from '../components/planification/FiltreJoursSemaine';
import { JOURS_PAR_DEFAUT } from '../components/planification/joursSemaine';
import { PopupDetailActivite } from '../components/planification/PopupDetailActivite';
import { useDeplacerActivite } from '../hooks/useDeplacerActivite';
import { usePlanificationActivites } from '../hooks/usePlanificationActivites';

const SEMAINES_PAR_DEFAUT = 8;
const TRANCHE_CHARGER_PLUS = 4;

function genererDatesFenetre(semaines: number): string[] {
  const dates: string[] = [];
  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);
  const nombreJours = semaines * 7;
  for (let i = 0; i < nombreJours; i += 1) {
    const date = new Date(aujourdhui);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().slice(0, 10));
  }
  return dates;
}

/**
 * Page admin de planification par glisser-déposer : colonne gauche « Sans date », colonne
 * droite « Calendrier » filtrée par jours de semaine. Drag-and-drop (`@dnd-kit/core`) et mode de
 * repli clic-sélection/clic-cible convergent tous deux vers `onDeplacer`, sans dupliquer la
 * logique métier (cf. spec pour-grer-les-activits-il-faut-pouvoir-bouger-lactivit-dune-).
 */
export function AdminPlanificationActivitesPage() {
  const [semaines, setSemaines] = useState(SEMAINES_PAR_DEFAUT);
  const [joursSelectionnes, setJoursSelectionnes] = useState<number[]>(JOURS_PAR_DEFAUT);
  const [activiteSelectionneeId, setActiviteSelectionneeId] = useState<string | null>(null);
  const [activiteDetail, setActiviteDetail] = useState<ActiviteDto | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const { data, isLoading, isError } = usePlanificationActivites(semaines);
  const deplacerActivite = useDeplacerActivite();

  const activitesParDate = useMemo(() => {
    const map = new Map<string, ActiviteDto[]>();
    for (const activite of data?.calendrier ?? []) {
      if (!activite.date) continue;
      const liste = map.get(activite.date) ?? [];
      liste.push(activite);
      map.set(activite.date, liste);
    }
    return map;
  }, [data]);

  const datesAffichees = useMemo(() => {
    return genererDatesFenetre(semaines).filter((date) => {
      const jourSemaine = new Date(`${date}T00:00:00`).getDay();
      return joursSelectionnes.includes(jourSemaine);
    });
  }, [semaines, joursSelectionnes]);

  /**
   * Fonction métier unique de déplacement, consommée à la fois par le drag réel
   * (`onDragEnd`) et par le mode de repli accessible (sélection-clic puis clic-cible).
   */
  function onDeplacer(activiteId: string, cibleDate: string | null) {
    setErreur(null);
    deplacerActivite.mutate(
      { activiteId, cibleDate },
      { onError: (err) => setErreur(err.message) },
    );
    setActiviteSelectionneeId(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const activiteId = event.active.id as string;
    const cibleId = event.over?.id;
    if (!cibleId) return;
    if (cibleId === 'sans-date') {
      onDeplacer(activiteId, null);
      return;
    }
    if (typeof cibleId === 'string' && cibleId.startsWith('date:')) {
      onDeplacer(activiteId, cibleId.slice('date:'.length));
    }
  }

  function handleClickCarte(activite: ActiviteDto) {
    if (activiteSelectionneeId) {
      // Une carte est déjà sélectionnée : un nouveau clic sur une carte change la sélection
      // plutôt que d'ouvrir le détail, pour rester cohérent avec le mode de repli.
      setActiviteSelectionneeId(activite.id === activiteSelectionneeId ? null : activite.id);
      return;
    }
    setActiviteDetail(activite);
  }

  function selectionnerPourDeplacement(activite: ActiviteDto) {
    setActiviteSelectionneeId(activite.id);
  }

  return (
    <div className="page page--planification">
      <h1>Planification des activités</h1>
      <p>
        <Link to="/admin/activites">Retour à la gestion des activités (CRUD)</Link>
      </p>

      <p className="planification__aide">
        Glissez une carte pour assigner/retirer sa date, ou cliquez sur une carte puis sur une
        cible (mode sans glisser-déposer).
      </p>

      {erreur && <p className="activite-form__erreur">{erreur}</p>}
      {isLoading && <p>Chargement de la planification…</p>}
      {isError && <p>Impossible de charger la planification.</p>}

      {data && !isLoading && !isError && (
        <DndContext onDragEnd={handleDragEnd}>
          <div className="planification__colonnes">
            <section className="planification__colonne planification__colonne--sans-date">
              <h2>Sans date</h2>
              <ColonneSansDate
                activites={data.sansDate}
                selectionId={activiteSelectionneeId}
                onClickCarte={(activite) => {
                  if (activiteSelectionneeId) {
                    onDeplacer(activite.id, null);
                  } else {
                    handleClickCarte(activite);
                  }
                }}
                onClickCible={() => {
                  if (activiteSelectionneeId) onDeplacer(activiteSelectionneeId, null);
                }}
              />
              <p className="planification__astuce-selection">
                {data.sansDate.length > 0 && (
                  <button
                    type="button"
                    className="planification__bouton-selection"
                    onClick={() => {
                      const premiere = data.sansDate[0];
                      if (premiere) selectionnerPourDeplacement(premiere);
                    }}
                  >
                    Sélectionner une activité pour la déplacer
                  </button>
                )}
              </p>
            </section>

            <section className="planification__colonne planification__colonne--calendrier">
              <h2>Calendrier</h2>
              <FiltreJoursSemaine
                joursSelectionnes={joursSelectionnes}
                onChange={setJoursSelectionnes}
              />
              <div className="planification__dates">
                {datesAffichees.map((date) => (
                  <ColonneDate
                    key={date}
                    date={date}
                    activites={activitesParDate.get(date) ?? []}
                    selectionId={activiteSelectionneeId}
                    onClickCarte={handleClickCarte}
                    onClickCible={(cibleDate) => {
                      if (activiteSelectionneeId) onDeplacer(activiteSelectionneeId, cibleDate);
                    }}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSemaines((s) => s + TRANCHE_CHARGER_PLUS)}
              >
                Charger plus (+4 semaines)
              </button>
            </section>
          </div>
        </DndContext>
      )}

      {activiteDetail && (
        <PopupDetailActivite
          activite={activiteDetail}
          onClose={() => setActiviteDetail(null)}
        />
      )}
    </div>
  );
}
