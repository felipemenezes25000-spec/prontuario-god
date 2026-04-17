/**
 * M2 — Prontuário (Cannabis-Native).
 * - POST /prontuario           → cria
 * - GET /prontuario/:id        → lê com eventos
 * - POST /prontuario/:id/consulta → registra consulta (texto ou voz transcrita) + auto-SOAP IA
 * - GET /paciente/:id/full     → retorna paciente + prontuário ativo + eventos + prescrições + logs
 */
import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../lib/auth.js";
import { auditLog } from "../../lib/audit.js";
import { repos } from "../../db/store.js";
import {
  criarProntuario,
  registrarConsulta,
  obterProntuarioCompleto,
} from "./service.js";

export async function registrarRotaProntuario(app: FastifyInstance): Promise<void> {
  app.post("/prontuario", async (req, reply) => {
    const auth = await requireAuth(req, reply, ["medico"]);
    if (!auth) return;

    try {
      const out = await criarProntuario(req.body as never, auth.user_id);
      return reply.code(201).send(out);
    } catch (err) {
      return reply.code(400).send({ error: "BadRequest", message: (err as Error).message });
    }
  });

  app.get<{ Params: { id: string } }>("/prontuario/:id", async (req, reply) => {
    const auth = await requireAuth(req, reply, ["medico", "admin"]);
    if (!auth) return;

    const data = obterProntuarioCompleto(req.params.id);
    if (!data) return reply.code(404).send({ error: "NotFound" });

    auditLog.append({
      entity: "prontuario",
      entity_id: req.params.id,
      action: "read",
      user_id: auth.user_id,
      user_role: auth.role,
      payload: { prontuario_id: req.params.id },
    });

    return reply.send(data);
  });

  app.post<{ Params: { id: string } }>(
    "/prontuario/:id/consulta",
    async (req, reply) => {
      const auth = await requireAuth(req, reply, ["medico"]);
      if (!auth) return;

      try {
        const body = { ...(req.body as object), prontuario_id: req.params.id };
        const out = await registrarConsulta(body as never, auth.user_id);
        return reply.code(201).send(out);
      } catch (err) {
        return reply
          .code(500)
          .send({ error: "InternalError", message: (err as Error).message });
      }
    },
  );

  // Full view — tudo que a UI precisa para renderizar o prontuário
  app.get<{ Params: { id: string } }>(
    "/paciente/:id/full",
    async (req, reply) => {
      const auth = await requireAuth(req, reply, ["medico", "admin"]);
      if (!auth) return;

      const paciente = repos.pacientes.get(req.params.id);
      if (!paciente) return reply.code(404).send({ error: "NotFound" });

      // Prontuário mais recente do paciente (criar se não existir)
      let prontuario = repos.prontuarios
        .list((p) => p.paciente_id === paciente.id)
        .sort((a, b) => b.criado_em.localeCompare(a.criado_em))[0];

      if (!prontuario) {
        prontuario = await criarProntuario(
          { paciente_id: paciente.id, cid10_secundarios: [] },
          auth.user_id,
        );
      }

      const eventos = repos.prontuarioEventos
        .list((e) => e.prontuario_id === prontuario!.id)
        .sort((a, b) => b.criado_em.localeCompare(a.criado_em));

      const prescricoes = repos.prescricoes
        .list((p) => p.paciente_id === paciente.id)
        .sort((a, b) => b.criado_em.localeCompare(a.criado_em));

      const tracker_logs = repos.trackerLogs
        .list((l) => l.paciente_id === paciente.id)
        .sort((a, b) => b.criado_em.localeCompare(a.criado_em));

      auditLog.append({
        entity: "paciente_full",
        entity_id: paciente.id,
        action: "read",
        user_id: auth.user_id,
        user_role: auth.role,
        payload: { paciente_id: paciente.id },
      });

      return reply.send({ paciente, prontuario, eventos, prescricoes, tracker_logs });
    },
  );
}
