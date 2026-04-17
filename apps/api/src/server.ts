/**
 * Meridiana API — entrypoint Fastify.
 * MVP 90d: M1 + M2 + M3 + M4 + M5 + M11 (original)
 * + Novos módulos: /auth, /pacientes, /exames, /clinicas, /produtos
 * + Adapters: CFM, ICP-Brasil, WhatsApp, LiveKit, gov.br, Stripe
 */
import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import cookie from "@fastify/cookie";
import { env } from "./env.js";
import { auditLog } from "./lib/audit.js";
import { seedDev } from "./db/store.js";
import { seedRichProntuarioMaria } from "./db/seed-rich.js";
import { registrarRotaTitulacao } from "./modules/titulacao/route.js";
import { registrarRotaProntuario } from "./modules/prontuario/route.js";
import { registrarRotaReceituario } from "./modules/receituario/route.js";
import { registrarRotaTracker } from "./modules/tracker/route.js";
import { registrarRotaTelemedicina } from "./modules/telemedicina/route.js";
import { registrarRotaCompliance } from "./modules/compliance/route.js";
import { registrarRotaAuth } from "./modules/auth/route.js";
import { registrarRotaPacientes } from "./modules/pacientes/route.js";
import { registrarRotaExames } from "./modules/exames/route.js";
import { registrarRotaClinicas } from "./modules/clinicas/route.js";
import { registrarRotaCatalogo } from "./modules/catalogo/route.js";

async function bootstrap(): Promise<void> {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      ...(env.NODE_ENV === "development"
        ? {
            transport: {
              target: "pino-pretty",
              options: { translateTime: "HH:MM:ss", ignore: "pid,hostname" },
            },
          }
        : {}),
    },
  });

  await app.register(sensible);

  // CORS: dev aceita tudo; produção lê WEB_ORIGIN (CSV)
  const allowedOrigins = env.WEB_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean);
  await app.register(cors, {
    origin: (origin, cb) => {
      if (env.NODE_ENV === "development") return cb(null, true);
      if (!origin) return cb(null, true); // curl, server-to-server
      if (allowedOrigins.length === 0) return cb(null, true); // WEB_ORIGIN não configurado
      if (allowedOrigins.some((o) => origin === o || origin.endsWith("." + o.replace(/^https?:\/\//, "")))) {
        return cb(null, true);
      }
      cb(new Error(`CORS bloqueado: ${origin}`), false);
    },
    credentials: true,
  });
  await app.register(cookie, {
    secret: env.JWT_SECRET,
    hook: "onRequest",
  });

  // Seed in-memory: SEMPRE que DB_MODE=memory, inclusive em produção (deploy demo).
  // Produção com DB real usa `pnpm db:seed` após `pnpm db:migrate`.
  if (env.DB_MODE === "memory") {
    const seed = seedDev();
    seedRichProntuarioMaria(seed.prontuario.id);
    app.log.info(
      `[seed] memory mode (demo): medico=${seed.medico.id} paciente=${seed.paciente.id} prontuario=${seed.prontuario.id}`,
    );
  } else if (env.DB_MODE === "prisma") {
    app.log.info(`[db] prisma mode ativo: ${env.DATABASE_URL?.split("@")[1] ?? "???"}`);
  }

  // Healthcheck simples para Railway/Render/Fly (só retorna 200)
  app.get("/health", async () => ({ ok: true }));

  app.get("/healthz", async () => ({
    ok: true,
    service: "meridiana-api",
    version: "0.1.0",
    env: env.NODE_ENV,
    db_mode: env.DB_MODE,
    modulos: [
      "M1-Titulacao",
      "M2-Prontuario",
      "M3-Receita",
      "M4-Tracker",
      "M5-Telemedicina",
      "M11-Compliance",
      "auth",
      "pacientes",
      "exames",
      "clinicas",
      "catalogo",
    ],
    adapters: {
      cfm: env.CFM_ADAPTER,
      icp_brasil: env.ICP_BRASIL_ADAPTER,
      whatsapp: env.WHATSAPP_ADAPTER,
      livekit: env.LIVEKIT_ADAPTER,
      govbr_rdc660: env.GOVBR_RDC660_ADAPTER,
      billing: env.BILLING_ADAPTER,
    },
    ai: {
      gemini_configured: Boolean(env.GEMINI_API_KEY),
      openai_configured: Boolean(env.OPENAI_API_KEY),
      ollama_url: env.OLLAMA_BASE_URL,
    },
    audit: {
      total_events: auditLog.size(),
      chain_ok: auditLog.verifyChain().ok,
    },
    budget: {
      soft_brl_per_patient_month: env.AI_BUDGET_BRL_PER_PATIENT_MONTH,
      hard_brl_per_patient_month: env.AI_BUDGET_HARD_STOP_BRL_PER_PATIENT_MONTH,
    },
  }));

  // Rotas do MVP original usam store in-memory — sempre disponíveis.
  await registrarRotaTitulacao(app);
  await registrarRotaProntuario(app);
  await registrarRotaReceituario(app);
  await registrarRotaTracker(app);
  await registrarRotaTelemedicina(app);
  await registrarRotaCompliance(app);

  // Rotas Prisma-based (auth real, CRUD pacientes, multi-clinic, catálogo, exames)
  // Só registram em DB_MODE=prisma — em memory mode retornam 501 via healthz info.
  if (env.DB_MODE === "prisma") {
    await registrarRotaAuth(app);
    await registrarRotaClinicas(app);
    await registrarRotaPacientes(app);
    await registrarRotaExames(app);
    await registrarRotaCatalogo(app);
    app.log.info("[routes] Prisma-based routes ativas (/auth, /pacientes, /clinicas, /exames, /produtos)");
  } else {
    app.log.info("[routes] DB_MODE=memory — apenas rotas do MVP original disponíveis");
  }

  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
    app.log.info(`📋 Meridiana API rodando em http://localhost:${env.PORT}`);
    app.log.info(`📦 Módulos: M1, M2, M3, M4, M5, M11`);
    app.log.info(`🧪 Demo: bash demo-flow.sh`);
  } catch (err) {
    app.log.error({ err }, "Falha ao iniciar servidor");
    process.exit(1);
  }
}

bootstrap();
