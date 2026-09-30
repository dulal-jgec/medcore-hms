import { LegalPageLayout, Section, BulletList } from "@/components/public/legal-page-layout";

export const metadata = {
  title: "Terms of Service | MedCore",
  description:
    "Terms governing access to and use of the MedCore hospital management platform.",
};

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service" updated="September 2025">
      <p>
        These terms govern your use of the MedCore platform. By accessing or
        using MedCore, you agree to be bound by them. If you are using MedCore
        on behalf of a hospital or clinic, you represent that you have
        authority to accept these terms for that organization.
      </p>

      <Section title="1. Accounts">
        <BulletList
          items={[
            "Accounts are issued by hospital administrators. You may not create accounts on behalf of a hospital without authorization.",
            "You are responsible for keeping your credentials confidential.",
            "You must notify us immediately of any unauthorized use of your account.",
            "We may suspend accounts that violate these terms or pose a security risk.",
          ]}
        />
      </Section>

      <Section title="2. Acceptable use">
        <p>You agree not to:</p>
        <BulletList
          items={[
            "Access data belonging to users of another hospital.",
            "Attempt to reverse-engineer, decompile, or extract source code from the platform.",
            "Use automated tools to scrape, crawl, or overload the service.",
            "Upload malware, or attempt to disrupt the platform's operation.",
            "Use the platform to send unsolicited communications.",
            "Misrepresent your role, identity, or affiliation.",
          ]}
        />
      </Section>

      <Section title="3. Medical disclaimer">
        <p>
          MedCore is a software platform. It does not provide medical advice,
          diagnose conditions, or prescribe treatment. Clinical decisions are
          made by licensed healthcare professionals. In an emergency, contact
          emergency services directly.
        </p>
      </Section>

      <Section title="4. Your content">
        <p>
          You retain ownership of information you submit. By submitting it, you
          grant MedCore a limited license to store, process, and transmit it
          solely to operate the platform on behalf of your hospital.
        </p>
      </Section>

      <Section title="5. Our content">
        <p>
          The MedCore name, logo, interface, and underlying code are owned by
          MedCore and protected by intellectual property laws. These terms do
          not grant you any right to use our brand or code except as expressly
          permitted.
        </p>
      </Section>

      <Section title="6. Availability">
        <p>
          We aim for high availability but do not guarantee uninterrupted
          service. Scheduled maintenance will be announced in advance when
          practical. Emergency maintenance may occur without notice.
        </p>
      </Section>

      <Section title="7. Fees">
        <p>
          Hospital subscriptions are governed by a separate agreement between
          MedCore and the hospital. Patient, doctor, and staff access is
          provided as part of that subscription — there are no user-facing
          fees on the platform.
        </p>
      </Section>

      <Section title="8. Termination">
        <p>
          You may stop using the platform at any time. Your hospital
          administrator may revoke your access. We may suspend or terminate
          accounts that violate these terms or that we are legally required to
          disable.
        </p>
      </Section>

      <Section title="9. Limitation of liability">
        <p>
          To the maximum extent permitted by law, MedCore is not liable for
          indirect, incidental, or consequential damages arising from use of
          the platform. Our total liability for any claim is limited to the
          amount paid by your hospital for the service in the preceding twelve
          months.
        </p>
      </Section>

      <Section title="10. Governing law">
        <p>
          These terms are governed by the laws of India. Disputes will be
          resolved in the courts of West Bengal.
        </p>
      </Section>

      <Section title="11. Changes">
        <p>
          We may update these terms. Material changes will be posted on this
          page with an updated date. Continued use after changes constitutes
          acceptance.
        </p>
      </Section>

      <Section title="12. Contact">
        <p>
          For questions about these terms, contact{" "}
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