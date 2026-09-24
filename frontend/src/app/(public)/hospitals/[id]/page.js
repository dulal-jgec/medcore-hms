import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Building2,
  ShieldCheck,
  Stethoscope,
  Phone,
  CalendarPlus,
  HeartPulse,
  Ambulance,
  Pill,
  FileText,
  BadgeCheck,
  Mail,
  Globe,
  ArrowRight,
  Sparkles,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import PublicImage from "@/components/public-hospital/shared/public-image";

import { getPublicHospital } from "@/services/hospital-public.service";
import { getPublicDepartments } from "@/services/public-department.service";
import { getPublicDoctors } from "@/services/public-doctor.service";
import { getPublicGallery } from "@/services/public-gallery.service";

import DepartmentCard from "@/components/public-hospital/departments/department-card";
import DoctorCard from "@/components/public-hospital/doctors/doctor-card";
import GalleryCard from "@/components/public-hospital/gallery/gallery-card";

const QUICK_ACTIONS = [
  {
    icon: CalendarPlus,
    label: "Find a Doctor",
    desc: "Browse specialists",
    href: "#doctors",
    accent: true,
  },
  {
    icon: HeartPulse,
    label: "Departments",
    desc: "Explore specialties",
    href: "#departments",
  },
  {
    icon: Pill,
    label: "Pharmacy",
    desc: "Medicines & refills",
    href: "#information",
  },
  {
    icon: FileText,
    label: "Lab Reports",
    desc: "Diagnostic services",
    href: "#information",
  },
  {
    icon: Sparkles,
    label: "Gallery",
    desc: "Inside the hospital",
    href: "#gallery",
  },
  {
    icon: Ambulance,
    label: "Emergency",
    desc: "24/7 response",
    href: "#emergency",
    accent: true,
  },
];

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const result = await getPublicHospital(id);
    const hospital = result.data;

    if (!hospital) return { title: "Hospital Not Found | MedCore" };

    return {
      title: `${hospital.name} | MedCore`,
      description:
        hospital.description ||
        `View departments, doctors and contact information for ${hospital.name}.`,
    };
  } catch {
    return { title: "Hospital | MedCore" };
  }
}

export default async function HospitalOverviewPage({ params }) {
  const { id } = await params;

  let hospital;

  try {
    const result = await getPublicHospital(id);
    hospital = result.data;
  } catch (error) {
    if (error?.status === 404) notFound();
    throw error;
  }

  if (!hospital) notFound();

  const [departmentsResult, doctorsResult, galleryResult] =
    await Promise.all([
      getPublicDepartments(id, {
        page: 0,
        size: 8,
        sortBy: "name",
        sortDir: "asc",
      }),
      getPublicDoctors(id, {
        page: 0,
        size: 6,
        sortBy: "id",
        sortDir: "asc",
      }),
      getPublicGallery(id, {
        page: 0,
        size: 6,
        sortBy: "displayOrder",
        sortDir: "asc",
      }),
    ]);

  const departments = departmentsResult.data?.content || [];
  const doctors = doctorsResult.data?.content || [];
  const gallery = galleryResult.data?.content || [];

  const emergencyPhone = hospital.emergencyPhone || hospital.phone;

  return (
    <>
      <Hero hospital={hospital} id={id} emergencyPhone={emergencyPhone} />

      <QuickActions />

      <Stats
        departments={departments.length}
        doctors={doctors.length}
        gallery={gallery.length}
      />

      <About hospital={hospital} id={id} />

      <DepartmentSection departments={departments} hospitalId={id} />

      <DoctorSection doctors={doctors} hospitalId={id} hospital={hospital} />

      <GallerySection gallery={gallery} hospitalId={id} hospital={hospital} />

      <ContactSection hospital={hospital} />

      <EmergencySection emergencyPhone={emergencyPhone} />

      <FinalCta hospital={hospital} id={id} />
    </>
  );
}

/* ══════════ HERO ══════════ */

