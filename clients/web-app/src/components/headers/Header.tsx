"use client";

import { usePathname } from "next/navigation";
import HeaderHome from "./HeaderHome";
import HeaderUser from "./HeaderUser";

export default function Header() {
  const pathname = usePathname();

  // Show HeaderHome only on the root path
  if (pathname === "/") {
    return <HeaderHome />;
  }

  // Show HeaderDefault for all other pages
  return <HeaderUser />;
}
