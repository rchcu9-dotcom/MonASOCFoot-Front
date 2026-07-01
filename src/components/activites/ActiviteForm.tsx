import { useState } from 'react';
import type { FormEvent } from 'react';
import type {
  ActiviteDto,
  CreerActiviteInput,
  EquipeClub,
  TypeActivite,
} from '../../api/activites';

export interface ActiviteFormValues {
  /** Vide = pas de date assignée (activité « sans date », cf. interface de planification). */
  date: string;
  heureConvocation: string;
  heureDebut: string;
  label: string;
  type: TypeActivite;
  commentaire?: string;
  lieu?: string;
  equipe?: EquipeClub | '';
}

interface Props {
  /** `undefined` = mode création. */
  activite?: ActiviteDto;
  onSubmit: (values: CreerActiviteInput) => void;
  onCancel: () => void;
}

function valeursInitiales(activite?: ActiviteDto): ActiviteFormValues {
  if (activite) {
    return {
      date: activite.date ?? '',
      heureConvocation: activite.heureConvocation,
      heureDebut: activite.heureDebut,
      label: activite.label,
      type: activite.type,
      commentaire: activite.commentaire ?? '',
      lieu: activite.lieu ?? '',
      equipe: activite.equipe ?? '',
    };
  }
  return {
    date: '',
    // Valeurs par défaut en création uniquement : la grande majorité des matchs/entraînements
    // du club ont lieu en soirée à ces horaires (cf. spec
    // sur-la-page-dtail-dune-cration-dactivit-mettre-par-dfaut-heu).
    heureConvocation: '20:00',
    heureDebut: '21:00',
    label: '',
    type: 'match' as TypeActivite,
    commentaire: '',
    lieu: '',
    equipe: '',
  };
}

/** Formulaire contrôlé création/édition d'activité. Ne fait aucun appel réseau. */
export function ActiviteForm({ activite, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<ActiviteFormValues>(() => valeursInitiales(activite));
  const [erreur, setErreur] = useState<string | null>(null);

  function handleChange<K extends keyof ActiviteFormValues>(champ: K, valeur: ActiviteFormValues[K]) {
    setValues((prev) => ({ ...prev, [champ]: valeur }));
  }

  function valider(): string | null {
    if (!values.heureConvocation) return "L'heure de convocation est obligatoire.";
    if (!values.heureDebut) return "L'heure de début est obligatoire.";
    if (!values.label) return 'Le label est obligatoire.';
    if (values.heureDebut < values.heureConvocation) {
      return "L'heure de début doit être postérieure ou égale à l'heure de convocation.";
    }
    return null;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const messageErreur = valider();
    if (messageErreur) {
      setErreur(messageErreur);
      return;
    }
    setErreur(null);
    const payload: CreerActiviteInput = {
      ...values,
      date: values.date || undefined,
      commentaire: values.commentaire || undefined,
      lieu: values.lieu || undefined,
      equipe: values.equipe || undefined,
    };
    onSubmit(payload);
  }

  return (
    <form className="activite-form" onSubmit={handleSubmit}>
      <div className="activite-form__field">
        <label htmlFor="activite-date">Date (optionnelle)</label>
        <input
          id="activite-date"
          type="date"
          value={values.date}
          onChange={(event) => handleChange('date', event.target.value)}
        />
        <p className="activite-form__hint">
          Laisser vide pour une activité sans date encore connue (assignable plus tard via la
          planification).
        </p>
      </div>

      <div className="activite-form__field">
        <label htmlFor="activite-heure-convocation">Heure de convocation</label>
        <input
          id="activite-heure-convocation"
          type="time"
          value={values.heureConvocation}
          onChange={(event) => handleChange('heureConvocation', event.target.value)}
        />
      </div>

      <div className="activite-form__field">
        <label htmlFor="activite-heure-debut">Heure de début</label>
        <input
          id="activite-heure-debut"
          type="time"
          value={values.heureDebut}
          onChange={(event) => handleChange('heureDebut', event.target.value)}
        />
      </div>

      <div className="activite-form__field">
        <label htmlFor="activite-label">Label</label>
        <input
          id="activite-label"
          type="text"
          value={values.label}
          onChange={(event) => handleChange('label', event.target.value)}
        />
      </div>

      <div className="activite-form__field">
        <label htmlFor="activite-type">Type</label>
        <select
          id="activite-type"
          value={values.type}
          onChange={(event) => handleChange('type', event.target.value as TypeActivite)}
        >
          <option value="match">Match</option>
          <option value="autre">Autre</option>
        </select>
      </div>

      <div className="activite-form__field">
        <label htmlFor="activite-equipe">Équipe</label>
        <select
          id="activite-equipe"
          value={values.equipe ?? ''}
          onChange={(event) =>
            handleChange('equipe', event.target.value as EquipeClub | '')
          }
        >
          <option value="">Non renseignée</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="Vet">Vét</option>
        </select>
      </div>

      <div className="activite-form__field">
        <label htmlFor="activite-lieu">Lieu</label>
        <input
          id="activite-lieu"
          type="text"
          value={values.lieu ?? ''}
          onChange={(event) => handleChange('lieu', event.target.value)}
        />
      </div>

      <div className="activite-form__field">
        <label htmlFor="activite-commentaire">Commentaire</label>
        <textarea
          id="activite-commentaire"
          value={values.commentaire ?? ''}
          onChange={(event) => handleChange('commentaire', event.target.value)}
        />
      </div>

      {erreur && <p className="activite-form__erreur">{erreur}</p>}

      <div className="activite-form__actions">
        <button type="button" onClick={onCancel}>
          Annuler
        </button>
        <button type="submit">{activite ? 'Enregistrer' : 'Créer'}</button>
      </div>
    </form>
  );
}
