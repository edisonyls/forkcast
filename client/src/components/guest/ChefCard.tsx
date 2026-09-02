import Link from "next/link";
import Image from "next/image";

interface Chef {
  id: string | number;
  name: string;
  image: string | null;
  rating: number;
  bio: string;
}

interface ChefCardProps {
  chef: Chef;
}

export default function ChefCard({ chef }: ChefCardProps) {
  return (
    <Link href={`/chefs/${chef.id}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-green-200 overflow-hidden group">
        <div className="p-4 text-center sm:p-6">
          {/* Round Chef Image */}
          <div className="relative mx-auto mb-4 w-24 h-24">
            <Image
              src={
                chef.image &&
                !chef.image.startsWith("http") &&
                !chef.image.startsWith("data:") &&
                !chef.image.startsWith("/user.png")
                  ? `${process.env.NEXT_PUBLIC_API_URL}${chef.image}`
                  : chef.image || "/user.png"
              }
              alt={chef.name}
              width={96}
              height={96}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-100 group-hover:ring-green-200 group-hover:scale-105 transition-all duration-300"
            />
          </div>

          {/* Chef Name */}
          <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-brand-ink transition-colors duration-300">
            {chef.name}
          </h2>

          {/* Rating Badge */}
          <div className="fc-badge fc-badge-brand mb-3">
            <svg
              className="w-4 h-4 mr-1 fill-current"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{chef.rating}</span>
          </div>

          {/* Chef Bio */}
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 px-2">
            {chef.bio}
          </p>
        </div>

        {/* Hover Effect Indicator */}
        <div className="h-1 bg-gradient-to-r from-green-400 to-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
      </div>
    </Link>
  );
}
