"use client";

interface ChefSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentChef: string;
  newChef: string;
  itemCount: number;
}

export default function ChefSwitchModal({
  isOpen,
  onClose,
  onConfirm,
  currentChef,
  newChef,
  itemCount,
}: ChefSwitchModalProps) {
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
        aria-labelledby="chef-switch-title"
      >
        <div className="fc-dialog-header">
          <div>
            <p className="fc-eyebrow">One host per order</p>
            <h2 id="chef-switch-title" className="fc-dialog-title">
              Switch to {newChef}?
            </h2>
          </div>
        </div>

        <div className="fc-dialog-body">
          <p className="mt-0 mb-4 text-sm leading-relaxed text-text-muted">
            Your cart holds{" "}
            <strong className="font-semibold text-ink">
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </strong>{" "}
            from <span className="font-semibold text-ink">{currentChef}</span>.
            An order can only go to one host, so opening {newChef}&rsquo;s menu
            empties it.
          </p>
          <p className="fc-feedback fc-feedback-warning m-0 text-sm">
            Those items are removed for good &mdash; there&rsquo;s no undo.
          </p>
        </div>

        <div className="fc-dialog-footer">
          <button onClick={onClose} className="fc-button fc-button-secondary">
            Keep current cart
          </button>
          <button
            onClick={handleConfirm}
            className="fc-button fc-button-primary"
          >
            Clear cart &amp; continue
          </button>
        </div>
      </div>
    </div>
  );
}
