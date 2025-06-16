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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
            <svg
              className="w-6 h-6 text-orange-600"
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
          <h2 className="text-lg font-bold text-gray-800">Switch Chef?</h2>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 leading-relaxed mb-3">
            You currently have{" "}
            <span className="font-semibold text-gray-800">
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </span>{" "}
            from{" "}
            <span className="font-semibold text-orange-600">{currentChef}</span>{" "}
            in your cart.
          </p>
          <p className="text-gray-600 leading-relaxed mb-3">
            To view{" "}
            <span className="font-semibold text-orange-600">{newChef}</span>'s
            menu, we'll need to clear your current cart since orders can only
            contain items from one chef.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0"
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
              <p className="text-amber-800 text-sm">
                <span className="font-medium">Warning:</span> Your current cart
                items will be permanently removed.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Keep Current Cart
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-orange-600 text-white rounded-md font-medium hover:bg-orange-700 transition-colors"
          >
            Clear Cart & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
