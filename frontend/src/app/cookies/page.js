import { LegalPageLayout, Section, BulletList } from "@/components/public/legal-page-layout";

export const metadata = {
  title: "Cookie Policy | MedCore",
  description:
    "How MedCore uses cookies and similar technologies to keep sessions secure and the platform reliable.",
};

export default function CookiesPage() {
  return (
    <LegalPageLayout title="Cookie Policy" updated="September 2025">
      <p>
        MedCore uses cookies and similar storage technologies to keep you
        signed in, protect your session, and understand how the platform is
        used. This page explains what we set and why.
      </p>

      <Section title="What cookies we use">
        <BulletList
          items={[
            "Session cookies — required to keep you signed in between page loads. These are httpOnly and expire when your session ends.",
            "Refresh token cookie — httpOnly, sent only to authentication endpoints, rotated on every use.",
            "Preference storage — remembers your theme (light/dark) and dismissed banners. Stored in localStorage.",
            "Security cookies — protect against cross-site request forgery and detect suspicious login patterns.",
          ]}
        />
      </Section>

      <Section title="What we do not use">
        <p>
          MedCore does not use advertising cookies, does not embed third-party
          trackers, and does not sell or share your activity with advertising
          networks.
        </p>
      </Section>

      <Section title="Managing cookies">
        <p>
          You can clear or block cookies through your browser settings.
          Blocking session cookies will prevent you from staying signed in,
          and blocking the refresh cookie will end your session when the
          access token expires.
        </p>
      </Section>

      <Section title="Third-party cookies">
        <p>
          We do not set third-party cookies on your device. Cloudinary, our
          image hosting partner, may set a cookie when you upload or view
          profile images. Their handling of that cookie is governed by their
          own privacy policy.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          We may update this policy when our use of cookies changes. The
          updated date at the top of this page will reflect the most recent
          revision.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about this policy? Reach us at{" "}
          <a
            href="mailto:skdulalislam1@gmail.com"
            className="font-medium text-brand hover:underline"
          >
            skdulalislam1@gmail.com
          </a>{" "}
          or +91 73648 21623.
        </p>
      </Section>
    </LegalPageLayout>
  );
}