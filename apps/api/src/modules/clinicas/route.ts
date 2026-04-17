/**
 * Clínicas — multi-tenant.
 *
 * Hierarquia de permissões dentro de uma clínica:
 * - owner: tudo (inclui billing + exclusão da clínica)
 * - admin: tudo exceto billing + exclusão
 * - medico: apenas próprios pacientes
 * - recepcao: agenda telemed + cria pacientes, sem acesso a prontuário
 * - financeiro: billing e relatórios sem acesso clínico
 *
 * Cada User pode pertencer a múltiplas clínicas (ClinicMembership).
 * O JWT inclui clinic_id da clínica "ativa" (switch via /clinicas/:id/ativar).
 */
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../db/prisma.js";
import { requireAuth } from "../../lib/auth.js";
import { auditLog } from "../../lib/audit.js";

const CreateClinicSchema = z.object({
  razao_social: z.string().min(3),
  nome_fantasia: z.string().min(3),
  cnpj: z.string().regex(/^\d{14}$/),
  cnes: z.string().optional(),
  endereco_json: z.object({
    logradouro: z.string(),
    numero: z.string(),
    cep: z.string().regex(/^\d{8}$/),
    uf: z.string().length(2),
    municipio: z.string(),
    ibge: z.string().optional(),
  }),
  telefone_e164: z.string().regex(/^\+\d{10,15}$/).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
});

const AddMemberSchema = z.object({
  user_email: z.string().email(),
  role: z.enum(["owner", "admin", "medico", "recepcao", "financeiro"]),
});

export async function registrarRotaClinicas(app: FastifyInstance): Promise<void> {
  // Listar clínicas do usuário autenticado
  app.get("/clinicas", async (req, reply) => {
    const auth = await requireAuth(req, reply);
    if (!auth) return;
    const memberships = await prisma.clinicMembership.findMany({
      where: { user_id: auth.user_id, deleted_at: null },
      include: { clinic: true },
    });
    const items = memberships.map((m) => ({
      id: m.clinic.id,
      nome_fantasia: m.clinic.nome_fantasia,
      cnpj: m.clinic.cnpj,
      plano: m.clinic.plano,
      role: m.role,
    }));
    return reply.send({ items });
  });

  // Criar nova clínica → usuário vira owner
  app.post("/clinicas", async (req, reply) => {
    const auth = await requireAuth(req, reply, ["medico", "admin"]);
    if (!auth) return;
    const parsed = CreateClinicSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "ValidationError", issues: parsed.error.issues });
    }
    const existing = await prisma.clinic.findUnique({ where: { cnpj: parsed.data.cnpj } });
    if (existing) return reply.code(409).send({ error: "Conflict", message: "CNPJ já cadastrado" });

    const clinic = await prisma.$transaction(async (tx) => {
      const c = await tx.clinic.create({
        data: {
          razao_social: parsed.data.razao_social,
          nome_fantasia: parsed.data.nome_fantasia,
          cnpj: parsed.data.cnpj,
          cnes: parsed.data.cnes ?? null,
          endereco_json: parsed.data.endereco_json,
          telefone_e164: parsed.data.telefone_e164 ?? null,
          email: parsed.data.email ?? null,
          website: parsed.data.website ?? null,
          plano: "solo",
        },
      });
      await tx.clinicMembership.create({
        data: { clinic_id: c.id, user_id: auth.user_id, role: "owner" },
      });
      return c;
    });
    auditLog.append({
      user_id: auth.user_id,
      user_role: auth.role,
      action: "user_created",
      entity: "clinic",
      entity_id: clinic.id,
      payload: { razao_social: clinic.razao_social },
    });
    return reply.code(201).send(clinic);
  });

  // Adicionar membro (owner/admin only)
  app.post<{ Params: { id: string } }>("/clinicas/:id/membros", async (req, reply) => {
    const auth = await requireAuth(req, reply);
    if (!auth) return;

    const myMembership = await prisma.clinicMembership.findUnique({
      where: { clinic_id_user_id: { clinic_id: req.params.id, user_id: auth.user_id } },
    });
    if (!myMembership || !["owner", "admin"].includes(myMembership.role)) {
      return reply.code(403).send({ error: "Forbidden", message: "Apenas owner/admin" });
    }

    const parsed = AddMemberSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "ValidationError", issues: parsed.error.issues });
    }

    const targetUser = await prisma.user.findUnique({ where: { email: parsed.data.user_email } });
    if (!targetUser) return reply.code(404).send({ error: "Usuário não encontrado" });

    const m = await prisma.clinicMembership.upsert({
      where: { clinic_id_user_id: { clinic_id: req.params.id, user_id: targetUser.id } },
      create: {
        clinic_id: req.params.id,
        user_id: targetUser.id,
        role: parsed.data.role,
      },
      update: { role: parsed.data.role, deleted_at: null },
    });
    return reply.code(201).send(m);
  });

  // Remover membro
  app.delete<{ Params: { id: string; user_id: string } }>(
    "/clinicas/:id/membros/:user_id",
    async (req, reply) => {
      const auth = await requireAuth(req, reply);
      if (!auth) return;
      const myMembership = await prisma.clinicMembership.findUnique({
        where: { clinic_id_user_id: { clinic_id: req.params.id, user_id: auth.user_id } },
      });
      if (!myMembership || !["owner", "admin"].includes(myMembership.role)) {
        return reply.code(403).send({ error: "Forbidden" });
      }
      await prisma.clinicMembership.update({
        where: { clinic_id_user_id: { clinic_id: req.params.id, user_id: req.params.user_id } },
        data: { deleted_at: new Date() },
      });
      return reply.code(204).send();
    },
  );

  // Listar membros
  app.get<{ Params: { id: string } }>("/clinicas/:id/membros", async (req, reply) => {
    const auth = await requireAuth(req, reply);
    if (!auth) return;
    const myMembership = await prisma.clinicMembership.findUnique({
      where: { clinic_id_user_id: { clinic_id: req.params.id, user_id: auth.user_id } },
    });
    if (!myMembership) return reply.code(403).send({ error: "Forbidden" });

    const members = await prisma.clinicMembership.findMany({
      where: { clinic_id: req.params.id, deleted_at: null },
      include: { user: { select: { id: true, nome_completo: true, email: true, role: true } } },
    });
    return reply.send({ items: members });
  });
}
