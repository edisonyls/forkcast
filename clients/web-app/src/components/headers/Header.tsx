"use client";

import { usePathname } from "next/navigation";
import HeaderHome from "./HeaderHome";
import HeaderUser from "./HeaderUser";
import HeaderAuth from "./HeaderAuth";

export default function Header() {
  const pathname = usePathname();

  // Show HeaderAuth for signin and signup pages
  if (pathname === "/chef/signin" || pathname === "/chef/signup") {
    return <HeaderAuth />;
  }

  // Show HeaderHome only on the root path
  if (pathname === "/") {
    return <HeaderHome />;
  }

  // Show HeaderUser for all other pages
  return <HeaderUser />;
}
