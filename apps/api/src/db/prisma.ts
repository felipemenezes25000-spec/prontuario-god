/**
 * Prisma client singleton.
 * - Instância única reutilizada entre hot reloads (tsx watch).
 * - Log de queries em dev para visibilidade; silencioso em produção.
 * - Graceful shutdown para flush de conexões.
 */
import { PrismaClient } from "@prisma/client";
import { env } from "../env.js";

declare global {
  // eslint-disable-next-line no-var
  var __meridiana_prisma: PrismaClient | undefined;
}

function create(): PrismaClient {
  return new PrismaClient({
    log:
      env.NODE_ENV === "development"
        ? [{ level: "warn", emit: "stdout" }, { level: "error", emit: "stdout" }]
        : [{ level: "error", emit: "stdout" }],
  });
}

export const prisma: PrismaClient = globalThis.__meridiana_prisma ?? create();

if (env.NODE_ENV !== "production") {
  globalThis.__meridiana_prisma = prisma;
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
