import Link from "next/link";
import Image from "next/image";

interface Chef {
  id: string | number;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  bio: string;
}

interface ChefCardProps {
  chef: Chef;
}

export default function ChefCard({ chef }: ChefCardProps) {
  return (
    <Link href={`/chefs/${chef.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative h-48 w-full">
          <Image
            src={chef.image}
            alt={chef.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-semibold">{chef.name}</h2>
            <div className="flex items-center bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
              <span>★</span>
              <span className="ml-1">{chef.rating}</span>
            </div>
          </div>
          <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mb-2">
            {chef.cuisine}
          </span>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{chef.bio}</p>
        </div>
      </div>
    </Link>
  );
}
