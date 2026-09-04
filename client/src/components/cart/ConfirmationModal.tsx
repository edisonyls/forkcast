"use client";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fc-dialog-backdrop" role="presentation">
      <div
        className="fc-dialog max-w-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
      >
        <div className="fc-dialog-header">
          <div>
            <p className="fc-eyebrow">
              {isDestructive ? "Confirm removal" : "Confirm"}
            </p>
            <h2 id="confirmation-modal-title" className="fc-dialog-title">
              {title}
            </h2>
          </div>
        </div>

        <div className="fc-dialog-body">
          <p className="m-0 text-sm leading-relaxed text-text-muted">
            {message}
          </p>
        </div>

        <div className="fc-dialog-footer">
          <button onClick={onClose} className="fc-button fc-button-secondary">
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`fc-button ${
              isDestructive ? "fc-button-danger" : "fc-button-primary"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
