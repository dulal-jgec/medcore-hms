import {
  ShieldCheck,
  Layers,
  Users,
  Activity,
  FileCheck,
  Clock,
} from "lucide-react";

const BADGES = [
  { icon: ShieldCheck, label: "Multi-tenant secure" },
  { icon: Layers, label: "Role-based access" },
  { icon: Users, label: "500+ hospitals ready" },
  { icon: Activity, label: "Real-time updates" },
  { icon: FileCheck, label: "Audit logging" },
  { icon: Clock, label: "24/7 support" },
];

export function HeroTrustBadges() {
  return (
    <ul className="grid grid-cols-1 gap-x-6 gap-y-2.5 min-[400px]:grid-cols-2 sm:grid-cols-3 sm:gap-y-3">
      {BADGES.map(({ icon: Icon, label }) => (
        <li
          key={label}
          className="flex items-center gap-2 text-xs font-medium text-white/80 sm:text-sm"
        >
          <Icon className="h-4 w-4 shrink-0 text-brand" />
          <span className="truncate">{label}</span>
        </li>
      ))}
    </ul>
  );
}
