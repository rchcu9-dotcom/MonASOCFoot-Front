import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useModifierMonProfil } from '../hooks/useModifierMonProfil';

interface ProfilFormValues {
  dateNaissance: string;
  numeroLicence: string;
}

function valeursInitiales(user: { dateNaissance?: string; numeroLicence?: string }): ProfilFormValues {
  return {
    dateNaissance: user.dateNaissance ?? '',
    numeroLicence: user.numeroLicence ?? '',
  };
}

/** Page self-service : chaque utilisateur connecté renseigne sa propre date de naissance et son numéro de licence. */
export function ProfilPage() {
  const { user } = useAuth();
  const modifierProfil = useModifierMonProfil();

  // `user` est garanti non-null ici : la route est protégée par `RequireAuthRoute`.
  const [values, setValues] = useState<ProfilFormValues>(() => valeursInitiales(user!));
  const [erreur, setErreur] = useState<string | null>(null);

  function handleChange<K extends keyof ProfilFormValues>(champ: K, valeur: ProfilFormValues[K]) {
    setValues((prev) => ({ ...prev, [champ]: valeur }));
  }

  function valider(): string | null {
    const aujourdHui = new Date().toISOString().slice(0, 10);
    if (values.dateNaissance && values.dateNaissance > aujourdHui) {
      return 'La date de naissance ne peut pas être dans le futur.';
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
    modifierProfil.mutate(
      {
        dateNaissance: values.dateNaissance || undefined,
        numeroLicence: values.numeroLicence || undefined,
      },
      { onError: (err) => setErreur(err.message) },
    );
  }

  return (
    <div className="page page--profil">
      <h1>Mon profil</h1>

      {erreur && <p className="page__erreur">{erreur}</p>}
      {modifierProfil.isSuccess && !erreur && <p>Profil mis à jour.</p>}

      <form className="profil-form" onSubmit={handleSubmit}>
        <div className="profil-form__field">
          <label htmlFor="profil-date-naissance">Date de naissance</label>
          <input
            id="profil-date-naissance"
            type="date"
            value={values.dateNaissance}
            onChange={(event) => handleChange('dateNaissance', event.target.value)}
          />
        </div>

        <div className="profil-form__field">
          <label htmlFor="profil-numero-licence">Numéro de licence</label>
          <input
            id="profil-numero-licence"
            type="text"
            value={values.numeroLicence}
            onChange={(event) => handleChange('numeroLicence', event.target.value)}
          />
        </div>

        <button type="submit" disabled={modifierProfil.isPending}>
          Enregistrer
        </button>
      </form>
    </div>
  );
}
