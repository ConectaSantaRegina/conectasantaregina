import { linkMaps } from "@/lib/dados";

/** Endereço com link "Como chegar" que abre o Google Maps em nova aba. */
export function LinkEndereco({ endereco }: { endereco: string }) {
  const url = linkMaps(endereco);
  if (!url) return <span>{endereco}</span>;
  return (
    <span className="min-w-0">
      {endereco}{" "}
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="whitespace-nowrap font-semibold text-primary underline hover:text-primary/80"
      >
        Como chegar
      </a>
    </span>
  );
}
