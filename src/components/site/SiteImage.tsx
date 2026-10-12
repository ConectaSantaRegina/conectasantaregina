import { ImageOff } from "lucide-react";
import { useImagemUrl } from "@/lib/imagens";
import { cn } from "@/lib/utils";

export function SiteImage({
  path,
  alt,
  className,
}: {
  path: string | null | undefined;
  alt: string;
  className?: string;
}) {
  const url = useImagemUrl(path);

  if (!path) return null;

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {url ? (
        <img
          src={url}
          alt={alt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-contain"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          <ImageOff className="h-6 w-6" />
        </div>
      )}
    </div>
  );
}
