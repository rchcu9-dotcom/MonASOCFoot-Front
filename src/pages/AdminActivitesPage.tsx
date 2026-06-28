import { useState } from 'react';
import type { ActiviteDto, ImportMatchsResultatDto } from '../api/activites';
import { ActiviteForm, type ActiviteFormValues } from '../components/activites/ActiviteForm';
import { ActivitesList } from '../components/activites/ActivitesList';
import { ConfirmDeleteDialog } from '../components/activites/ConfirmDeleteDialog';
import { useActivites } from '../hooks/useActivites';
import { useCreerActivite } from '../hooks/useCreerActivite';
import { useImporterMatchsDistrict } from '../hooks/useImporterMatchsDistrict';
import { useModifierActivite } from '../hooks/useModifierActivite';
import { useSupprimerActivite } from '../hooks/useSupprimerActivite';

/** Page admin de gestion des activités : liste + formulaire création/édition + suppression confirmée. */
export function AdminActivitesPage() {
  const { data, isLoading, isError } = useActivites();
  const creerActivite = useCreerActivite();
  const modifierActivite = useModifierActivite();
  const supprimerActivite = useSupprimerActivite();
  const importerMatchsDistrict = useImporterMatchsDistrict();

  const [activiteEnEdition, setActiviteEnEdition] = useState<ActiviteDto | null>(null);
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [idASupprimer, setIdASupprimer] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [resultatImport, setResultatImport] = useState<ImportMatchsResultatDto | null>(null);

  function ouvrirCreation() {
    setActiviteEnEdition(null);
    setFormulaireOuvert(true);
    setErreur(null);
  }

  function ouvrirEdition(activite: ActiviteDto) {
    setActiviteEnEdition(activite);
    setFormulaireOuvert(true);
    setErreur(null);
  }

  function fermerFormulaire() {
    setFormulaireOuvert(false);
    setActiviteEnEdition(null);
  }

  function handleSubmit(values: ActiviteFormValues) {
    setErreur(null);
    if (activiteEnEdition) {
      modifierActivite.mutate(
        { id: activiteEnEdition.id, dto: values },
        {
          onSuccess: () => fermerFormulaire(),
          onError: (err) => setErreur(err.message),
        },
      );
    } else {
      creerActivite.mutate(values, {
        onSuccess: () => fermerFormulaire(),
        onError: (err) => setErreur(err.message),
      });
    }
  }

  function confirmerSuppression() {
    if (!idASupprimer) return;
    supprimerActivite.mutate(idASupprimer, {
      onSuccess: () => setIdASupprimer(null),
      onError: (err) => setErreur(err.message),
    });
  }

  function lancerImportDistrict() {
    setErreur(null);
    setResultatImport(null);
    importerMatchsDistrict.mutate(undefined, {
      onSuccess: (resultat) => setResultatImport(resultat),
      onError: (err) => setErreur(err.message),
    });
  }

  return (
    <div className="page">
      <h1>Gestion des activités</h1>

      {!formulaireOuvert && (
        <button type="button" onClick={ouvrirCreation}>
          Nouvelle activité
        </button>
      )}

      <button
        type="button"
        onClick={lancerImportDistrict}
        disabled={importerMatchsDistrict.isPending}
      >
        {importerMatchsDistrict.isPending ? 'Import en cours…' : 'Importer les matchs du district'}
      </button>

      {resultatImport && (
        <p>
          Import terminé : {resultatImport.matchsRecuperes} match(s) récupéré(s),{' '}
          {resultatImport.crees} créé(s), {resultatImport.misAJour} mis à jour, {resultatImport.ignores}{' '}
          ignoré(s) (déjà saisis manuellement)
          {resultatImport.erreurs.length > 0 &&
            ` — ${resultatImport.erreurs.length} erreur(s) : ${resultatImport.erreurs.join('; ')}`}
        </p>
      )}

      {erreur && <p className="activite-form__erreur">{erreur}</p>}

      {formulaireOuvert && (
        <ActiviteForm
          activite={activiteEnEdition ?? undefined}
          onSubmit={handleSubmit}
          onCancel={fermerFormulaire}
        />
      )}

      {isLoading && <p>Chargement des activités…</p>}
      {isError && <p>Impossible de charger les activités.</p>}

      {data && !isLoading && !isError && (
        <ActivitesList
          activites={data}
          onEdit={ouvrirEdition}
          onDelete={(id) => setIdASupprimer(id)}
        />
      )}

      {idASupprimer && (
        <ConfirmDeleteDialog
          message="Supprimer définitivement cette activité ?"
          onConfirm={confirmerSuppression}
          onCancel={() => setIdASupprimer(null)}
        />
      )}
    </div>
  );
}
