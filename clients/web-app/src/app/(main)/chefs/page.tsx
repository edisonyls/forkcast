import ChefCard from "@/components/ChefCard";
import Search from "@/components/Search";

// Mock data for chefs
const mockChefs = [
  {
    id: 1,
    name: "Chef Maria",
    cuisine: "Italian",
    bio: "Authentic Italian chef with 15 years of experience.",
    rating: 4.8,
    image: "/chef1.jpg",
  },
  {
    id: 2,
    name: "Chef Raj",
    cuisine: "Indian",
    bio: "Specializing in North Indian curries and tandoori dishes with family recipes.",
    rating: 4.9,
    image: "/chef2.jpg",
    dishesAvailable: 8,
  },
  {
    id: 3,
    name: "Chef Pierre",
    cuisine: "French",
    bio: "Classic French cuisine with a modern twist, trained in Paris.",
    rating: 4.7,
    image: "/chef3.jpg",
    dishesAvailable: 10,
  },
  {
    id: 4,
    name: "Chef Mei",
    cuisine: "Chinese",
    bio: "Sichuan cuisine expert bringing authentic spicy flavors to your table.",
    rating: 4.6,
    image: "/chef4.jpg",
    dishesAvailable: 15,
  },
];

export default function ChefsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Discover Local Chefs
      </h1>
      <div className="mb-8">
        <Search />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockChefs.map((chef) => (
          <ChefCard key={chef.id} chef={chef} />
        ))}
      </div>
    </div>
  );
}
