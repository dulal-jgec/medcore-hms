import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  MapPin,
  Building2,
  Calendar,
  ShieldCheck,
  Stethoscope,
  Star,
  Users,
  Phone,
  Clock,
  BedDouble,
  Search,
  CalendarPlus,
  FlaskConical,
  HeartPulse,
  Ambulance,
  Pill,
  Microscope,
  Scan,
  Scissors,
  Wallet,
  FileText,
  BadgeCheck,
  ArrowUpRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { HOSPITALS } from "@/lib/hospitals";
import {
  getHospitalDepartments,
  getHospitalDoctors,
} from "@/lib/hospital-detail-data";

// ─── Static content (would come from API later) ───
const QUICK_ACTIONS = [
  {
    icon: CalendarPlus,
    label: "Book Appointment",
    desc: "Schedule a visit",
    href: "#appointment",
    accent: true,
  },
  {
    icon: Search,
    label: "Find a Doctor",
    desc: "Browse specialists",
    href: "#doctors",
  },
  {
    icon: HeartPulse,
    label: "Departments",
    desc: "Explore specialties",
    href: "#departments",
  },
  {
    icon: FlaskConical,
    label: "Lab Tests",
    desc: "Diagnostics & reports",
    href: "#facilities",
  },
  {
    icon: Pill,
    label: "Pharmacy",
    desc: "24/7 medicines",
    href: "#facilities",
  },
  {
    icon: Ambulance,
    label: "Emergency",
    desc: "24/7 response",
    href: "tel:+919000000000",
  },
];

const FACILITIES = [
  {
    name: "Intensive Care Unit",
    icon: HeartPulse,
    image: "/images/facility-icu.jpg",
    desc: "Multi-bed ICU with central monitoring and 1:1 critical care support.",
  },
  {
    name: "Operation Theatres",
    icon: Scissors,
    image: "/images/facility-ot.jpg",
    desc: "6 modular OTs equipped for cardiothoracic, neuro, and orthopedic surgery.",
  },
  {
    name: "Diagnostic Laboratory",
    icon: Microscope,
    image: "/images/facility-lab.jpg",
    desc: "NABL-accredited lab with hematology, biochemistry, and microbiology.",
  },
  {
    name: "Radiology & Imaging",
    icon: Scan,
    image: "/images/facility-radiology.jpg",
    desc: "Digital X-ray, ultrasound, CT, and MRI with same-day reporting.",
  },
  {
    name: "In-house Pharmacy",
    icon: Pill,
    image: "/images/facility-pharmacy.jpg",
    desc: "Round-the-clock pharmacy stocked with essential and specialty medicines.",
  },
  {
    name: "Emergency & Trauma",
    icon: Ambulance,
    image: "/images/facility-emergency.jpg",
    desc: "24/7 emergency care with dedicated ambulance fleet and trauma bays.",
  },
];

const GALLERY = [
  "/images/gallery-1.jpg",
  "/images/gallery-2.jpg",
  "/images/gallery-3.jpg",
  "/images/gallery-4.jpg",
  "/images/gallery-5.jpg",
  "/images/gallery-6.jpg",
];

const PATIENT_INFO = [
  {
    icon: Clock,
    title: "Visiting Hours",
    lines: ["Mon – Sat · 10:00 AM – 7:00 PM", "Sunday · 11:00 AM – 4:00 PM"],
  },
  {
    icon: BadgeCheck,
    title: "Admission",
    lines: ["Bring a valid ID and insurance card", "Pre-authorization: 24 hrs"],
  },
  {
    icon: Wallet,
    title: "Insurance & Billing",
    lines: ["Cashless with major insurers", "Digital invoices in your portal"],
  },
  {
    icon: FileText,
    title: "Medical Records",
    lines: ["Request via patient portal", "Ready within 48 hours"],
  },
];

export async function generateMetadata({ params }) {
  const { id } = await params;
  const hospital = HOSPITALS.find((h) => h.id === Number(id));
  if (!hospital) return { title: "Hospital Not Found" };

  return {
    title: `${hospital.name} — ${hospital.city}`,
    description: `Departments, doctors, facilities, and patient information for ${hospital.name}.`,
  };
}

