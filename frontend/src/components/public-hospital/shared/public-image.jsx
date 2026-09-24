import Image from "next/image";
import { Building2 } from "lucide-react";

export default function PublicImage({
  src,
  alt = "",
  fallbackIcon: FallbackIcon = Building2,
  className = "",
  ...props
}) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex h-full w-full items-center justify-center bg-muted ${className}`}
      >
        <FallbackIcon className="h-8 w-8 text-muted-foreground/40" />
      </div>
    );
  }

  return <Image src={src} alt={alt} className={className} {...props} />;
}