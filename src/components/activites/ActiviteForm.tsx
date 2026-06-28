import { useState } from 'react';
import type { FormEvent } from 'react';
import type { ActiviteDto, CreerActiviteInput, TypeActivite } from '../../api/activites';

export interface ActiviteFormValues {
  date: string;
  heureConvocation: string;
  heureDebut: string;
  label: string;
  type: TypeActivite;
  commentaire?: string;
}

interface Props {
  /** `undefined` = mode création. */
  activite?: ActiviteDto;
  onSubmit: (values: ActiviteFormValues) => void;
  onCancel: () => void;
}

function valeursInitiales(activite?: ActiviteDto): ActiviteFormValues {
  if (activite) {
    return {
      date: activite.date,
      heureConvocation: activite.heureConvocation,
      heureDebut: activite.heureDebut,
      label: activite.label,
      type: activite.type,
      commentaire: activite.commentaire ?? '',
    };
  }
  return {
    date: '',
    heureConvocation: '',
    heureDebut: '',
    label: '',
    type: 'match' as TypeActivite,
    commentaire: '',
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
    if (!values.date) return 'La date est obligatoire.';
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
      commentaire: values.commentaire || undefined,
    };
    onSubmit(payload);
  }

  return (
    <form className="activite-form" onSubmit={handleSubmit}>
      <div className="activite-form__field">
        <label htmlFor="activite-date">Date</label>
        <input
          id="activite-date"
          type="date"
          value={values.date}
          onChange={(event) => handleChange('date', event.target.value)}
        />
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
