import { LegalPageLayout, Section, BulletList } from "@/components/public/legal-page-layout";

export const metadata = {
  title: "Privacy Policy | MedCore",
  description:
    "How MedCore collects, uses, and protects health data across hospitals, doctors, and patients.",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" updated="September 2025">
      <p>
        MedCore operates a multi-tenant hospital management platform on behalf
        of hospitals, clinics, and healthcare providers. This policy explains
        what information we collect, how we use it, and the controls available
        to you. It applies to every role on the platform — patients, doctors,
        nurses, receptionists, and administrators.
      </p>

      <Section title="1. Information we collect">
        <BulletList
          items={[
            "Account information: name, email address, phone number, and role assigned by your hospital.",
            "Health information: medical records, prescriptions, lab reports, appointment history, and vitals — supplied by your hospital's staff or uploaded by you.",
            "Usage data: device type, IP address, browser, and interaction logs used for security and auditing.",
            "Payment data: billing information handled by our payment partners; we do not store card numbers.",
          ]}
        />
      </Section>

      <Section title="2. How we use information">
        <BulletList
          items={[
            "Delivering care: enabling doctors, nurses, and receptionists to coordinate patient care.",
            "Operating the platform: authenticating users, routing requests, and enforcing role-based access.",
            "Security: detecting unauthorized access, preventing fraud, and maintaining an audit trail.",
            "Support: responding to your questions and resolving issues you report.",
            "Compliance: meeting legal, regulatory, and accreditation obligations.",
          ]}
        />
      </Section>

      <Section title="3. Sharing">
        <p>
          We never sell personal or health information. Data is shared only:
        </p>
        <BulletList
          items={[
            "Within your hospital: with the staff authorized by your hospital administrator.",
            "With your explicit consent: for example, when you request a second opinion.",
            "With service providers: hosting, email, and storage vendors bound by confidentiality agreements.",
            "When legally required: in response to valid court orders, subpoenas, or regulatory requests.",
          ]}
        />
      </Section>

      <Section title="4. Data isolation">
        <p>
          Each hospital operates in its own isolated environment. Patient data
          from one hospital is not visible to staff or systems of another
          hospital. Tenant separation is enforced at the application and
          database layers, not just in the user interface.
        </p>
      </Section>

      <Section title="5. Security">
        <p>
          All traffic is encrypted in transit with TLS. Data at rest is
          encrypted with AES-256. Access tokens are short-lived. Every action
          on the platform is logged with the acting user, timestamp, and origin
          for audit purposes.
        </p>
      </Section>

      <Section title="6. Your rights">
        <BulletList
          items={[
            "Access: request a copy of the personal information we hold about you.",
            "Correction: ask us or your hospital to correct inaccurate information.",
            "Deletion: request deletion of your account, subject to legal retention requirements.",
            "Restriction: ask us to limit certain uses of your data.",
            "Portability: receive your data in a structured, machine-readable format.",
          ]}
        />
      </Section>

      <Section title="7. Data retention">
        <p>
          Medical records are retained for the period required by applicable
          healthcare regulations in your jurisdiction. Account data is
          retained while your account is active and for a reasonable period
          after closure. When retention periods end, data is securely deleted
          or anonymized.
        </p>
      </Section>

      <Section title="8. Children's data">
        <p>
          Records for minors are created and managed by their parent or legal
          guardian through the hospital. Minors do not create their own
          accounts.
        </p>
      </Section>

      <Section title="9. Changes to this policy">
        <p>
          We may update this policy to reflect changes in our practices or the
          law. Material changes will be communicated through the platform.
        </p>
      </Section>

      <Section title="10. Contact">
        <p>
          For privacy questions, reach our team at{" "}
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