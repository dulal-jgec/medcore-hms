import { HeroSection } from "@/components/public/hero/hero-section";
import { HospitalDirectory } from "@/components/public/hospital-directory";
import { PlatformFeatures } from "@/components/public/platform-features";
import { RoleOverview } from "@/components/public/role-overview";
import { HowItWorks } from "@/components/public/how-it-works";
import { SecuritySection } from "@/components/public/security-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HospitalDirectory />
      <PlatformFeatures />
      <RoleOverview />
      <HowItWorks />
      <SecuritySection />
    </>
  );
}