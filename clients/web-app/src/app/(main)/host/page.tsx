import Hero from "@/components/Hero";
import Features from "@/components/Features";
import DataSecurity from "@/components/DataSecurity";
import HowItWorksHost from "@/components/HowItWorksHost";
import ProblemSolution from "@/components/ProblemSolution";
import HostFAQ from "@/components/HostFAQ";

export default function HostHomePage() {
  return (
    <>
      <Hero />
      <Features />
      <DataSecurity />
      <HowItWorksHost />
      <ProblemSolution />
      <HostFAQ />
    </>
  );
}
