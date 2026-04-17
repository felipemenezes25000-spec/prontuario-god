import type { FastifyInstance } from "fastify";
import { TitulacaoInputSchema } from "./schema.js";
import { executarTitulacao } from "./service.js";

export async function registrarRotaTitulacao(app: FastifyInstance): Promise<void> {
  app.post("/co-pilot/titulacao", async (request, reply) => {
    const parsed = TitulacaoInputSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: "ValidationError",
        issues: parsed.error.flatten(),
      });
    }

    try {
      const out = await executarTitulacao(parsed.data);
      return reply.code(200).send(out);
    } catch (err) {
      request.log.error({ err }, "Falha em titulacao");
      return reply.code(500).send({
        error: "InternalError",
        message: (err as Error).message,
      });
    }
  });
}
