import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Ambulance,
  ArrowRight,
  Award,
  BadgeCheck,
  Building2,
  CalendarPlus,
  ChevronRight,
  Clock,
  FileText,
  Globe,
  HeartPulse,
  Home,
  Mail,
  MapPin,
  Phone,
  Pill,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
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
    icon: Ambulance,
    label: "Emergency",
    desc: "24/7 response",
    href: "#emergency",
    accent: true,
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

  const [departmentsResult, doctorsResult, galleryResult] = await Promise.all([
    getPublicDepartments(id, {
      page: 0,
      size: 8,
      sortBy: "name",
      sortDir: "asc",
    }),
    getPublicDoctors(id, { page: 0, size: 6, sortBy: "id", sortDir: "asc" }),
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
      <AboutEditorial hospital={hospital} id={id} />
      <StatsStrip
        departments={departments.length}
        doctors={doctors.length}
        gallery={gallery.length}
      />
      <SpecialtiesSection departments={departments} hospitalId={id} />
      <DoctorsSection doctors={doctors} hospitalId={id} hospital={hospital} />
      <GalleryPreview gallery={gallery} hospitalId={id} hospital={hospital} />
      <ContactGrid hospital={hospital} />
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
    <section className="relative isolate overflow-hidden bg-primary-darker">
      <div className="relative h-[600px] w-full sm:h-[680px] lg:h-[760px]">
        {heroImage ? (
          <>
            <PublicImage
              src={heroImage}
              alt={`${hospital.name} building`}
              fill
              priority
              sizes="100vw"
              className={
                usingBanner ? "object-cover" : "scale-110 object-cover blur-3xl"
              }
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-primary-darker via-primary-darker/70 to-primary-darker/30"
            />
          </>
        ) : (
          <>
            <div className="h-full w-full bg-gradient-to-br from-primary-darker via-primary-darker to-primary-darker/90" />
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

        {/* Breadcrumb over hero — scrolls away */}
        <div className="absolute inset-x-0 top-0 z-20">
          <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-5 text-xs sm:gap-2 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="flex shrink-0 items-center gap-1.5 text-white/70 transition-colors hover:text-white"
            >
              <Home className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0 text-white/40" />
            <Link
              href="/hospitals"
              className="shrink-0 text-white/70 transition-colors hover:text-white"
            >
              Hospitals
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0 text-white/40" />
            <span className="truncate font-medium text-white">
              {hospital.name}
            </span>
          </div>
        </div>

        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5" />
              MedCore Verified
            </span>

            <div className="mt-6 flex items-start gap-5">
              {hospital.logoUrl && usingBanner && (
                <div className="hidden h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur sm:block">
                  <PublicImage
                    src={hospital.logoUrl}
                    alt={hospital.name}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="min-w-0">
                <h1 className="max-w-4xl text-4xl font-bold leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                  {hospital.name}
                </h1>

                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/85">
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
                    Active on MedCore
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 bg-brand text-brand-foreground hover:bg-brand/90"
              >
                <Link href={`/hospitals/${id}/doctors`}>
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Book an appointment
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
              >
                <Link href={`/hospitals/${id}/departments`}>
                  <HeartPulse className="mr-2 h-4 w-4" />
                  Explore departments
                </Link>
              </Button>

              {emergencyPhone && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
                >
                  <a href={`tel:${emergencyPhone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call emergency
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

/* ══════════ ABOUT EDITORIAL ══════════ */

function AboutEditorial({ hospital, id }) {
  const aboutImage =
    hospital.bannerUrl || hospital.logoUrl || "/images/hospital-2.jpg";

  return (
    <section id="information" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-6">
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              <span className="h-px w-8 bg-brand" />
              About the hospital
            </p>

            <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Trusted healthcare,{" "}
              <span className="text-brand">delivered with care.</span>
            </h2>

            <p className="mt-6 whitespace-pre-line text-base leading-8 text-muted-foreground lg:text-lg">
              {hospital.description ||
                `${hospital.name} is part of the MedCore network, providing comprehensive medical services with a focus on patient well-being, clinical excellence, and modern diagnostic facilities.`}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <FeaturePill icon={Award} label="Accredited care" />
              <FeaturePill icon={Users} label="Expert consultants" />
              <FeaturePill icon={Clock} label="24/7 availability" />
              <FeaturePill icon={ShieldCheck} label="Verified on MedCore" />
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 bg-brand text-brand-foreground hover:bg-brand/90"
              >
                <Link href={`/hospitals/${id}/doctors`}>
                  Meet our doctors
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12">
                <Link href={`/hospitals/${id}/departments`}>
                  Explore departments
                </Link>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-border shadow-2xl">
                <Image
                  src={aboutImage}
                  alt={hospital.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-primary-darker/60 via-transparent to-transparent"
                />
              </div>

              <div className="absolute -bottom-6 -left-6 hidden max-w-xs rounded-2xl border border-border bg-card p-5 shadow-xl sm:block">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-brand-foreground">
                  <Stethoscope className="h-5 w-5" />
                </span>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Patients treated
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight">
                  50,000+
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Across all departments
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturePill({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm">
      <Icon className="h-4 w-4 shrink-0 text-brand" />
      <span className="font-medium">{label}</span>
    </div>
  );
}

/* ══════════ STATS ══════════ */

function StatsStrip({ departments, doctors, gallery }) {
  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <Stat icon={HeartPulse} value={departments} label="Departments" />
          <Stat icon={Stethoscope} value={doctors} label="Doctors" />
          <Stat icon={Sparkles} value={gallery} label="Gallery photos" />
          <Stat
            icon={BadgeCheck}
            value="24/7"
            label="Emergency care"
            accent
          />
        </div>
      </div>
    </section>
  );
}

function Stat({ icon: Icon, value, label, accent }) {
  return (
    <div className="flex items-center gap-4">
      <span
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
          accent
            ? "bg-brand text-brand-foreground"
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

/* ══════════ DEPARTMENTS ══════════ */

function SpecialtiesSection({ departments, hospitalId }) {
  return (
    <section id="departments" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <SectionHeader
          eyebrow="Departments"
          title="Centres of care"
          description="Specialized medical departments staffed by experienced consultants and modern diagnostic equipment."
          href={`/hospitals/${hospitalId}/departments`}
          action="View all departments"
        />

        {departments.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="Departments coming soon"
            message="This hospital is still setting up its department structure."
          />
        ) : (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

function DoctorsSection({ doctors, hospitalId, hospital }) {
  return (
    <section id="doctors" className="border-b border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <SectionHeader
          eyebrow="Medical team"
          title="Meet our specialists"
          description={`Consult with experienced doctors currently practicing at ${hospital.name}.`}
          href={`/hospitals/${hospitalId}/doctors`}
          action="View all doctors"
        />

        {doctors.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title="No doctors yet"
            message="Doctor profiles will appear here once added."
          />
        ) : (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

function GalleryPreview({ gallery, hospitalId, hospital }) {
  if (gallery.length === 0) return null;

  return (
    <section id="gallery" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <SectionHeader
          eyebrow="Gallery"
          title="A look inside"
          description={`Photographs of the facilities, wards, and everyday environment at ${hospital.name}.`}
          href={`/hospitals/${hospitalId}/gallery`}
          action="View full gallery"
        />

        <div className="mt-12 grid auto-rows-[200px] grid-cols-2 gap-4 sm:grid-cols-3 lg:auto-rows-[240px]">
          {gallery.map((image, index) => (
            <GalleryCard
              key={image.id}
              image={image}
              size={index === 0 ? "featured" : index === 1 ? "tall" : "small"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════ CONTACT ══════════ */

function ContactGrid({ hospital }) {
  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              <span className="h-px w-8 bg-brand" />
              Contact
            </p>
            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Contact & location
            </h2>
            <p className="mt-5 text-base leading-7 text-muted-foreground">
              Reach out or visit the hospital using the information below.
            </p>

            <div className="mt-10 space-y-4">
              <ContactRow
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
              <ContactRow icon={Phone} label="Phone" value={hospital.phone} />
              <ContactRow
                icon={Ambulance}
                label="Emergency"
                value={hospital.emergencyPhone}
              />
              <ContactRow icon={Mail} label="Email" value={hospital.email} />
              {hospital.website && (
                <ContactRow
                  icon={Globe}
                  label="Website"
                  value={hospital.website.replace(/^https?:\/\//, "")}
                  href={hospital.website}
                />
              )}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border shadow-2xl lg:aspect-auto lg:h-full lg:min-h-[520px]">
              <Image
                src="/images/hospital-map.jpg"
                alt="Hospital location"
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-primary-darker/60 via-transparent to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-foreground">
                  <MapPin className="h-3 w-3" />
                  {[hospital.city, hospital.state].filter(Boolean).join(", ")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactRow({ icon: Icon, label, value, href }) {
  if (!value) return null;

  const content = (
    <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:border-brand/40">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-medium">{value}</p>
      </div>
    </div>
  );

  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block">
      {content}
    </a>
  ) : (
    content
  );
}

/* ══════════ EMERGENCY ══════════ */

function EmergencySection({ emergencyPhone }) {
  if (!emergencyPhone) return null;

  return (
    <section id="emergency" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-destructive/20">
          <Image
            src="/images/emergency-bg.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-destructive/95 via-destructive/85 to-destructive/40"
          />

          <div className="relative flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center lg:p-12">
            <div className="flex items-start gap-5">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur">
                <Ambulance className="h-7 w-7" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">
                  24/7 Emergency
                </p>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">
                  Need immediate medical assistance?
                </h3>
                <p className="mt-2 max-w-xl text-sm text-white/85">
                  Our emergency team is available around the clock. Call now
                  for immediate response.
                </p>
              </div>
            </div>

            <Button
              asChild
              size="lg"
              className="h-12 w-full bg-white text-destructive hover:bg-white/90 sm:w-auto"
            >
              <a href={`tel:${emergencyPhone}`}>
                <Phone className="mr-2 h-4 w-4" />
                {emergencyPhone}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════ FINAL CTA ══════════ */

function FinalCta({ hospital, id }) {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl">
          <Image
            src="/images/cta-hospital.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-primary-darker via-primary-darker/85 to-primary-darker/40"
          />

          <div className="relative flex flex-col items-start justify-between gap-8 p-10 sm:p-14 lg:flex-row lg:items-center lg:p-20">
            <div className="max-w-2xl">
              <h3 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Explore {hospital.name}
              </h3>
              <p className="mt-5 text-base leading-7 text-white/75">
                Browse doctors, departments, and detailed hospital information
                through the MedCore platform.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 bg-brand text-brand-foreground hover:bg-brand/90"
              >
                <Link href={`/hospitals/${id}/doctors`}>
                  Find a doctor
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
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

function SectionHeader({ eyebrow, title, description, href, action }) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
          <span className="h-px w-8 bg-brand" />
          {eyebrow}
        </p>
        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h2>
        <p className="mt-4 text-base text-muted-foreground">{description}</p>
      </div>

      <Button asChild variant="outline" className="w-full sm:w-auto">
        <Link href={href}>
          {action}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="mt-12 rounded-3xl border border-dashed border-border py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="mt-5 text-base font-semibold">{title}</p>
      <p className="mt-1.5 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}