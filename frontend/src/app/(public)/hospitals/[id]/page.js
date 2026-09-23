import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Building2,
  ShieldCheck,
  Stethoscope,
  Phone,
  Clock,
  Search,
  CalendarPlus,
  HeartPulse,
  Ambulance,
  Pill,
  FileText,
  BadgeCheck,
  Mail,
  Globe,
  ArrowUpRight,
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
    icon: Search,
    label: "Doctors",
    desc: "View medical team",
    href: "#doctors",
  },
  {
    icon: HeartPulse,
    label: "Departments",
    desc: "Explore specialties",
    href: "#departments",
  },
  {
    icon: FileText,
    label: "Hospital Info",
    desc: "Contact & details",
    href: "#information",
  },
  {
    icon: Pill,
    label: "Gallery",
    desc: "View hospital",
    href: "#gallery",
  },
  {
    icon: Ambulance,
    label: "Emergency",
    desc: "Contact hospital",
    href: "#emergency",
  },
];

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const result = await getPublicHospital(id);
    const hospital = result.data;

    if (!hospital) {
      return {
        title: "Hospital Not Found | MedCore",
      };
    }

    return {
      title: `${hospital.name} | MedCore`,
      description:
        hospital.description ||
        `View departments, doctors and contact information for ${hospital.name}.`,
    };
  } catch {
    return {
      title: "Hospital | MedCore",
    };
  }
}

