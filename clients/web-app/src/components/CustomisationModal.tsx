"use client";

import { useState } from "react";
import Image from "next/image";

interface CustomizationOption {
  id: string | number;
  name: string;
  price: number;
}

interface MenuItem {
  name: string;
  image: string;
  description: string;
  price: number;
  customizableOptions: CustomizationOption[];
}

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem;
}

export default function CustomizationModal({
  isOpen,
  onClose,
  item,
}: CustomizationModalProps) {
  const [selectedOptions, setSelectedOptions] = useState<(string | number)[]>(
    []
  );

  const toggleOption = (option: CustomizationOption) => {
    setSelectedOptions((prev) =>
      prev.includes(option.id)
        ? prev.filter((id) => id !== option.id)
        : [...prev, option.id]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold">Customize {item.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <div className="relative h-40 w-full">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <p className="mt-2 text-gray-600">{item.description}</p>
            </div>

            <div className="md:w-2/3">
              <h3 className="font-bold mb-3">Customization Options</h3>
              <div className="space-y-3">
                {item.customizableOptions.map((option: CustomizationOption) => (
                  <div
                    key={option.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedOptions.includes(option.id)}
                        onChange={() => toggleOption(option)}
                        className="h-4 w-4 text-orange-600 rounded"
                      />
                      <span>{option.name}</span>
                    </label>
                    {option.price > 0 && (
                      <span className="text-sm text-gray-600">
                        +${option.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t">
                <button className="w-full bg-orange-600 text-white py-3 rounded-md hover:bg-orange-700 transition-colors">
                  Add to Order - ${item.price.toFixed(2)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