function Hero({ hospital, id, emergencyPhone }) {
  const heroImage = hospital.bannerUrl || hospital.logoUrl;
  const usingBanner = Boolean(hospital.bannerUrl);

  return (
    <section className="relative">
      <div className="relative h-[620px] w-full overflow-hidden bg-primary sm:h-[680px] lg:h-[720px]">
        {heroImage ? (
          <>
            <PublicImage
              src={heroImage}
              alt={`${hospital.name} building`}
              fill
              priority
              sizes="100vw"
              className={`object-cover ${
                usingBanner ? "" : "scale-110 blur-3xl"
              }`}
            />

            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-primary/20"
            />
          </>
        ) : (
          <>
            <div className="h-full w-full bg-gradient-to-br from-primary via-primary to-primary/90" />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
                backgroundSize: "28px 28px",
              }}
            />
          </>
        )}

        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/15 px-3 py-1 text-xs font-semibold text-brand backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5" />
              MedCore Verified Hospital
            </span>

            <div className="mt-6 flex items-start gap-5">
              {hospital.logoUrl && usingBanner && (
                <div className="hidden h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur sm:block">
                  <PublicImage
                    src={hospital.logoUrl}
                    alt={hospital.name}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="min-w-0">
                <h1 className="max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {hospital.name}
                </h1>

                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/85">
                  {(hospital.city || hospital.state) && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {[hospital.city, hospital.state]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  )}

                  {hospital.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-4 w-4" />
                      {hospital.phone}
                    </span>
                  )}

                  <span className="flex items-center gap-1.5">
                    <BadgeCheck className="h-4 w-4 text-brand" />
                    Active
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-brand text-brand-foreground hover:bg-brand/90"
              >
                <Link href={`/hospitals/${id}/doctors`}>
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Find a Doctor
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
              >
                <Link href={`/hospitals/${id}/departments`}>
                  <HeartPulse className="mr-2 h-4 w-4" />
                  View Departments
                </Link>
              </Button>

              {emergencyPhone && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
                >
                  <a href={`tel:${emergencyPhone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call Hospital
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════ QUICK ACTIONS ══════════ */

function QuickActions() {
  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK_ACTIONS.map(({ icon: Icon, label, desc, href, accent }) => (
            <Link
              key={label}
              href={href}
              className={`group flex flex-col items-start gap-3 rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                accent
                  ? "border-brand/30 bg-brand-soft"
                  : "border-border bg-card hover:border-brand/40"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-105 ${
                  accent
                    ? "bg-brand text-brand-foreground"
                    : "bg-brand-soft text-brand-soft-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{label}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════ STATS ══════════ */

function Stats({ departments, doctors, gallery }) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <StatBlock
            icon={HeartPulse}
            value={departments}
            label="Departments"
          />
          <StatBlock icon={Stethoscope} value={doctors} label="Doctors" />
          <StatBlock
            icon={Sparkles}
            value={gallery}
            label="Gallery Photos"
          />
          <StatBlock
            icon={BadgeCheck}
            value="24/7"
            label="Emergency Care"
            accent
          />
        </div>
      </div>
    </section>
  );
}

function StatBlock({ icon: Icon, value, label, accent }) {
  return (
    <div className="flex items-center gap-4">
      <span
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
          accent
            ? "bg-highlight-soft text-highlight-soft-foreground"
            : "bg-brand-soft text-brand-soft-foreground"
        }`}
      >
        <Icon className="h-6 w-6" />
      </span>

      <div>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  );
}

/* ══════════ ABOUT ══════════ */

function About({ hospital, id }) {
  return (
    <section id="information" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-7">
            <Eyebrow>About the hospital</Eyebrow>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Trusted healthcare,{" "}
              <span className="text-brand">delivered with care.</span>
            </h2>

            <p className="mt-6 whitespace-pre-line text-base leading-8 text-muted-foreground lg:text-lg">
              {hospital.description ||
                `${hospital.name} is part of the MedCore network, providing comprehensive medical services with a focus on patient well-being, clinical excellence, and modern diagnostic facilities.`}
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={`/hospitals/${id}/doctors`}>
                  Meet our doctors
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button asChild size="lg" variant="outline">
                <Link href={`/hospitals/${id}/departments`}>
                  Explore departments
                </Link>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-border bg-card p-8">
              <h3 className="text-lg font-semibold tracking-tight">
                Hospital information
              </h3>

              <div className="mt-7 space-y-6">
                <InfoRow
                  icon={MapPin}
                  label="Address"
                  value={[
                    hospital.address,
                    hospital.city,
                    hospital.state,
                    hospital.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                />

                <InfoRow
                  icon={Phone}
                  label="Phone"
                  value={hospital.phone}
                />

                <InfoRow
                  icon={Ambulance}
                  label="Emergency"
                  value={hospital.emergencyPhone}
                />

                <InfoRow
                  icon={Mail}
                  label="Email"
                  value={hospital.email}
                />

                {hospital.website && (
                  <div className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
                      <Globe className="h-4 w-4" />
                    </span>

                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Website
                      </p>
                      <a
                        href={hospital.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block truncate text-sm font-medium text-brand hover:underline"
                      >
                        {hospital.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════ DEPARTMENTS ══════════ */

function DepartmentSection({ departments, hospitalId }) {
  return (
    <section id="departments" className="border-b border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeader
          eyebrow="Departments"
          title="Centres of care"
          description="Specialized medical departments staffed by experienced consultants and modern diagnostic equipment."
          href={`/hospitals/${hospitalId}/departments`}
          action="View all departments"
        />

        {departments.length === 0 ? (
          <EmptyState message="No departments are currently available." />
        ) : (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {departments.map((department) => (
              <DepartmentCard
                key={department.id}
                department={department}
                hospitalId={hospitalId}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ══════════ DOCTORS ══════════ */

function DoctorSection({ doctors, hospitalId, hospital }) {
  return (
    <section id="doctors" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeader
          eyebrow="Doctors"
          title="Meet our specialists"
          description={`Consult with experienced doctors currently practicing at ${hospital.name}.`}
          href={`/hospitals/${hospitalId}/doctors`}
          action="View all doctors"
        />

        {doctors.length === 0 ? (
          <EmptyState message="No doctors are currently available." />
        ) : (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                hospitalId={hospitalId}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ══════════ GALLERY ══════════ */

function GallerySection({ gallery, hospitalId, hospital }) {
  return (
    <section id="gallery" className="border-b border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeader
          eyebrow="Gallery"
          title="A look inside"
          description={`Photographs of the facilities, wards, and everyday environment at ${hospital.name}.`}
          href={`/hospitals/${hospitalId}/gallery`}
          action="View full gallery"
        />

        {gallery.length === 0 ? (
          <EmptyState message="No gallery images are currently available." />
        ) : (
          <div className="mt-14 grid auto-rows-[200px] grid-cols-2 gap-4 sm:grid-cols-3 lg:auto-rows-[220px]">
            {gallery.map((image, index) => (
              <GalleryCard
                key={image.id}
                image={image}
                size={
                  index === 0
                    ? "featured"
                    : index === 1
                    ? "tall"
                    : "small"
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ══════════ CONTACT ══════════ */

function ContactSection({ hospital }) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow centered>Contact</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Contact & location
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Reach out or visit the hospital using the information below.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard
            icon={MapPin}
            title="Address"
            value={[
              hospital.address,
              hospital.city,
              hospital.state,
              hospital.pincode,
            ]
              .filter(Boolean)
              .join(", ")}
          />
          <InfoCard icon={Phone} title="Phone" value={hospital.phone} />
          <InfoCard icon={Mail} title="Email" value={hospital.email} />
          <InfoCard
            icon={Clock}
            title="Emergency"
            value={hospital.emergencyPhone || "Not provided"}
          />
        </div>
      </div>
    </section>
  );
}

/* ══════════ EMERGENCY ══════════ */

function EmergencySection({ emergencyPhone }) {
  return (
    <section id="emergency" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl border border-destructive/20 bg-destructive/5 p-8 sm:flex-row sm:items-center lg:p-10">
          <div className="flex items-start gap-5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-destructive text-destructive-foreground">
              <Ambulance className="h-7 w-7" />
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-destructive">
                24/7 Emergency
              </p>
              <h3 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
                Need immediate medical assistance?
              </h3>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Our emergency team is available around the clock. Call now for
                immediate response.
              </p>
            </div>
          </div>

          {emergencyPhone && (
            <Button
              asChild
              size="lg"
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-auto"
            >
              <a href={`tel:${emergencyPhone}`}>
                <Phone className="mr-2 h-4 w-4" />
                {emergencyPhone}
              </a>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

/* ══════════ FINAL CTA ══════════ */

function FinalCta({ hospital, id }) {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-10 sm:p-14 lg:p-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h3 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                Explore {hospital.name}
              </h3>
              <p className="mt-4 text-base leading-7 text-primary-foreground/75">
                Browse doctors, departments, and detailed hospital information
                through the MedCore platform.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-brand text-brand-foreground hover:bg-brand/90"
              >
                <Link href={`/hospitals/${id}/doctors`}>Find a Doctor</Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link href="/hospitals">Back to directory</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════ SHARED ══════════ */

function Eyebrow({ children, centered }) {
  return (
    <div
      className={`flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-brand ${
        centered ? "justify-center" : ""
      }`}
    >
      {centered && <span className="h-px w-8 bg-brand/40" />}
      <span>{children}</span>
      {centered && <span className="h-px w-8 bg-brand/40" />}
    </div>
  );
}

function SectionHeader({ eyebrow, title, description, href, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div className="max-w-2xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h2>
        <p className="mt-4 text-base text-muted-foreground">{description}</p>
      </div>

      <Button asChild variant="outline">
        <Link href={href}>
          {action}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;

  return (
    <div className="flex items-start gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
        <Icon className="h-4 w-4" />
      </span>

      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-sm leading-6">{value}</p>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, value }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 transition-all hover:border-brand/30 hover:shadow-sm">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
        <Icon className="h-5 w-5" />
      </span>

      <h3 className="mt-5 text-sm font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 break-words text-sm leading-6 text-muted-foreground">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="mt-14 rounded-2xl border border-dashed border-border p-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Building2 className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="mt-5 text-base font-semibold">Nothing here yet</p>
      <p className="mt-1.5 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}