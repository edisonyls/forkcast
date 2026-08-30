import type { Metadata } from "next";
import HomeExperience from "@/components/HomeExperience";

export const metadata: Metadata = {
  title: "ForkCast | Know What They Want Before You Cook",
  description:
    "Share a menu, collect every guest's choices, and cook with a clear count instead of a guess.",
};

export default function HomePage() {
  return <HomeExperience />;
}
