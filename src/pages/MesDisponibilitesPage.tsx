import { useAuth } from '../auth/AuthContext';
import { ActiviteOverrideControl } from '../components/disponibilites/ActiviteOverrideControl';
import { JourneeDisponibiliteControl } from '../components/disponibilites/JourneeDisponibiliteControl';
import type { StatutDisponibilite } from '../api/disponibilites';
import { useDeclarerDisponibiliteActivite } from '../hooks/useDeclarerDisponibiliteActivite';
import { useDeclarerDisponibiliteJournee } from '../hooks/useDeclarerDisponibiliteJournee';
import { useDisponibilitesEffectif } from '../hooks/useDisponibilitesEffectif';
import { useMesDisponibilitesJournee } from '../hooks/useMesDisponibilitesJournee';
import { useProchainesJourneesAvecActivites } from '../hooks/useProchainesJourneesAvecActivites';
import { useSupprimerDisponibiliteActivite } from '../hooks/useSupprimerDisponibiliteActivite';

/**
 * Page joueur : déclaration de la disponibilité de journée pour les prochaines journées avec
 * activité(s), avec en complément la possibilité d'affiner par activité (cf. décision en
 * autonomie — affichage systématique d'`ActiviteOverrideControl`, y compris pour une date à
 * activité unique).
 */
export function MesDisponibilitesPage() {
  const { user } = useAuth();
  const { data: journees, isLoading: journeesEnChargement, isError: journeesEnErreur } =
    useProchainesJourneesAvecActivites();
  const { data: mesDisponibilitesJournee } = useMesDisponibilitesJournee();
  const { data: effectif } = useDisponibilitesEffectif();

  const declarerDisponibiliteJournee = useDeclarerDisponibiliteJournee();
  const declarerDisponibiliteActivite = useDeclarerDisponibiliteActivite();
  const supprimerDisponibiliteActivite = useSupprimerDisponibiliteActivite();

  const disponibiliteJourneeParDate = new Map(
    (mesDisponibilitesJournee ?? []).map((d) => [d.date, d]),
  );

  const ligneUtilisateurConnecte = user
    ? effectif?.joueurs.find((joueur) => joueur.utilisateurId === user.id)
    : undefined;

  function handleEnregistrerJournee(
    date: string,
    statut: StatutDisponibilite,
    commentaire?: string,
  ) {
    declarerDisponibiliteJournee.mutate({ date, dto: { statut, commentaire } });
  }

  function handleEnregistrerActivite(
    activiteId: string,
    statut: StatutDisponibilite,
    commentaire?: string,
  ) {
    declarerDisponibiliteActivite.mutate({ activiteId, dto: { statut, commentaire } });
  }

  function handleRetirerSurchargeActivite(activiteId: string) {
    supprimerDisponibiliteActivite.mutate({ activiteId });
  }

  return (
    <div className="page">
      <h1>Mes disponibilités</h1>

      {journeesEnChargement && <p>Chargement des journées à venir…</p>}
      {journeesEnErreur && <p>Impossible de charger les journées à venir.</p>}

      {journees && journees.length === 0 && <p>Aucune activité à venir.</p>}

      {journees?.map((journee) => {
        const disponibiliteJournee = disponibiliteJourneeParDate.get(journee.date);

        return (
          <section key={journee.date} className="mes-disponibilites-page__journee">
            <h2>{journee.date}</h2>

            <JourneeDisponibiliteControl
              date={journee.date}
              disponibiliteActuelle={
                disponibiliteJournee
                  ? {
                      statut: disponibiliteJournee.statut,
                      commentaire: disponibiliteJournee.commentaire,
                    }
                  : undefined
              }
              onEnregistrer={(statut, commentaire) =>
                handleEnregistrerJournee(journee.date, statut, commentaire)
              }
              enregistrementEnCours={declarerDisponibiliteJournee.isPending}
            />

            {journee.activites.map((activite) => {
              const disponibiliteEffective =
                ligneUtilisateurConnecte?.disponibilites[activite.id];
              const surchargeActuelle =
                disponibiliteEffective?.source === 'activite'
                  ? {
                      statut: disponibiliteEffective.statut,
                      commentaire: disponibiliteEffective.commentaire,
                    }
                  : undefined;

              return (
                <ActiviteOverrideControl
                  key={activite.id}
                  activite={activite}
                  surchargeActuelle={surchargeActuelle}
                  statutJourneeParDefaut={
                    disponibiliteJournee?.statut ??
                    (disponibiliteEffective?.source === 'journee'
                      ? disponibiliteEffective.statut
                      : undefined)
                  }
                  onEnregistrer={(statut, commentaire) =>
                    handleEnregistrerActivite(activite.id, statut, commentaire)
                  }
                  onRetirerSurcharge={() => handleRetirerSurchargeActivite(activite.id)}
                  enregistrementEnCours={declarerDisponibiliteActivite.isPending}
                  suppressionEnCours={supprimerDisponibiliteActivite.isPending}
                />
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
