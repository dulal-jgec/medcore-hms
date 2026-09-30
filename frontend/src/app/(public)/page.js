import { HeroSection } from "@/components/public/hero/hero-section";
import { HospitalDirectory } from "@/components/public/hospital-directory";
import { PlatformFeatures } from "@/components/public/platform-features";
import { HowItWorks } from "@/components/public/how-it-works";
import { RoleOverview } from "@/components/public/role-overview";
import { SecuritySection } from "@/components/public/security-section";
import { FinalCta } from "@/components/public/final-cta";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HospitalDirectory />
      <PlatformFeatures />
      <HowItWorks />
      <RoleOverview />
      <SecuritySection />
      <FinalCta />
    </>
  );
}