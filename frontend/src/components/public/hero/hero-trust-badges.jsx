import { ShieldCheck, Layers, Users, Activity, FileCheck, Clock } from "lucide-react";

const BADGES = [
  { icon: ShieldCheck, label: "Multi-Tenant Secure" },
  { icon: Layers, label: "Role-Based Access" },
  { icon: Users, label: "500+ Hospitals Ready" },
  { icon: Activity, label: "Real-Time Updates" },
  { icon: FileCheck, label: "Audit Logging" },
  { icon: Clock, label: "24/7 Support" },
];

export function HeroTrustBadges() {
  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
      {BADGES.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="h-4 w-4 shrink-0 text-brand" />
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}