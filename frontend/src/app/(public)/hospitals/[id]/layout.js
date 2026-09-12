import Link from "next/link";
import { notFound } from "next/navigation";
import { Home } from "lucide-react";

import { HOSPITALS } from "@/lib/hospitals";

export default async function HospitalLayout({ children, params }) {
  const { id } = await params;
  const hospital = HOSPITALS.find((h) => h.id === Number(id));

  if (!hospital) notFound();

  return (
    <>
      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs text-muted-foreground sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-1.5 hover:text-foreground">
            <Home className="h-3.5 w-3.5" />
            Home
          </Link>
          <span className="opacity-40">/</span>
          <Link href="/hospitals" className="hover:text-foreground">
            Hospitals
          </Link>
          <span className="opacity-40">/</span>
          <span className="truncate text-foreground">{hospital.name}</span>
        </div>
      </div>
      <main>{children}</main>
    </>
  );
}