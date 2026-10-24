import { describe, expect, it } from "vitest";
import { CADASTROS_GRATUITOS, deveMostrarOnboarding } from "./onboarding";

describe("optional first-registration onboarding", () => {
  it("appears after completing the first registration", () => {
    expect(deveMostrarOnboarding({ cadastro_completo_em: "2026-10-14T13:29:00Z", onboarding_concluido: false })).toBe(true);
  });
  it("does not repeat after accepting or dismissing, even in a future session", () => {
    const storedProfile = JSON.parse(JSON.stringify({ cadastro_completo_em: "2026-10-14T13:29:00Z", onboarding_concluido: true }));
    expect(deveMostrarOnboarding(storedProfile)).toBe(false);
  });
  it("waits for mandatory contact registration", () => {
    expect(deveMostrarOnboarding({ cadastro_completo_em: null, onboarding_concluido: false })).toBe(false);
    expect(deveMostrarOnboarding(null)).toBe(false);
  });
  it.each([
    ["comercio", "comercios"], ["vaga", "vagas"], ["imovel", "imoveis"], ["acao", "acoes"],
  ])("sends %s to its existing free listing form", (tipo, tabela) => {
    expect(CADASTROS_GRATUITOS.find((item) => item.tipo === tipo)?.tabela).toBe(tabela);
  });
});