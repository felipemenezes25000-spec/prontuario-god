/**
 * M5 — Telemedicina Embedded.
 * - POST /telemedicina/session                → cria session
 * - GET /telemedicina/session/:id/brief       → brief IA pré-consulta
 * - POST /telemedicina/session/:id/start      → marca em_andamento
 * - POST /telemedicina/session/:id/finish     → finaliza, transcreve, vira prontuário evento
 */
import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../lib/auth.js";
import {
  criarSession,
  gerarBriefPreConsulta,
  iniciarSession,
  finalizarSession,
} from "./service.js";

export async function registrarRotaTelemedicina(app: FastifyInstance): Promise<void> {
  app.post("/telemedicina/session", async (req, reply) => {
    const auth = await requireAuth(req, reply, ["medico"]);
    if (!auth) return;
    try {
      const out = await criarSession(req.body as never, auth.user_id);
      return reply.code(201).send(out);
    } catch (err) {
      return reply.code(400).send({ error: "BadRequest", message: (err as Error).message });
    }
  });

  app.get<{ Params: { id: string } }>(
    "/telemedicina/session/:id/brief",
    async (req, reply) => {
      const auth = await requireAuth(req, reply, ["medico"]);
      if (!auth) return;
      try {
        const out = await gerarBriefPreConsulta(req.params.id);
        return reply.send(out);
      } catch (err) {
        return reply
          .code(500)
          .send({ error: "InternalError", message: (err as Error).message });
      }
    },
  );

  app.post<{ Params: { id: string } }>(
    "/telemedicina/session/:id/start",
    async (req, reply) => {
      const auth = await requireAuth(req, reply, ["medico"]);
      if (!auth) return;
      try {
        const out = iniciarSession(req.params.id, auth.user_id);
        return reply.send(out);
      } catch (err) {
        return reply.code(400).send({ error: "BadRequest", message: (err as Error).message });
      }
    },
  );

  app.post<{ Params: { id: string }; Body: { transcricao?: string; gravacao_url?: string } }>(
    "/telemedicina/session/:id/finish",
    async (req, reply) => {
      const auth = await requireAuth(req, reply, ["medico"]);
      if (!auth) return;
      try {
        const out = finalizarSession({
          session_id: req.params.id,
          medico_id: auth.user_id,
          ...(req.body?.transcricao !== undefined ? { transcricao: req.body.transcricao } : {}),
          ...(req.body?.gravacao_url !== undefined ? { gravacao_url: req.body.gravacao_url } : {}),
        });
        return reply.send(out);
      } catch (err) {
        return reply.code(400).send({ error: "BadRequest", message: (err as Error).message });
      }
    },
  );
}
