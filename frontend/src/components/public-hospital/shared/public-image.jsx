import Image from "next/image";

export default function PublicImage({
  src,
  alt = "",
  fill = false,
  width,
  height,
  priority = false,
  sizes,
  className = "",
  ...props
}) {
  if (!src) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-muted ${className}`}
      >
        <span className="text-sm text-muted-foreground">
          No image available
        </span>
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes || "100vw"}
        className={className}
        {...props}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 800}
      height={height || 600}
      priority={priority}
      className={className}
      {...props}
    />
  );
}
