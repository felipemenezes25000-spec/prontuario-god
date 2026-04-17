/**
 * Pacientes — rotas REST.
 *
 * GET    /pacientes                    — list (filtered + paginated)
 * POST   /pacientes                    — create
 * GET    /pacientes/:id                — read
 * PATCH  /pacientes/:id                — update
 * DELETE /pacientes/:id                — soft-delete (retenção 20 anos)
 */
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../lib/auth.js";
import * as svc from "./service.js";

const CreateSchema = z.object({
  nome_completo: z.string().min(3).max(200),
  cpf: z.string().min(11).max(14),
  data_nascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  sexo_biologico: z.enum(["masculino", "feminino", "intersexo", "nao_informado"]).optional(),
  peso_kg: z.number().positive().optional(),
  altura_cm: z.number().int().positive().optional(),
  comorbidades: z.array(z.string()).optional(),
  medicamentos_em_uso: z.array(z.string()).optional(),
  alergias: z.array(z.string()).optional(),
  via_acesso_preferida: z
    .enum([
      "anvisa_industrializado",
      "anvisa_rdc_660_importacao",
      "magistral",
      "associacao_hc",
      "cultivo_hc",
    ])
    .optional(),
  email: z.string().email().optional(),
  telefone_e164: z.string().regex(/^\+\d{10,15}$/).optional(),
  responsavel_legal_nome: z.string().optional(),
  responsavel_legal_cpf: z.string().optional(),
  clinic_id: z.string().optional(),
  medico_responsavel_id: z.string(),
  consentimento_clinico: z.literal(true),
});

const UpdateSchema = CreateSchema.partial().omit({ cpf: true, medico_responsavel_id: true, consentimento_clinico: true });

const QuerySchema = z.object({
  query: z.string().optional(),
  medico_responsavel_id: z.string().optional(),
  cursor: z.string().optional(),
  take: z.coerce.number().int().min(1).max(100).optional(),
  incluir_deletados: z.coerce.boolean().optional(),
});

export async function registrarRotaPacientes(app: FastifyInstance): Promise<void> {
  app.get("/pacientes", async (req, reply) => {
    const auth = await requireAuth(req, reply, ["medico", "admin", "paciente"]);
    if (!auth) return;
    const parsed = QuerySchema.safeParse(req.query);
    if (!parsed.success) return reply.code(400).send({ error: "ValidationError", issues: parsed.error.issues });
    const result = await svc.listarPacientes(auth, {
      query: parsed.data.query,
      medico_responsavel_id: parsed.data.medico_responsavel_id,
      cursor: parsed.data.cursor,
      take: parsed.data.take,
      incluir_deletados: parsed.data.incluir_deletados,
    });
    return reply.send(result);
  });

  app.post("/pacientes", async (req, reply) => {
    const auth = await requireAuth(req, reply, ["medico", "admin"]);
    if (!auth) return;
    const parsed = CreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "ValidationError", issues: parsed.error.issues });
    }
    try {
      const p = await svc.criarPaciente(auth, parsed.data as svc.CriarPacienteInput);
      return reply.code(201).send(p);
    } catch (err) {
      return reply.code(400).send({ error: "BadRequest", message: (err as Error).message });
    }
  });

  app.get<{ Params: { id: string } }>("/pacientes/:id", async (req, reply) => {
    const auth = await requireAuth(req, reply);
    if (!auth) return;
    const p = await svc.obterPaciente(auth, req.params.id);
    if (!p) return reply.code(404).send({ error: "NotFound" });
    return reply.send(p);
  });

  app.patch<{ Params: { id: string } }>("/pacientes/:id", async (req, reply) => {
    const auth = await requireAuth(req, reply, ["medico", "admin"]);
    if (!auth) return;
    const parsed = UpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "ValidationError", issues: parsed.error.issues });
    }
    try {
      const p = await svc.atualizarPaciente(auth, req.params.id, parsed.data as svc.AtualizarPacienteInput);
      return reply.send(p);
    } catch (err) {
      return reply.code(400).send({ error: "BadRequest", message: (err as Error).message });
    }
  });

  app.delete<{ Params: { id: string } }>("/pacientes/:id", async (req, reply) => {
    const auth = await requireAuth(req, reply, ["medico", "admin"]);
    if (!auth) return;
    try {
      await svc.deletarPaciente(auth, req.params.id);
      return reply.code(204).send();
    } catch (err) {
      return reply.code(400).send({ error: "BadRequest", message: (err as Error).message });
    }
  });
}
