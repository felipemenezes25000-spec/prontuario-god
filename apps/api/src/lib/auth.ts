/**
 * Auth — JWT access (15min) + refresh cookie httpOnly (7d, hash no DB).
 *
 * Compat: segue aceitando headers `x-user-id` + `x-user-role` quando AUTH_MODE=legacy
 * ou quando o token JWT não é enviado. Isto permite que demos curl existentes (M1..M11)
 * continuem funcionando enquanto o frontend migra para JWT real.
 *
 * Roles: medico, paciente, admin, dpo, sistema.
 */
import type { FastifyReply, FastifyRequest } from "fastify";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../env.js";

export type Role = "medico" | "paciente" | "admin" | "dpo" | "sistema";

export interface AuthContext {
  user_id: string;
  role: Role;
  clinic_id?: string | undefined;
  mfa_verified?: boolean | undefined;
}

declare module "fastify" {
  interface FastifyRequest {
    auth?: AuthContext;
  }
}

// ---------- JWT helpers ----------

export interface AccessTokenPayload {
  sub: string;          // user_id
  role: Role;
  clinic_id?: string | undefined;
  mfa: boolean;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const opts: SignOptions = {
    algorithm: "HS256",
    expiresIn: env.JWT_ACCESS_TTL as NonNullable<SignOptions["expiresIn"]>,
    issuer: "meridiana",
    audience: "meridiana-api",
  };
  const clean: Record<string, unknown> = { sub: payload.sub, role: payload.role, mfa: payload.mfa };
  if (payload.clinic_id !== undefined) clean.clinic_id = payload.clinic_id;
  return jwt.sign(clean, env.JWT_SECRET, opts);
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "meridiana",
      audience: "meridiana-api",
    });
    if (typeof decoded === "string") return null;
    return decoded as unknown as AccessTokenPayload;
  } catch {
    return null;
  }
}

// ---------- Middlewares ----------

const VALID_ROLES: Role[] = ["medico", "paciente", "admin", "dpo", "sistema"];

function extractBearer(req: FastifyRequest): string | null {
  const hdr = req.headers.authorization;
  if (!hdr) return null;
  const match = /^Bearer\s+(.+)$/i.exec(hdr);
  return match?.[1] ?? null;
}

export async function requireAuth(
  req: FastifyRequest,
  reply: FastifyReply,
  allowed?: Role[],
): Promise<AuthContext | null> {
  // 1) Tenta JWT primeiro
  const bearer = extractBearer(req);
  if (bearer) {
    const payload = verifyAccessToken(bearer);
    if (!payload) {
      reply.code(401).send({ error: "Unauthorized", message: "Token inválido ou expirado" });
      return null;
    }
    const ctx: AuthContext = {
      user_id: payload.sub,
      role: payload.role,
      mfa_verified: payload.mfa,
      ...(payload.clinic_id !== undefined ? { clinic_id: payload.clinic_id } : {}),
    };
    if (allowed && !allowed.includes(ctx.role)) {
      reply.code(403).send({
        error: "Forbidden",
        message: `Role ${ctx.role} não autorizada. Necessário: ${allowed.join(", ")}`,
      });
      return null;
    }
    req.auth = ctx;
    return ctx;
  }

  // 2) Fallback p/ demos legadas: x-user-id + x-user-role
  const user_id = req.headers["x-user-id"] as string | undefined;
  const role = req.headers["x-user-role"] as Role | undefined;

  if (!user_id || !role) {
    reply.code(401).send({
      error: "Unauthorized",
      message: "Bearer token ausente. Use Authorization: Bearer <jwt> ou (legacy) headers x-user-id + x-user-role.",
    });
    return null;
  }

  if (!VALID_ROLES.includes(role)) {
    reply.code(401).send({ error: "Unauthorized", message: `Role inválida: ${role}` });
    return null;
  }

  if (allowed && !allowed.includes(role)) {
    reply.code(403).send({
      error: "Forbidden",
      message: `Role ${role} não autorizada. Necessário: ${allowed.join(", ")}`,
    });
    return null;
  }

  const ctx: AuthContext = { user_id, role };
  req.auth = ctx;
  return ctx;
}
