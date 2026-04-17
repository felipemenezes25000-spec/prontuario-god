/**
 * M3 — Receituário Digital ANVISA.
 * - POST /receita → emite Tipo A/B + Notificação + opcional ofício RDC 660
 */
import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../lib/auth.js";
import { emitirReceita } from "./service.js";

export async function registrarRotaReceituario(app: FastifyInstance): Promise<void> {
  app.post("/receita", async (req, reply) => {
    const auth = await requireAuth(req, reply, ["medico"]);
    if (!auth) return;

    try {
      const out = await emitirReceita(req.body as never, auth.user_id);
      return reply.code(201).send(out);
    } catch (err) {
      return reply
        .code(400)
        .send({ error: "BadRequest", message: (err as Error).message });
    }
  });
}
