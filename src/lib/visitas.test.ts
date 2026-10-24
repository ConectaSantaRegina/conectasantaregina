import { describe, expect, it } from "vitest";
import { ehRobo, formatarVisitas, jaRegistradoHoje, visitanteAnonimo } from "./visitas";

function mem() {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
}

describe("visitas", () => {
  it("ignora robôs e buscadores", () => {
    expect(ehRobo("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true);
    expect(ehRobo("Mozilla/5.0 (iPhone) Safari/604.1")).toBe(false);
  });
  it("mantém o mesmo identificador no navegador", () => {
    const s = mem();
    const a = visitanteAnonimo(s, () => "11111111-1111-1111-1111-111111111111");
    expect(visitanteAnonimo(s, () => "22222222-2222-2222-2222-222222222222")).toBe(a);
  });
  it("conta no máximo uma vez por dia", () => {
    const s = mem();
    expect(jaRegistradoHoje(s, "x", "2026-10-24")).toBe(false);
    expect(jaRegistradoHoje(s, "x", "2026-10-24")).toBe(true);
    expect(jaRegistradoHoje(s, "x", "2026-10-25")).toBe(false);
  });
  it("formata número brasileiro", () => {
    expect(formatarVisitas(12430)).toBe("12.430");
  });
});
