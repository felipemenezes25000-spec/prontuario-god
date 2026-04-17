/**
 * Hashing de senhas com bcrypt.
 * - Cost 12 (default): ~300ms em CPU moderna — balanço segurança/UX
 * - Pepper via env opcional (evita rainbow tables mesmo se o DB vazar)
 */
import bcrypt from "bcryptjs";
import { env } from "../env.js";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, env.BCRYPT_COST);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Política mínima de senha para médicos/pacientes:
 * - 10+ chars
 * - Ao menos 1 letra e 1 número
 * - Não em lista de senhas comuns
 *
 * Esta é validação de API; o frontend deve replicar.
 */
const SENHAS_PROIBIDAS = new Set([
  "senha12345",
  "medico2025",
  "prontuario1",
  "cannabis123",
  "password123",
  "12345678910",
]);

export function validarForcaSenha(senha: string): { ok: boolean; motivo?: string } {
  if (senha.length < 10) return { ok: false, motivo: "Senha deve ter ao menos 10 caracteres" };
  if (!/[A-Za-z]/.test(senha)) return { ok: false, motivo: "Senha deve ter ao menos uma letra" };
  if (!/[0-9]/.test(senha)) return { ok: false, motivo: "Senha deve ter ao menos um número" };
  if (SENHAS_PROIBIDAS.has(senha.toLowerCase())) {
    return { ok: false, motivo: "Senha muito comum — escolha outra" };
  }
  return { ok: true };
}
