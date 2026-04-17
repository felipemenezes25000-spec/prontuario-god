/**
 * M11 — Compliance Engine.
 * - GET /compliance/audit                → últimos eventos de audit
 * - GET /compliance/audit/verify         → verifica integridade do hash chain
 * - POST /compliance/regulacao/diff      → resumo IA de mudança regulatória (DOU/CFM)
 */
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { auditLog } from "../../lib/audit.js";
import { aiRouter } from "../../lib/ai-router.js";
import { requireAuth } from "../../lib/auth.js";

const RegulacaoDiffInputSchema = z.object({
  fonte: z.enum(["anvisa_dou", "cfm_resolucao", "stj_decisao"]),
  numero: z.string(),
  publicado_em: z.string(),
  texto: z.string().min(20),
});

const RegulacaoDiffOutputSchema = z.object({
  resumo: z.string(),
  relevancia: z.enum(["critica", "alta", "media", "baixa"]),
  modulos_afetados: z.array(z.string()),
  acoes_sugeridas: z.array(z.string()),
});

export async function registrarRotaCompliance(app: FastifyInstance): Promise<void> {
  app.get("/compliance/audit", async (req, reply) => {
    const auth = await requireAuth(req, reply, ["dpo", "admin", "medico"]);
    if (!auth) return;
    const limit = Math.min(Number((req.query as { limit?: string })?.limit ?? 50), 500);
    const events = auditLog.list({ limit });
    return reply.send({ count: events.length, events });
  });

  app.get("/compliance/audit/verify", async (req, reply) => {
    const auth = await requireAuth(req, reply, ["dpo", "admin"]);
    if (!auth) return;
    const result = auditLog.verifyChain();
    return reply.send({ ...result, total_events: auditLog.size() });
  });

  app.post("/compliance/regulacao/diff", async (req, reply) => {
    const auth = await requireAuth(req, reply, ["dpo", "admin", "sistema"]);
    if (!auth) return;
    const parsed = RegulacaoDiffInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "ValidationError", issues: parsed.error.flatten() });
    }

    const result = await aiRouter.invoke({
      task: "regulacao.diff",
      systemPrompt:
        "Você é um analista regulatório de cannabis medicinal no Brasil. Recebe um texto de norma " +
        "(ANVISA RDC, CFM Resolução, STJ decisão) e retorna JSON com resumo curto, classificação " +
        "de relevância para o sistema Meridiana, módulos afetados (M1-M14) e ações sugeridas.",
      userPrompt: `Fonte: ${parsed.data.fonte}\nNúmero: ${parsed.data.numero}\nPublicado: ${parsed.data.publicado_em}\n\nTEXTO:\n${parsed.data.texto}`,
      schema: RegulacaoDiffOutputSchema,
      cacheable: true,
    });

    auditLog.append({
      entity: "regulacao",
      entity_id: parsed.data.numero,
      action: "regulacao_diff",
      user_id: auth.user_id,
      user_role: auth.role,
      payload: { fonte: parsed.data.fonte, relevancia: result.data.relevancia },
    });

    return reply.send({
      ...result.data,
      _ai: {
        modelo: result.model,
        provider: result.provider,
        cost_brl: result.cost_brl,
        cache_hit: result.cache_hit,
      },
    });
  });
}