export default async function HospitalOverviewPage({
  params,
}) {
  const { id } = await params;

  let hospital;

  try {
    const result = await getPublicHospital(id);
    hospital = result.data;
  } catch (error) {
    if (error?.status === 404) {
      notFound();
    }

    throw error;
  }

  if (!hospital) {
    notFound();
  }

  const [
    departmentsResult,
    doctorsResult,
    galleryResult,
  ] = await Promise.all([
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

  const departments =
    departmentsResult.data?.content || [];

  const doctors =
    doctorsResult.data?.content || [];

  const gallery =
    galleryResult.data?.content || [];

  const emergencyPhone =
    hospital.emergencyPhone || hospital.phone;

  return (
    <>
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative">
        <div className="relative h-[520px] w-full overflow-hidden sm:h-[560px] lg:h-[600px]">
          {hospital.bannerUrl ? (
            <PublicImage
              src={hospital.bannerUrl}
              alt={`${hospital.name} building`}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : hospital.logoUrl ? (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <PublicImage
                src={hospital.logoUrl}
                alt={hospital.name}
                width={280}
                height={280}
                priority
                className="h-56 w-56 object-contain"
              />
            </div>
          ) : (
            <div className="h-full w-full bg-muted" />
          )}

          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-primary/20"
          />

          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/15 px-3 py-1 text-xs font-semibold text-brand backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5" />
                MedCore Verified Hospital
              </span>

              <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
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
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-brand text-brand-foreground hover:bg-brand/90"
                >
                  <Link
                    href={`/hospitals/${id}/doctors`}
                  >
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
                  <Link
                    href={`/hospitals/${id}/departments`}
                  >
                    <HeartPulse className="mr-2 h-4 w-4" />
                    Departments
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
                      Contact Hospital
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {QUICK_ACTIONS.map(
              ({ icon: Icon, label, desc, href, accent }) => (
                <Link
                  key={label}
                  href={href}
                  className={`group flex flex-col items-start gap-3 rounded-xl border p-4 transition hover:shadow-sm ${
                    accent
                      ? "border-brand/30 bg-brand-soft"
                      : "border-border bg-card hover:border-brand/40"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      accent
                        ? "bg-brand text-brand-foreground"
                        : "bg-brand-soft text-brand-soft-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>

                  <div>
                    <p className="text-sm font-semibold">
                      {label}
                    </p>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {desc}
                    </p>
                  </div>
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          STATS
      ===================================================== */}

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <StatBlock
              icon={HeartPulse}
              value={departments.length}
              label="Departments"
            />

            <StatBlock
              icon={Stethoscope}
              value={doctors.length}
              label="Doctors"
            />

            <StatBlock
              icon={Building2}
              value={gallery.length}
              label="Gallery Photos"
            />

            <StatBlock
              icon={BadgeCheck}
              value="Active"
              label="Hospital Status"
              accent
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          INFORMATION
      ===================================================== */}

      <section
        id="information"
        className="border-b border-border"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                About the hospital
              </p>

              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Healthcare information
              </h2>

              <p className="mt-5 whitespace-pre-line text-base leading-7 text-muted-foreground">
                {hospital.description ||
                  "Detailed information about this hospital will be available here."}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href={`/hospitals/${id}/doctors`}>
                    Meet our doctors
                  </Link>
                </Button>

                <Button asChild variant="outline">
                  <Link
                    href={`/hospitals/${id}/departments`}
                  >
                    Explore departments
                  </Link>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold">
                  Hospital Information
                </h3>

                <div className="mt-6 space-y-5">
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
                    icon={Phone}
                    label="Emergency"
                    value={hospital.emergencyPhone}
                  />

                  <InfoRow
                    icon={Mail}
                    label="Email"
                    value={hospital.email}
                  />

                  {hospital.website && (
                    <div className="flex items-start gap-3">
                      <Globe className="mt-0.5 h-5 w-5 shrink-0 text-brand" />

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Website
                        </p>

                        <a
                          href={hospital.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-sm font-medium hover:text-brand"
                        >
                          Visit website
                          <ArrowUpRight className="h-3.5 w-3.5" />
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

      {/* =====================================================
          DEPARTMENTS
      ===================================================== */}

      <section
        id="departments"
        className="border-b border-border bg-muted/30"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Departments"
            title="Centres of care"
            description="Explore the active medical departments available at this hospital."
            href={`/hospitals/${id}/departments`}
            action="View all departments"
          />

          {departments.length === 0 ? (
            <EmptyState message="No departments are currently available." />
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {departments.map((department) => (
                <DepartmentCard
                  key={department.id}
                  department={department}
                  hospitalId={id}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          DOCTORS
      ===================================================== */}

      <section
        id="doctors"
        className="border-b border-border"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Doctors"
            title="Meet our specialists"
            description={`Explore doctors currently available at ${hospital.name}.`}
            href={`/hospitals/${id}/doctors`}
            action="View all doctors"
          />

          {doctors.length === 0 ? (
            <EmptyState message="No doctors are currently available." />
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  hospitalId={id}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          GALLERY
      ===================================================== */}

      <section
        id="gallery"
        className="border-b border-border bg-muted/30"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Gallery"
            title="Take a look inside"
            description={`Explore published images from ${hospital.name}.`}
            href={`/hospitals/${id}/gallery`}
            action="View full gallery"
          />

          {gallery.length === 0 ? (
            <EmptyState message="No gallery images are currently available." />
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((image) => (
                <GalleryCard
                  key={image.id}
                  image={image}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          CONTACT
      ===================================================== */}

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              Hospital Information
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Contact & location
            </h2>

            <p className="mt-3 text-sm text-muted-foreground">
              Use the information below to contact or visit the
              hospital.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

            <InfoCard
              icon={Phone}
              title="Phone"
              value={hospital.phone}
            />

            <InfoCard
              icon={Mail}
              title="Email"
              value={hospital.email}
            />

            <InfoCard
              icon={Clock}
              title="Emergency Contact"
              value={
                hospital.emergencyPhone ||
                "Emergency contact not provided"
              }
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          EMERGENCY
      ===================================================== */}

      <section id="emergency" className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-destructive/20 bg-destructive/5 p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-destructive text-destructive-foreground">
                <Ambulance className="h-6 w-6" />
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-destructive">
                  Emergency Contact
                </p>

                <h3 className="mt-1 text-lg font-bold tracking-tight">
                  Need immediate hospital assistance?
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Contact the hospital using the emergency number
                  provided.
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

      {/* =====================================================
          CTA
      ===================================================== */}

      <section>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-primary p-8 sm:p-12 lg:p-16">
            <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-xl">
                <h3 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
                  Explore {hospital.name}
                </h3>

                <p className="mt-4 text-sm leading-6 text-primary-foreground/75">
                  Browse doctors, departments and hospital
                  information through MedCore.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-brand text-brand-foreground hover:bg-brand/90"
                >
                  <Link href={`/hospitals/${id}/doctors`}>
                    Find a Doctor
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Link href="/hospitals">
                    Back to directory
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  action,
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          {eyebrow}
        </p>

        <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h2>

        <p className="mt-3 text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      <Button asChild variant="outline">
        <Link href={href}>{action}</Link>
      </Button>
    </div>
  );
}

function StatBlock({
  icon: Icon,
  value,
  label,
  accent = false,
}) {
  return (
    <div className="flex items-center gap-4">
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
          accent
            ? "bg-highlight-soft text-highlight-soft-foreground"
            : "bg-brand-soft text-brand-soft-foreground"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>

      <div>
        <p className="text-2xl font-bold tracking-tight">
          {value}
        </p>

        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) {
    return null;
  }

  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand" />

      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 text-sm leading-6">
          {value}
        </p>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, value }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
        <Icon className="h-5 w-5" />
      </span>

      <h3 className="mt-4 text-sm font-semibold tracking-tight">
        {title}
      </h3>

      <p className="mt-3 break-words text-sm leading-6 text-muted-foreground">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="mt-10 rounded-2xl border border-dashed p-10 text-center">
      <p className="text-sm text-muted-foreground">
        {message}
      </p>
    </div>
  );
}