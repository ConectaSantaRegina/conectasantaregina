import { VideoOff } from "lucide-react";
import { useMidiaUrl } from "@/lib/imagens";
import { cn } from "@/lib/utils";

export function SiteVideo({
  path,
  className,
  compact = false,
}: {
  path: string | null | undefined;
  className?: string;
  compact?: boolean;
}) {
  const url = useMidiaUrl(path);

  if (!path) return null;

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {url ? (
        <video
          src={url}
          controls
          preload="metadata"
          playsInline
          className="h-full w-full object-contain"
          aria-label="Vídeo da publicação"
        />
      ) : (
        <div className="flex h-full min-h-20 w-full items-center justify-center text-muted-foreground">
          <VideoOff className={compact ? "h-5 w-5" : "h-6 w-6"} />
        </div>
      )}
    </div>
  );
}