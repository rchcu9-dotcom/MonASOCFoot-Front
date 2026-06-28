interface Props {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Dialogue de confirmation générique (suppression), réutilisable hors du domaine activités. */
export function ConfirmDeleteDialog({ message, onConfirm, onCancel }: Props) {
  return (
    <div className="confirm-dialog__overlay" role="presentation" onClick={onCancel}>
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <p>{message}</p>
        <div className="confirm-dialog__actions">
          <button type="button" onClick={onCancel}>
            Annuler
          </button>
          <button type="button" className="confirm-dialog__confirm" onClick={onConfirm}>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
