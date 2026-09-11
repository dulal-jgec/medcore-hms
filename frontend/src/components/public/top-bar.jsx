import { Phone, Mail, MapPin } from "lucide-react";
import Link from "next/link";

export function TopBar() {
  return (
    <div className="hidden md:block bg-primary text-primary-foreground">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs sm:px-6 lg:px-8">
        <div className="flex items-center gap-5">
          <a
            href="tel:+919000000000"
            className="flex items-center gap-1.5 opacity-90 transition-opacity hover:opacity-100"
          >
            <Phone className="h-3 w-3" />
            <span>+91 90000 00000</span>
          </a>
          <a
            href="mailto:hello@medcore.health"
            className="flex items-center gap-1.5 opacity-90 transition-opacity hover:opacity-100"
          >
            <Mail className="h-3 w-3" />
            <span>hello@medcore.health</span>
          </a>
          <span className="hidden items-center gap-1.5 opacity-90 lg:inline-flex">
            <MapPin className="h-3 w-3" />
            <span>Made for hospitals across India</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/for-hospitals"
            className="opacity-90 transition-opacity hover:opacity-100"
          >
            For Hospitals
          </Link>
          <span className="opacity-40">|</span>
          <Link
            href="/contact"
            className="opacity-90 transition-opacity hover:opacity-100"
          >
            Support
          </Link>
        </div>
      </div>
    </div>
  );
}