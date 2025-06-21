import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorksHost from "@/components/HowItWorksHost";
import ProblemSolution from "@/components/ProblemSolution";
import HostFAQ from "@/components/HostFAQ";

export default function HostHomePage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorksHost />
      <ProblemSolution />
      <HostFAQ />
    </>
  );
}