export default async function HospitalOverviewPage({ params }) {
  const { id } = await params;
  const hospital = HOSPITALS.find((h) => h.id === Number(id));
  if (!hospital) notFound();

  const departments = getHospitalDepartments(hospital.id);
  const doctors = getHospitalDoctors(hospital.id);

  return (
    <>
      {/* ══════════ HERO ══════════ */}
      <section className="relative">
        <div className="relative h-[520px] w-full overflow-hidden sm:h-[560px] lg:h-[600px]">
          <Image
            src="/images/hospital-detail.jpg"
            alt={`${hospital.name} building`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
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

              <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                {hospital.name}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/85">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {hospital.city}, {hospital.state}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  {hospital.type}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Established {hospital.established}
                </span>
              </div>

              {/* Hero CTAs */}
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-brand text-brand-foreground hover:bg-brand/90">
                  <Link href={`/hospitals/${hospital.id}/doctors`}>
                    Book Appointment
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
                >
                  <Link href={`/hospitals/${hospital.id}/doctors`}>
                    Find a Doctor
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
                >
                  <a href="tel:+919000000000">
                    <Phone className="mr-2 h-4 w-4" />
                    Emergency
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ QUICK ACTION TILES ══════════ */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {QUICK_ACTIONS.map(({ icon: Icon, label, desc, href, accent }) => (
              <Link
                key={label}
                href={href}
                className={`group flex flex-col items-start gap-3 rounded-xl border p-4 transition-all hover:shadow-sm ${
                  accent
                    ? "border-brand/30 bg-brand-soft hover:border-brand/60"
                    : "border-border bg-card hover:border-brand/40 hover:bg-hover/40"
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
                  <p className="text-sm font-semibold tracking-tight">{label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ STATS BAR ══════════ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-4">
            <StatBlock icon={Stethoscope} value="42" label="Specialist Doctors" />
            <StatBlock icon={BedDouble} value={hospital.beds} label="Inpatient Beds" />
            <StatBlock icon={Users} value="1M+" label="Patients Served" />
            <StatBlock icon={Star} value="4.8" label="Patient Rating" accent />
          </div>
        </div>
      </section>

      {/* ══════════ ABOUT ══════════ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                About
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Trusted healthcare in {hospital.city}
              </h2>
              <p className="mt-5 text-base leading-7 text-muted-foreground">
                {hospital.name} is part of the MedCore network, providing
                integrated healthcare services to patients across{" "}
                {hospital.state}. With {hospital.departments} clinical
                departments and {hospital.beds} inpatient beds, we combine
                modern diagnostic technology with a team of experienced
                consultants and compassionate caregivers.
              </p>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                From routine consultations to complex surgeries, we deliver
                comprehensive care under one roof — supported by 24/7
                emergency services, an in-house pharmacy, advanced imaging,
                and a NABL-accredited diagnostic laboratory.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href={`/hospitals/${hospital.id}/doctors`}>
                    Meet our doctors
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/hospitals/${hospital.id}/departments`}>
                    Explore departments
                  </Link>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative col-span-2 aspect-[16/10] overflow-hidden rounded-2xl border border-border">
                  <Image
                    src="/images/hospital-about.jpg"
                    alt={`${hospital.name} reception`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-border">
                  <Image
                    src="/images/facility-icu.jpg"
                    alt="ICU"
                    fill
                    sizes="25vw"
                    className="object-cover"
                  />
                </div>
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-border">
                  <Image
                    src="/images/facility-ot.jpg"
                    alt="Operation Theatre"
                    fill
                    sizes="25vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ DEPARTMENTS ══════════ */}
      <section id="departments" className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                Departments
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Centres of care
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Every department is led by experienced consultants and
                supported by modern diagnostic equipment.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href={`/hospitals/${hospital.id}/departments`}>
                View all departments
              </Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {departments.slice(0, 8).map((dept) => (
              <Link
                key={dept.id}
                href={`/hospitals/${hospital.id}/departments/${dept.id}`}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-brand/40 hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  <Image
                    src={dept.image}
                    alt={dept.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="text-base font-semibold tracking-tight text-white">
                      {dept.name}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-white/85">
                      {dept.doctors} doctors
                      {dept.beds > 0 && ` · ${dept.beds} beds`}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ DOCTORS ══════════ */}
      <section id="doctors" className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                Doctors
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Meet our specialists
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Book an appointment with senior consultants across every
                clinical specialty.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href={`/hospitals/${hospital.id}/doctors`}>
                View all doctors
              </Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-brand/40 hover:shadow-md"
              >
                <div className="flex gap-5 p-5">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={doc.image}
                      alt={doc.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold tracking-tight">
                      {doc.name}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-brand">
                      {doc.specialty}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        4.9
                      </span>
                      <span>{doc.experience}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 border-t border-border p-3">
                  <Button asChild size="sm" variant="outline" className="flex-1">
                    <Link href={`/hospitals/${hospital.id}/doctors/${doc.id}`}>
                      View Profile
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="flex-1">
                    <Link
                      href={`/hospitals/${hospital.id}/doctors/${doc.id}#book`}
                    >
                      Book Now
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FACILITIES ══════════ */}
      <section id="facilities" className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              Facilities
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              World-class infrastructure
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Modern medical technology and dedicated facilities to support
              diagnosis, treatment, and recovery.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FACILITIES.map(({ name, icon: Icon, image, desc }) => (
              <div
                key={name}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-brand/40 hover:shadow-md"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  <Image
                    src={image}
                    alt={name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <h3 className="text-base font-semibold tracking-tight">
                      {name}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ GALLERY ══════════ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              Gallery
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Take a look inside
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              A glimpse into the wards, facilities, and everyday environment
              at {hospital.name}.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative col-span-1 row-span-2 aspect-[4/5] overflow-hidden rounded-2xl border border-border sm:col-span-1 lg:aspect-auto lg:row-span-2">
              <Image
                src={GALLERY[0]}
                alt="Hospital gallery"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            {GALLERY.slice(1, 5).map((src, i) => (
              <div
                key={i}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border"
              >
                <Image
                  src={src}
                  alt={`Hospital gallery ${i + 2}`}
                  fill
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ PATIENT INFORMATION ══════════ */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              Patient Information
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Before you visit
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Everything you need to know for a smooth visit or admission.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PATIENT_INFO.map(({ icon: Icon, title, lines }) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-sm font-semibold tracking-tight">
                  {title}
                </h3>
                <ul className="mt-3 space-y-1.5">
                  {lines.map((line) => (
                    <li
                      key={line}
                      className="text-xs leading-5 text-muted-foreground"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ EMERGENCY STRIP ══════════ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-destructive/20 bg-destructive/5 p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-destructive text-destructive-foreground">
                <Ambulance className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-destructive">
                  24/7 Emergency
                </p>
                <h3 className="mt-1 text-lg font-bold tracking-tight">
                  Emergency? Call us now.
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Immediate assistance · Ambulance available round the clock.
                </p>
              </div>
            </div>
            <Button
              asChild
              size="lg"
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-auto"
            >
              <a href="tel:+919000000000">
                <Phone className="mr-2 h-4 w-4" />
                +91 90000 00000
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ══════════ FINAL CTA ══════════ */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-primary p-8 sm:p-12 lg:p-16">
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
              <div className="max-w-xl">
                <h3 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
                  Access your {hospital.name} portal
                </h3>
                <p className="mt-4 text-sm leading-6 text-primary-foreground/75">
                  Sign in to view appointments, prescriptions, lab reports,
                  billing, and your complete medical history — securely.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-brand text-brand-foreground hover:bg-brand/90">
                  <Link href={`/login?hospitalId=${hospital.id}`}>
                    Sign in to portal
                  </Link>
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
    </>
  );
}

function StatBlock({ icon: Icon, value, label, accent }) {
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
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  );
}