import Link from "next/link";
import { Phone, Mail, MapPin, Building2 } from "lucide-react";

export function TopBar() {
  return (
    <div className="hidden border-b border-primary-darker-foreground/10 bg-primary-darker text-primary-darker-foreground md:block">
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-4 text-xs sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <a
            href="tel:+917364821623"
            className="flex items-center gap-1.5 opacity-75 transition-opacity hover:opacity-100"
          >
            <Phone className="h-3 w-3" />
            <span>+91 73648 21623</span>
          </a>
          <a
            href="mailto:skdulalislam1@gmail.com"
            className="flex items-center gap-1.5 opacity-75 transition-opacity hover:opacity-100"
          >
            <Mail className="h-3 w-3" />
            <span>skdulalislam1@gmail.com</span>
          </a>
          <span className="hidden items-center gap-1.5 opacity-75 lg:inline-flex">
            <MapPin className="h-3 w-3" />
            <span>Jalpaiguri, India</span>
          </span>
        </div>

        <div className="flex items-center gap-5">
          <Link
            href="/for-hospitals"
            className="flex items-center gap-1.5 opacity-75 transition-opacity hover:opacity-100"
          >
            <Building2 className="h-3 w-3" />
            <span>For Hospitals</span>
          </Link>
          <span className="opacity-30">|</span>
          <Link
            href="/support"
            className="opacity-75 transition-opacity hover:opacity-100"
          >
            Support
          </Link>
        </div>
      </div>
    </div>
  );
}
