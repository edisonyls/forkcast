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
  const imageSrc =
    chef.image &&
    !chef.image.startsWith("http") &&
    !chef.image.startsWith("data:") &&
    !chef.image.startsWith("/user.png")
      ? `${process.env.NEXT_PUBLIC_API_URL}${chef.image}`
      : chef.image || "/user.png";

  return (
    <Link href={`/chefs/${chef.id}`} className="fc-card fc-card-link h-full">
      <div className="flex items-start gap-4">
        <span className="fc-avatar h-16 w-16">
          <Image src={imageSrc} alt="" width={64} height={64} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-lg font-semibold tracking-[-0.02em] text-ink">
            {chef.name}
          </span>
          <span className="fc-badge fc-badge-brand mt-2">
            &#9733; {chef.rating}
          </span>
        </span>
      </div>

      <p className="mt-4 mb-0 line-clamp-3 text-sm leading-relaxed text-text-muted">
        {chef.bio}
      </p>
    </Link>
  );
}
