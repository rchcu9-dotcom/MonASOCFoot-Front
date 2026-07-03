import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthContext';
import {
  modifierMonProfil,
  type ModifierProfilUtilisateurInput,
  type UtilisateurDto,
} from '../api/users';

/**
 * `user` (le profil affiché partout dans l'app) vit dans `AuthContext` sous forme de `useState`,
 * pas dans le cache TanStack Query : après succès, on rafraîchit via `refresh()` (`GET /auth/me`)
 * plutôt que via `queryClient.invalidateQueries`.
 */
export function useModifierMonProfil() {
  const { refresh } = useAuth();

  return useMutation<UtilisateurDto, Error, ModifierProfilUtilisateurInput>({
    mutationFn: modifierMonProfil,
    onSuccess: () => {
      void refresh();
    },
  });
}
