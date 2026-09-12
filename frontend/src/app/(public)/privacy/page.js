export const metadata = {
  title: "Privacy Policy — MedCore",
  description:
    "MedCore privacy policy — how we collect, use, and protect your information.",
};

const SECTIONS = [
  {
    title: "1. Information we collect",
    body: [
      "We collect information you provide directly, such as your name, email address, phone number, and any details you enter into forms on our website or platform.",
      "When you use the MedCore platform as a patient or hospital staff member, your hospital controls the patient data stored in your account. MedCore acts as a data processor on behalf of the hospital.",
    ],
  },
  {
    title: "2. How we use your information",
    body: [
      "We use your information to provide, maintain, and improve MedCore services; to communicate with you about your account; and to ensure the security and integrity of our platform.",
      "We do not sell your personal information to third parties. We do not use patient data for advertising or analytics.",
    ],
  },
  {
    title: "3. Data isolation and multi-tenancy",
    body: [
      "MedCore is a multi-tenant platform. Each hospital operates in a logically isolated environment. Data belonging to one hospital is never visible to another hospital, tenant, or user.",
      "Tenant isolation is enforced at the database, API, and application layers.",
    ],
  },
  {
    title: "4. Security",
    body: [
      "We implement industry-standard security measures including encryption in transit (TLS) and at rest (AES-256), role-based access controls, and full audit logging.",
      "No system is completely secure. If you become aware of any security concern, please report it to security@medcore.health.",
    ],
  },
  {
    title: "5. Your rights",
    body: [
      "You have the right to access, correct, or delete your personal information. If your data is managed by a hospital on MedCore, please contact that hospital directly.",
      "You may also contact us at privacy@medcore.health to exercise your rights.",
    ],
  },
  {
    title: "6. Data retention",
    body: [
      "We retain your account information for as long as your account is active. Medical records are retained according to the retention policies of the respective hospital and applicable law.",
    ],
  },
  {
    title: "7. Changes to this policy",
    body: [
      "We may update this privacy policy from time to time. We will notify you of material changes by email or by posting a prominent notice on our website.",
    ],
  },
  {
    title: "8. Contact us",
    body: [
      "If you have questions about this policy, please contact us at privacy@medcore.health or write to us at our registered office in Bengaluru, India.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      {/* Header */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Legal
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-5 text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-IN", {
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
            MedCore is committed to protecting your privacy. This policy
            explains what information we collect, how we use it, and the
            choices you have.
          </p>
        </div>
      </section>

      {/* Content */}
      <section>
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="space-y-10">
            {SECTIONS.map((section) => (
              <div key={section.title}>
                <h2 className="text-lg font-semibold tracking-tight">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-3">
                  {section.body.map((p, i) => (
                    <p
                      key={i}
                      className="text-sm leading-7 text-muted-foreground"
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 rounded-2xl border border-border bg-muted/30 p-6">
            <p className="text-sm font-semibold">Need to reach us?</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Questions about this policy? Email us at{" "}
              <a
                href="mailto:privacy@medcore.health"
                className="text-brand hover:underline"
              >
                privacy@medcore.health
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}