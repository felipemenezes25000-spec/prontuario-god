/**
 * Exames laboratoriais — módulo.
 *
 * Relevância cannabis:
 * - Função hepática (AST/ALT) antes e durante uso crônico de CBD (CYP450 metabolism)
 * - Renal (creatinina, clearance) — especial em idosos
 * - Hemograma — uso de THC pode afetar contagem em situações específicas
 * - Toxicológico — monitorar uso em casos específicos (pediatria, dependência)
 *
 * Upload: recebe multipart PDF/imagem → grava hash SHA-256 + URL
 * Parsing: inicialmente manual (profissional digita); futuro = IA extrai valores
 */
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { requireAuth } from "../../lib/auth.js";
import { auditLog } from "../../lib/audit.js";

const TipoExameZ = z.enum([
  "hemograma",
  "funcao_renal",
  "funcao_hepatica",
  "lipidograma",
  "glicemia",
  "hormonios",
  "urinalise",
  "toxicologico",
  "outros",
]);

const CreateSchema = z.object({
  paciente_id: z.string(),
  tipo: TipoExameZ,
  titulo: z.string().min(3).max(200),
  data_coleta: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  laboratorio: z.string().optional(),
  medico_solicitante_id: z.string().optional(),
  arquivo_url: z.string().url().optional(),
  arquivo_sha256: z.string().length(64).optional(),
  resultados_json: z
    .array(
      z.object({
        analito: z.string(),
        valor: z.union([z.number(), z.string()]),
        unidade: z.string().optional(),
        ref_min: z.number().optional(),
        ref_max: z.number().optional(),
        alterado: z.boolean().optional(),
      }),
    )
    .optional(),
  observacoes: z.string().optional(),
});

export async function registrarRotaExames(app: FastifyInstance): Promise<void> {
  app.get<{ Querystring: { paciente_id: string; tipo?: string } }>("/exames", async (req, reply) => {
    const auth = await requireAuth(req, reply);
    if (!auth) return;
    const paciente_id = req.query.paciente_id;
    if (!paciente_id) return reply.code(400).send({ error: "paciente_id obrigatório" });

    const exames = await prisma.exameLaboratorial.findMany({
      where: {
        paciente_id,
        deleted_at: null,
        ...(req.query.tipo ? { tipo: req.query.tipo as never } : {}),
      },
      orderBy: { data_coleta: "desc" },
    });
    return reply.send({ items: exames });
  });

  app.post("/exames", async (req, reply) => {
    const auth = await requireAuth(req, reply, ["medico", "admin"]);
    if (!auth) return;
    const parsed = CreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "ValidationError", issues: parsed.error.issues });
    }
    const exame = await prisma.exameLaboratorial.create({
      data: {
        paciente_id: parsed.data.paciente_id,
        tipo: parsed.data.tipo,
        titulo: parsed.data.titulo,
        data_coleta: new Date(parsed.data.data_coleta),
        laboratorio: parsed.data.laboratorio ?? null,
        medico_solicitante_id: parsed.data.medico_solicitante_id ?? null,
        arquivo_url: parsed.data.arquivo_url ?? null,
        arquivo_sha256: parsed.data.arquivo_sha256 ?? null,
        resultados_json: (parsed.data.resultados_json ?? Prisma.DbNull) as Prisma.InputJsonValue,
        observacoes: parsed.data.observacoes ?? null,
      },
    });
    auditLog.append({
      user_id: auth.user_id,
      user_role: auth.role,
      action: "create",
      entity: "exame",
      entity_id: exame.id,
      payload: { paciente_id: exame.paciente_id, tipo: exame.tipo },
    });
    return reply.code(201).send(exame);
  });

  app.get<{ Params: { id: string } }>("/exames/:id", async (req, reply) => {
    const auth = await requireAuth(req, reply);
    if (!auth) return;
    const e = await prisma.exameLaboratorial.findUnique({ where: { id: req.params.id } });
    if (!e || e.deleted_at) return reply.code(404).send({ error: "NotFound" });
    return reply.send(e);
  });

  app.delete<{ Params: { id: string } }>("/exames/:id", async (req, reply) => {
    const auth = await requireAuth(req, reply, ["medico", "admin"]);
    if (!auth) return;
    await prisma.exameLaboratorial.update({
      where: { id: req.params.id },
      data: { deleted_at: new Date() },
    });
    return reply.code(204).send();
  });

  /**
   * Timeline: exames do paciente agrupados por tipo, p/ visualização temporal.
   * Útil para ver evolução hepática durante titulação de CBD.
   */
  app.get<{ Params: { paciente_id: string } }>(
    "/pacientes/:paciente_id/exames/timeline",
    async (req, reply) => {
      const auth = await requireAuth(req, reply);
      if (!auth) return;
      const exames = await prisma.exameLaboratorial.findMany({
        where: { paciente_id: req.params.paciente_id, deleted_at: null },
        orderBy: { data_coleta: "asc" },
      });
      const porTipo: Record<string, typeof exames> = {};
      for (const e of exames) {
        (porTipo[e.tipo] ??= []).push(e);
      }
      return reply.send({ paciente_id: req.params.paciente_id, por_tipo: porTipo });
    },
  );
}
