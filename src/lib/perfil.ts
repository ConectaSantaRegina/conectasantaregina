import { z } from "zod";

export const cadastroPerfilSchema = z.object({
  nome: z.string().trim().min(5, "Informe seu nome completo.").max(120)
    .refine((nome) => nome.split(/\s+/).length >= 2, "Informe nome e sobrenome."),
  whatsapp: z.string().transform((numero) => numero.replace(/\D/g, ""))
    .refine((numero) => /^([1-9]\d{9,10}|55[1-9]\d{9,10})$/.test(numero), "Informe um WhatsApp válido com DDD."),
  morador: z.enum(["sim", "nao"], { errorMap: () => ({ message: "Informe se você mora no bairro." }) }),
});

export function normalizarPesquisa(valor: string) {
  return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
}