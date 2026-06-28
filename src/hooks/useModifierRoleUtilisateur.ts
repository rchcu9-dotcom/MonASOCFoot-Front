import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  modifierRoleUtilisateur,
  type RoleUtilisateur,
  type UtilisateurDto,
} from '../api/users';

interface ModifierRoleUtilisateurVariables {
  id: string;
  role: RoleUtilisateur;
}

export function useModifierRoleUtilisateur() {
  const queryClient = useQueryClient();

  return useMutation<UtilisateurDto, Error, ModifierRoleUtilisateurVariables>({
    mutationFn: ({ id, role }) => modifierRoleUtilisateur(id, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['utilisateurs'] });
    },
  });
}
