/**
 * M4 — Tracker Paciente (sintoma-first, escala 1-10 visual).
 * - POST /tracker/log              → registra log (paciente)
 * - GET /tracker/:pacienteId       → últimos logs (paciente ou médico)
 * - GET /tracker/:pacienteId/insight → insight semanal IA
 */
import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../lib/auth.js";
import { auditLog } from "../../lib/audit.js";
import { gerarInsightSemanal, listarLogsDoPaciente, registrarLog } from "./service.js";

export async function registrarRotaTracker(app: FastifyInstance): Promise<void> {
  app.post("/tracker/log", async (req, reply) => {
    const auth = await requireAuth(req, reply, ["paciente", "medico", "sistema"]);
    if (!auth) return;
    try {
      const out = await registrarLog(req.body as never, auth.user_id);
      return reply.code(201).send(out);
    } catch (err) {
      return reply.code(400).send({ error: "BadRequest", message: (err as Error).message });
    }
  });

  app.get<{ Params: { pacienteId: string } }>(
    "/tracker/:pacienteId",
    async (req, reply) => {
      const auth = await requireAuth(req, reply, ["paciente", "medico", "admin"]);
      if (!auth) return;
      const logs = listarLogsDoPaciente(req.params.pacienteId, 100);
      auditLog.append({
        entity: "tracker_log",
        entity_id: req.params.pacienteId,
        action: "read",
        user_id: auth.user_id,
        user_role: auth.role,
        payload: { count: logs.length },
      });
      return reply.send({ count: logs.length, logs });
    },
  );

  app.get<{ Params: { pacienteId: string } }>(
    "/tracker/:pacienteId/insight",
    async (req, reply) => {
      const auth = await requireAuth(req, reply, ["medico", "paciente", "admin"]);
      if (!auth) return;
      try {
        const insight = await gerarInsightSemanal(req.params.pacienteId);
        return reply.send(insight);
      } catch (err) {
        return reply
          .code(500)
          .send({ error: "InternalError", message: (err as Error).message });
      }
    },
  );
}
