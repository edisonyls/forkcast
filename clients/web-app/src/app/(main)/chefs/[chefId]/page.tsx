import ChefMenu from "@/components/ChefMenu";
import { mockChefs, mockCategories, mockMenuItems } from "@/lib/mockData";

export default function ChefPage({ params }: { params: { chefId: string } }) {
  const chef = mockChefs.find((c) => c.id.toString() === params.chefId);
  if (!chef) return <div>Chef not found</div>;

  // Filter categories to only show those that have menu items for this chef
  const chefMenuItems = mockMenuItems.filter((item) => item.chefId === chef.id);
  const availableCategories = mockCategories.filter((category) =>
    chefMenuItems.some((item) => item.categoryId === category.id)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <ChefMenu
          chef={chef}
          categories={availableCategories}
          menuItems={mockMenuItems}
        />
      </div>
    </div>
  );
}
