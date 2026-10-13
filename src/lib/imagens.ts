import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "imagens";

/** Envia a imagem para o álbum do bairro e devolve o caminho salvo. */
export async function enviarImagem(file: File, userId: string): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Envie um arquivo de imagem.");
  if (file.size > 6 * 1024 * 1024) throw new Error("A imagem deve ter no máximo 6 MB.");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  return path;
}

const TIPOS_VIDEO = new Set(["video/mp4", "video/webm", "video/quicktime"]);

/** Envia um vídeo curto para o álbum do bairro e devolve o caminho salvo. */
export async function enviarVideo(file: File, userId: string): Promise<string> {
  if (!TIPOS_VIDEO.has(file.type)) {
    throw new Error("Envie um vídeo MP4, WebM ou MOV.");
  }
  if (file.size > 50 * 1024 * 1024) {
    throw new Error("O vídeo deve ter no máximo 50 MB.");
  }
  const ext = (file.name.split(".").pop() || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  return path;
}

const cache = new Map<string, string>();

/** Gera (e reaproveita) uma URL temporária para exibir uma imagem do álbum. */
export function useImagemUrl(path: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(() => (path ? (cache.get(path) ?? null) : null));

  useEffect(() => {
    if (!path) {
      setUrl(null);
      return;
    }
    if (path.startsWith("http")) {
      setUrl(path);
      return;
    }
    const cached = cache.get(path);
    if (cached) {
      setUrl(cached);
      return;
    }
    let active = true;
    supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 60 * 60 * 24)
      .then(({ data }) => {
        if (!active || !data?.signedUrl) return;
        cache.set(path, data.signedUrl);
        setUrl(data.signedUrl);
      });
    return () => {
      active = false;
    };
  }, [path]);

  return url;
}

/** Resolve imagens e vídeos salvos no álbum privado. */
export const useMidiaUrl = useImagemUrl;
