import type { ActiviteDto, TypeActivite } from '../../api/activites';
import { CategorieActivite } from '../disponibilites/CategorieActivite';

interface Props {
  activite: ActiviteDto;
  onEdit: (activite: ActiviteDto) => void;
  onDelete: (id: string) => void;
}

const LABEL_TYPE: Record<TypeActivite, string> = {
  match: 'Match',
  autre: 'Autre',
};

const MUTED_BADGE_STYLE = { backgroundColor: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8' };

/** Pastille neutre réutilisant le style `.statut-badge` en mode muted, pour les badges informatifs. */
function BadgeInfo({ children }: { children: React.ReactNode }) {
  return (
    <span className="statut-badge" style={MUTED_BADGE_STYLE}>
      {children}
    </span>
  );
}

/** Carte horizontale pleine largeur d'une activité : label dominant + badges + commentaire + actions admin. */
export function ActiviteAdminCarte({ activite, onEdit, onDelete }: Props) {
  return (
    <div className="activite-admin-carte">
      <div className="activite-admin-carte__entete">
        <span className="activite-admin-carte__label">{activite.label}</span>
        <div className="activite-admin-carte__actions">
          <button type="button" onClick={() => onEdit(activite)}>
            Modifier
          </button>
          <button type="button" onClick={() => onDelete(activite.id)}>
            Supprimer
          </button>
        </div>
      </div>

      <div className="activite-admin-carte__badges">
        <BadgeInfo>{activite.date ?? 'Sans date'}</BadgeInfo>
        <CategorieActivite equipe={activite.equipe} />
        <BadgeInfo>{LABEL_TYPE[activite.type]}</BadgeInfo>
        <BadgeInfo>
          {activite.heureConvocation} → {activite.heureDebut}
        </BadgeInfo>
        {activite.lieu && <BadgeInfo>{activite.lieu}</BadgeInfo>}
      </div>

      {activite.commentaire && (
        <p className="activite-admin-carte__commentaire">{activite.commentaire}</p>
      )}
    </div>
  );
}
