import { LegalPageLayout, Section, BulletList } from "@/components/public/legal-page-layout";

export const metadata = {
  title: "Security | MedCore",
  description:
    "How MedCore protects patient data with multi-tenant isolation, role-based access, encryption, and full audit trails.",
};

export default function SecurityPage() {
  return (
    <LegalPageLayout title="Security" updated="September 2025">
      <p>
        MedCore handles sensitive health information on behalf of hospitals.
        Security is not a feature of the platform — it is the foundation. This
        page explains the specific controls we use to protect your data.
      </p>

      <Section title="Multi-tenant isolation">
        <p>
          Every hospital operates in its own logically separated environment.
          Data access is scoped by tenant at the application layer, enforced on
          every request, and validated again at the database layer. A
          successful login to one hospital never grants access to data
          belonging to another.
        </p>
      </Section>

      <Section title="Role-based access control">
        <p>
          Permissions are assigned by role — patient, doctor, nurse,
          receptionist, hospital administrator, accountant. Every endpoint
          verifies the caller's role before returning data or performing an
          action. For example:
        </p>
        <BulletList
          items={[
            "Patients can only see their own appointments and records.",
            "Doctors can see records for their hospital only.",
            "Receptionists can register patients and book appointments, but cannot modify clinical data.",
            "Hospital administrators manage their own hospital's staff and settings.",
          ]}
        />
      </Section>

      <Section title="Encryption">
        <BulletList
          items={[
            "In transit: all traffic uses TLS 1.2 or higher. Plain HTTP is rejected.",
            "At rest: database and file storage are encrypted with AES-256.",
            "Secrets: encryption keys and service credentials are stored in a managed secrets vault, never in source code.",
          ]}
        />
      </Section>

      <Section title="Authentication">
        <BulletList
          items={[
            "Access tokens are short-lived and cryptographically signed.",
            "Refresh tokens are rotated on every use and revoked on logout.",
            "Passwords are hashed with a modern adaptive algorithm — never stored in plain text.",
            "Session anomalies trigger automatic logout.",
          ]}
        />
      </Section>

      <Section title="Audit trail">
        <p>
          Every action on the platform is logged with the acting user, the
          action performed, the timestamp, and the origin. Logs are
          append-only, retained for compliance, and available to hospital
          administrators on request.
        </p>
      </Section>

      <Section title="Infrastructure">
        <BulletList
          items={[
            "Hosted on isolated infrastructure per tenant where required.",
            "Regular automated backups with tested restore procedures.",
            "Continuous monitoring for unusual access patterns.",
            "Dependency scanning to catch vulnerable libraries before release.",
          ]}
        />
      </Section>

      <Section title="Compliance">
        <p>
          MedCore is designed to align with the following frameworks. Formal
          audits are conducted periodically.
        </p>
        <BulletList
          items={[
            "ABDM — Ayushman Bharat Digital Mission readiness.",
            "HIPAA-aligned administrative, physical, and technical safeguards.",
            "DPDP Act 2023 — India's Digital Personal Data Protection Act.",
            "SOC 2 practices for security, availability, and confidentiality.",
          ]}
        />
      </Section>

      <Section title="Reporting a vulnerability">
        <p>
          If you believe you have found a security issue, please contact us
          directly at{" "}
          <a
            href="mailto:skdulalislam1@gmail.com"
            className="font-medium text-brand hover:underline"
          >
            skdulalislam1@gmail.com
          </a>
          . We take all reports seriously and will respond within two business
          days. Please do not publicly disclose vulnerabilities before we have
          had a chance to investigate and address them.
        </p>
      </Section>
    </LegalPageLayout>
  );
}