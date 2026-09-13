"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  BedDouble,
  FileText,
  Clock,
  Bell,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { HOSPITAL_SETTINGS } from "@/lib/admin-mock-data";

const generalSchema = z.object({
  name: z.string().min(3, "Hospital name is required").max(120),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(10, "Enter a valid phone").max(15),
  website: z.string().min(4, "Enter a valid website"),
  description: z.string().min(20, "Description must be at least 20 characters").max(500),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(4, "Enter a valid pincode"),
});

const hoursSchema = z.object({
  opd: z.string().min(3, "OPD hours required"),
  emergency: z.string().min(3, "Emergency hours required"),
  visiting: z.string().min(3, "Visiting hours required"),
  pharmacy: z.string().min(3, "Pharmacy hours required"),
});

const TABS = [
  { id: "general", label: "General", icon: Building2 },
  { id: "hours", label: "Hours", icon: Clock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: ShieldCheck },
];

export default function AdminSettingsPage() {
  const [tab, setTab] = useState("general");

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Configuration
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Hospital settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your hospital's profile, hours, and preferences.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* Left tabs */}
        <aside className="lg:col-span-3">
          <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-2 lg:flex-col lg:overflow-visible">
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={cn(
                    "flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors lg:w-full",
                    active
                      ? "bg-brand-soft text-brand-soft-foreground"
                      : "text-muted-foreground hover:bg-hover hover:text-hover-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right content */}
        <div className="lg:col-span-9">
          {tab === "general" && <GeneralSettings />}
          {tab === "hours" && <HoursSettings />}
          {tab === "notifications" && <NotificationsSettings />}
          {tab === "security" && <SecuritySettings />}
        </div>
      </div>
    </div>
  );
}

/* ══════════ General Tab ══════════ */

function GeneralSettings() {
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(generalSchema),
    defaultValues: HOSPITAL_SETTINGS.general,
  });

  async function onSubmit(data) {
    await new Promise((r) => setTimeout(r, 700));
    console.log("Hospital update:", data);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <SectionCard
      title="General information"
      desc="Basic details about your hospital. These appear on patient portals and documents."
    >
      {saved && <SavedToast />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Hospital name" error={errors.name?.message} required className="sm:col-span-2">
            <Input {...register("name")} className="h-11" />
          </Field>

          <Field label="Email" error={errors.email?.message} required>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input {...register("email")} className="h-11 pl-10" />
            </div>
          </Field>

          <Field label="Phone" error={errors.phone?.message} required>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input {...register("phone")} className="h-11 pl-10" />
            </div>
          </Field>

          <Field label="Website" error={errors.website?.message} required className="sm:col-span-2">
            <div className="relative">
              <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input {...register("website")} className="h-11 pl-10" />
            </div>
          </Field>

          <Field label="Description" error={errors.description?.message} required className="sm:col-span-2">
            <textarea
              {...register("description")}
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </Field>

          <Field label="Address" error={errors.address?.message} required className="sm:col-span-2">
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input {...register("address")} className="h-11 pl-10" />
            </div>
          </Field>

          <Field label="City" error={errors.city?.message} required>
            <Input {...register("city")} className="h-11" />
          </Field>
          <Field label="State" error={errors.state?.message} required>
            <Input {...register("state")} className="h-11" />
          </Field>
          <Field label="Pincode" error={errors.pincode?.message} required>
            <Input {...register("pincode")} className="h-11" />
          </Field>
        </div>

        {/* Read-only facts */}
        <div className="grid gap-3 border-t border-border pt-5 sm:grid-cols-3">
          <FactBox icon={FileText} label="License number" value={HOSPITAL_SETTINGS.general.licenseNumber} />
          <FactBox icon={Calendar} label="Established" value={HOSPITAL_SETTINGS.general.established} />
          <FactBox icon={BedDouble} label="Beds" value={HOSPITAL_SETTINGS.general.beds} />
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-5">
          <Button type="button" variant="outline">Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-1.5 h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}

/* ══════════ Hours Tab ══════════ */

function HoursSettings() {
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(hoursSchema),
    defaultValues: HOSPITAL_SETTINGS.hours,
  });

  async function onSubmit(data) {
    await new Promise((r) => setTimeout(r, 500));
    console.log("Hours update:", data);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <SectionCard
      title="Operating hours"
      desc="These hours are shown to patients when they book appointments."
    >
      {saved && <SavedToast />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="OPD hours" error={errors.opd?.message} required>
            <Input {...register("opd")} className="h-11" />
          </Field>
          <Field label="Emergency" error={errors.emergency?.message} required>
            <Input {...register("emergency")} className="h-11" />
          </Field>
          <Field label="Visiting hours" error={errors.visiting?.message} required>
            <Input {...register("visiting")} className="h-11" />
          </Field>
          <Field label="Pharmacy hours" error={errors.pharmacy?.message} required>
            <Input {...register("pharmacy")} className="h-11" />
          </Field>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-5">
          <Button type="button" variant="outline">Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-1.5 h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}

/* ══════════ Notifications Tab ══════════ */

function NotificationsSettings() {
  const [prefs, setPrefs] = useState(HOSPITAL_SETTINGS.notifications);
  const [saved, setSaved] = useState(false);

  const emailItems = [
    { key: "emailNewAppointment", label: "New appointment booked", desc: "When a patient books an appointment" },
    { key: "emailNewPatient", label: "New patient registered", desc: "When a patient completes registration" },
    { key: "emailBillingAlerts", label: "Billing alerts", desc: "When an invoice becomes overdue" },
    { key: "emailCriticalLab", label: "Critical lab results", desc: "When a critical lab test result is ready" },
  ];

  const smsItems = [
    { key: "smsPatientReminders", label: "Patient reminders", desc: "Appointment reminders to patients" },
    { key: "smsStaffAlerts", label: "Staff SMS alerts", desc: "Urgent alerts to on-duty staff" },
  ];

  function toggle(key) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  async function save() {
    await new Promise((r) => setTimeout(r, 500));
    console.log("Notification prefs:", prefs);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <SectionCard
      title="Notifications"
      desc="Choose which events trigger email or SMS notifications."
    >
      {saved && <SavedToast />}

      <div className="space-y-6">
        {/* Email section */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            Email notifications
          </div>
          <div className="mt-3 space-y-1">
            {emailItems.map((item) => (
              <ToggleRow
                key={item.key}
                label={item.label}
                desc={item.desc}
                checked={prefs[item.key]}
                onChange={() => toggle(item.key)}
              />
            ))}
          </div>
        </div>

        {/* SMS section */}
        <div className="border-t border-border pt-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            SMS notifications
          </div>
          <div className="mt-3 space-y-1">
            {smsItems.map((item) => (
              <ToggleRow
                key={item.key}
                label={item.label}
                desc={item.desc}
                checked={prefs[item.key]}
                onChange={() => toggle(item.key)}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-5">
          <Button type="button" variant="outline">Reset to defaults</Button>
          <Button onClick={save}>
            <Save className="mr-1.5 h-4 w-4" />
            Save preferences
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}

function ToggleRow({ label, desc, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg p-3 transition-colors hover:bg-hover/50">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-brand" : "bg-muted"
        )}
        aria-pressed={checked}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          )}
        />
      </button>
    </label>
  );
}

/* ══════════ Security Tab ══════════ */

function SecuritySettings() {
  const [sec, setSec] = useState(HOSPITAL_SETTINGS.security);
  const [showValues, setShowValues] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggle(key) {
    setSec((s) => ({ ...s, [key]: !s[key] }));
  }

  function update(key, value) {
    setSec((s) => ({ ...s, [key]: value }));
  }

  async function save() {
    await new Promise((r) => setTimeout(r, 500));
    console.log("Security settings:", sec);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <SectionCard
      title="Security"
      desc="Configure authentication and session policies for your hospital."
    >
      {saved && <SavedToast />}

      <div className="space-y-6">
        <ToggleRow
          label="Require two-factor authentication"
          desc="Staff must verify login with a second factor (email or app)"
          checked={sec.requireTwoFactor}
          onChange={() => toggle("requireTwoFactor")}
        />

        <ToggleRow
          label="Allow patient self-registration"
          desc="Patients can create accounts directly without hospital approval"
          checked={sec.allowPatientSelfRegistration}
          onChange={() => toggle("allowPatientSelfRegistration")}
        />

        <div className="border-t border-border pt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Session & password policy
          </h3>

          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Field label="Session timeout (minutes)">
              <Input
                type="number"
                value={sec.sessionTimeout}
                onChange={(e) =>
                  update("sessionTimeout", parseInt(e.target.value) || 0)
                }
                className="h-11"
              />
            </Field>

            <Field label="Password expiry (days)">
              <Input
                type="number"
                value={sec.passwordExpiryDays}
                onChange={(e) =>
                  update("passwordExpiryDays", parseInt(e.target.value) || 0)
                }
                className="h-11"
              />
            </Field>
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 rounded-xl border border-highlight-soft-foreground/20 bg-highlight-soft/40 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-highlight-soft-foreground" />
          <p className="text-xs leading-5 text-muted-foreground">
            Changes to security settings apply to all staff. Enabling 2FA will
            require every user to reconfigure their login on next sign-in.
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-5">
          <Button type="button" variant="outline">Cancel</Button>
          <Button onClick={save}>
            <Save className="mr-1.5 h-4 w-4" />
            Save security settings
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}

/* ══════════ Shared ══════════ */

function SectionCard({ title, desc, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {desc && (
          <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
        )}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

function SavedToast() {
  return (
    <div className="mb-5 flex items-center gap-3 rounded-xl border border-brand/20 bg-brand-soft/50 px-4 py-3 text-sm">
      <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" />
      <p className="font-medium text-brand-soft-foreground">
        Changes saved successfully
      </p>
    </div>
  );
}

function Field({ label, required, error, className, children }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function FactBox({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-2 text-brand">
        <Icon className="h-4 w-4" />
        <p className="text-[10px] font-semibold uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  );
}