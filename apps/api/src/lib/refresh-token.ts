/**
 * Refresh tokens — armazenados no Postgres como SHA-256 (nunca plain).
 *
 * Fluxo:
 * 1. Login → gera refresh (uuid v4 base64url) → salva hash no DB
 * 2. Browser recebe cookie httpOnly com o token plano
 * 3. /auth/refresh → hash do cookie, lookup no DB, gera novo access + rotate refresh
 * 4. Logout → marca revoked_at no DB
 *
 * Rotação em cada refresh = detecta replay de token vazado (se ambos usam o mesmo refresh,
 * o segundo falha porque já foi rotacionado).
 */
import { createHash, randomBytes } from "node:crypto";
import { env } from "../env.js";
import { prisma } from "../db/prisma.js";

export function hashRefresh(plain: string): string {
  return createHash("sha256").update(plain).digest("hex");
}

export function generateRefreshToken(): string {
  return randomBytes(48).toString("base64url");
}

export async function issueRefresh(params: {
  user_id: string;
  user_agent?: string | undefined;
  ip?: string | undefined;
}): Promise<{ plain: string; expires_at: Date }> {
  const plain = generateRefreshToken();
  const token_hash = hashRefresh(plain);
  const expires_at = new Date(Date.now() + env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      user_id: params.user_id,
      token_hash,
      expires_at,
      user_agent: params.user_agent ?? null,
      ip: params.ip ?? null,
    },
  });
  return { plain, expires_at };
}

export async function rotateRefresh(
  oldPlain: string,
  userAgent?: string | undefined,
  ip?: string | undefined,
): Promise<{ user_id: string; plain: string; expires_at: Date } | null> {
  const hash = hashRefresh(oldPlain);
  const existing = await prisma.refreshToken.findUnique({ where: { token_hash: hash } });
  if (!existing || existing.revoked_at || existing.expires_at < new Date()) {
    return null;
  }
  // Revoga o antigo e emite um novo
  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revoked_at: new Date() },
  });
  const fresh = await issueRefresh({ user_id: existing.user_id, user_agent: userAgent, ip });
  return { user_id: existing.user_id, ...fresh };
}

export async function revokeAllForUser(user_id: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { user_id, revoked_at: null },
    data: { revoked_at: new Date() },
  });
}
