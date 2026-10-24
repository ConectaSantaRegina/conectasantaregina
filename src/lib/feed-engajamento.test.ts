import { describe, expect, it } from "vitest";
import { dispositivoCompartilhamento, linkPublicacao, somarMetricas } from "./feed-engajamento";

describe("Feed engagement rules", () => {
  it("sums only the owner's publications", () => {
    expect(somarMetricas(["minha"], [
      { publicacao_id: "minha", curtidas: 3, compartilhamentos: 2 },
      { publicacao_id: "outra", curtidas: 100, compartilhamentos: 200 },
    ])).toEqual({ curtidas: 3, compartilhamentos: 2 });
  });
  it("keeps the same device identifier for repeated shares", () => {
    const valores = new Map<string, string>();
    const storage = { getItem: (key: string) => valores.get(key) ?? null, setItem: (key: string, value: string) => { valores.set(key, value); } };
    const id = "11111111-1111-4111-8111-111111111111";
    expect(dispositivoCompartilhamento(storage, () => id)).toBe(id);
    expect(dispositivoCompartilhamento(storage, () => "22222222-2222-4222-8222-222222222222")).toBe(id);
  });
  it("links directly to the selected publication", () => {
    expect(linkPublicacao("https://www.conectasantaregina.com.br", "abc")).toBe("https://www.conectasantaregina.com.br/?publicacao=abc#publicacao-abc");
  });
});