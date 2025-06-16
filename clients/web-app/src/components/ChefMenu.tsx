"use client";

import { useState } from "react";
import Image from "next/image";
import CustomizationModal from "./CustomisationModal";

interface Chef {
  id: string | number;
  name: string;
  image: string;
  rating: number;
}

interface Category {
  id: string | number;
  name: string;
}

interface MenuItem {
  id: string | number;
  name: string;
  image: string;
  description: string;
  rating: number;
  preparationTime: number;
  categoryId: string | number;
  chefId: string | number;
  customizableOptions: any[]; // You may want to import the CustomizationOption interface from CustomisationModal
}

interface ChefMenuProps {
  chef: Chef;
  categories: Category[];
  menuItems: MenuItem[];
}

export default function ChefMenu({
  chef,
  categories,
  menuItems,
}: ChefMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState(
    categories.length > 0 ? categories[0].id : null
  );
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredItems = selectedCategory
    ? menuItems.filter(
        (item: MenuItem) =>
          item.categoryId === selectedCategory && item.chefId === chef.id
      )
    : [];

  // If no categories are available, show a message
  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          This chef hasn't added any menu categories yet.
        </p>
        <p className="text-gray-400 text-sm mt-2">Please check back later!</p>
      </div>
    );
  }

  return (
    <>
      {/* Left Side - Categories */}
      <div className="w-full md:w-1/4">
        <div className="sticky top-4">
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <Image
              src={chef.image}
              alt={chef.name}
              width={200}
              height={200}
              className="rounded-full mx-auto mb-4"
            />
            <h2 className="text-xl font-bold text-center">{chef.name}</h2>
            <div className="flex justify-center items-center">
              <span className="text-yellow-500">★</span>
              <span className="ml-1">{chef.rating}</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-bold mb-4">Menu Categories</h3>
            <ul className="space-y-2">
              {categories.map((category: Category) => (
                <li key={category.id}>
                  <button
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedCategory === category.id
                        ? "bg-orange-100 text-orange-700"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side - Menu Items */}
      <div className="w-full md:w-3/4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No menu items in this category yet.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              The chef is still building their menu!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item: MenuItem) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md overflow-hidden h-[420px] flex flex-col"
              >
                <div className="relative h-48 w-full flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold flex-1 mr-2 line-clamp-2 leading-tight">
                      {item.name}
                    </h3>
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm flex-shrink-0">
                      {item.preparationTime} mins
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-3 overflow-hidden">
                    {item.description}
                  </p>
                  <div className="flex justify-center items-center mb-4 mt-auto">
                    <div className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1">{item.rating}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setIsModalOpen(true);
                    }}
                    className="w-full bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 transition-colors"
                  >
                    Add to Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customization Modal */}
      {selectedItem && (
        <CustomizationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          item={{
            ...selectedItem,
            chefId: chef.id,
            chefName: chef.name,
          }}
        />
      )}
    </>
  );
}
