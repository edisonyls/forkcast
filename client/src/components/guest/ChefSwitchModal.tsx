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
    <div className="fc-dialog-backdrop bg-black/50" role="presentation">
      <div
        className="fc-dialog max-w-md rounded-lg bg-white p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chef-switch-title"
      >
        <div className="flex items-center mb-4">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft">
            <svg
              className="w-6 h-6 text-brand-ink"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
              />
            </svg>
          </div>
          <h2
            id="chef-switch-title"
            className="text-lg font-bold text-gray-800"
          >
            Switch Host?
          </h2>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 leading-relaxed mb-3">
            You currently have{" "}
            <span className="font-semibold text-gray-800">
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </span>{" "}
            from{" "}
            <span className="font-semibold text-brand-ink">{currentChef}</span>{" "}
            in your cart.
          </p>
          <p className="text-gray-600 leading-relaxed mb-3">
            To view{" "}
            <span className="font-semibold text-brand-ink">{newChef}</span>'s
            menu, we'll need to clear your current cart since orders can only
            contain items from one host.
          </p>
          <div className="fc-feedback fc-feedback-warning">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <p className="text-sm">
                <span className="font-medium">Warning:</span> Your current cart
                items will be permanently removed.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button onClick={onClose} className="fc-button fc-button-secondary">
            Keep Current Cart
          </button>
          <button
            onClick={handleConfirm}
            className="fc-button fc-button-primary"
          >
            Clear Cart & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
