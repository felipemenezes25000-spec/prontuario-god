import { config as loadDotenv } from "dotenv";
import path from "node:path";
import { z } from "zod";

// Carrega .env da raiz do monorepo (default) e da pasta apps/api (override se existir)
loadDotenv({ path: path.resolve(process.cwd(), "../../.env") });
loadDotenv({ path: path.resolve(process.cwd(), ".env"), override: false });


const Schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  LOG_LEVEL: z.string().default("info"),
  // Lista separada por vírgula de origens permitidas (ex: "https://meridiana.vercel.app,https://meridiana.health")
  WEB_ORIGIN: z.string().default(""),

  // --- Persistence ---
  DB_MODE: z.enum(["memory", "prisma"]).default("memory"),
  DATABASE_URL: z.string().optional(),

  // --- Auth ---
  JWT_SECRET: z.string().min(32).default("dev-only-jwt-secret-32bytes-minimum-please-change-prod"),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(7),
  AUTH_COOKIE_NAME: z.string().default("meridiana_refresh"),
  AUTH_COOKIE_SECURE: z.coerce.boolean().default(false),
  BCRYPT_COST: z.coerce.number().int().min(8).max(15).default(12),

  // --- AI ---
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL_DEFAULT: z.string().default("gemini-2.5-flash-lite"),

  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL_DEFAULT: z.string().default("gpt-4o-mini"),

  OLLAMA_BASE_URL: z.string().url().default("http://localhost:11434"),
  OLLAMA_MODEL_PII: z.string().default("llama3.1:8b"),

  AI_BUDGET_BRL_PER_PATIENT_MONTH: z.coerce.number().positive().default(2.5),
  AI_BUDGET_HARD_STOP_BRL_PER_PATIENT_MONTH: z.coerce.number().positive().default(3.0),

  // --- External providers ---
  CFM_ADAPTER: z.enum(["mock", "cfm_portal_scraper"]).default("mock"),
  CFM_REVERIFY_DAYS: z.coerce.number().int().positive().default(30),

  ICP_BRASIL_ADAPTER: z.enum(["mock", "vidaas", "soluti", "birdid"]).default("mock"),
  ICP_BRASIL_VIDAAS_BASE_URL: z.string().url().optional(),
  ICP_BRASIL_CLIENT_ID: z.string().optional(),
  ICP_BRASIL_CLIENT_SECRET: z.string().optional(),

  WHATSAPP_ADAPTER: z.enum(["mock", "meta_cloud"]).default("mock"),
  WHATSAPP_PHONE_ID: z.string().optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().optional(),

  LIVEKIT_ADAPTER: z.enum(["mock", "livekit_cloud"]).default("mock"),
  LIVEKIT_URL: z.string().optional(),
  LIVEKIT_API_KEY: z.string().optional(),
  LIVEKIT_API_SECRET: z.string().optional(),

  GOVBR_RDC660_ADAPTER: z.enum(["mock", "gov_sei_real"]).default("mock"),
  GOVBR_BASE_URL: z.string().url().optional(),
  GOVBR_API_TOKEN: z.string().optional(),

  BILLING_ADAPTER: z.enum(["mock", "stripe", "pagarme"]).default("mock"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  PAGARME_API_KEY: z.string().optional(),

  // --- Compliance / DPO ---
  DPO_EMAIL: z.string().email().default("dpo@meridiana.health"),
  LGPD_DATA_RESIDENCY: z.string().default("BR"),
});

const parsed = Schema.safeParse(process.env);
if (!parsed.success) {
  console.error("[env] Configuração inválida:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
