/**
 * Catálogo de produtos — busca e listagem p/ prescrição.
 *
 * Filtros práticos p/ médico cannabis:
 * - classe (óleo full, isolado, rich THC, flor, tópico)
 * - ratio CBD:THC (auto-calculado via cbd_mg_por_ml / thc_mg_por_ml)
 * - faixa de preço
 * - via regulatória (alguns médicos só querem industrializado p/ simplificar)
 * - disponibilidade
 */
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../db/prisma.js";
import { requireAuth } from "../../lib/auth.js";

const QuerySchema = z.object({
  query: z.string().optional(),
  classe: z.string().optional(),
  fabricante: z.string().optional(),
  status_regulatorio: z.string().optional(),
  ratio_min: z.coerce.number().optional(),       // cbd:thc mínimo (ex: 20 = 20:1 CBD-rich)
  ratio_max: z.coerce.number().optional(),
  preco_max: z.coerce.number().optional(),
  apenas_disponivel: z.coerce.boolean().default(true),
  take: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(),
});

export async function registrarRotaCatalogo(app: FastifyInstance): Promise<void> {
  app.get("/produtos", async (req, reply) => {
    const auth = await requireAuth(req, reply);
    if (!auth) return;

    const q = QuerySchema.parse(req.query);

    const where: Parameters<typeof prisma.produto.findMany>[0] extends infer A
      ? A extends { where?: infer W }
        ? W
        : never
      : never = {
      ...(q.apenas_disponivel ? { disponivel: true } : {}),
      ...(q.classe ? { classe: q.classe as never } : {}),
      ...(q.fabricante ? { fabricante: { equals: q.fabricante, mode: "insensitive" } } : {}),
      ...(q.status_regulatorio ? { status_regulatorio: q.status_regulatorio as never } : {}),
      ...(q.preco_max ? { preco_sugerido_brl: { lte: String(q.preco_max) as never } } : {}),
      ...(q.query
        ? {
            OR: [
              { nome_comercial: { contains: q.query, mode: "insensitive" } },
              { fabricante: { contains: q.query, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const produtos = await prisma.produto.findMany({
      where,
      orderBy: [{ fabricante: "asc" }, { nome_comercial: "asc" }],
      take: q.take + 1,
      ...(q.cursor ? { cursor: { id: q.cursor }, skip: 1 } : {}),
    });

    // Filter ratio em memória (compute é mais complexo que vale SQL)
    const items = produtos.filter((p) => {
      if (q.ratio_min === undefined && q.ratio_max === undefined) return true;
      const cbd = Number(p.cbd_mg_por_ml ?? p.cbd_mg_por_unidade ?? 0);
      const thc = Number(p.thc_mg_por_ml ?? p.thc_mg_por_unidade ?? 0);
      if (thc === 0) {
        return q.ratio_min === undefined || q.ratio_min <= 9999; // isolado = infinity ratio
      }
      const ratio = cbd / thc;
      if (q.ratio_min !== undefined && ratio < q.ratio_min) return false;
      if (q.ratio_max !== undefined && ratio > q.ratio_max) return false;
      return true;
    });

    let next_cursor: string | null = null;
    if (items.length > q.take) {
      const next = items.pop();
      next_cursor = next?.id ?? null;
    }
    return reply.send({ items, next_cursor });
  });

  app.get<{ Params: { id: string } }>("/produtos/:id", async (req, reply) => {
    const auth = await requireAuth(req, reply);
    if (!auth) return;
    const p = await prisma.produto.findUnique({ where: { id: req.params.id } });
    if (!p) return reply.code(404).send({ error: "NotFound" });
    return reply.send(p);
  });

  // Agregações p/ UI (fabricantes, classes)
  app.get("/produtos/_facets", async (req, reply) => {
    const auth = await requireAuth(req, reply);
    if (!auth) return;
    const [fabricantes, classes] = await Promise.all([
      prisma.produto.groupBy({ by: ["fabricante"], _count: true, where: { disponivel: true } }),
      prisma.produto.groupBy({ by: ["classe"], _count: true, where: { disponivel: true } }),
    ]);
    return reply.send({
      fabricantes: fabricantes.map((f) => ({ nome: f.fabricante, count: f._count })),
      classes: classes.map((c) => ({ classe: c.classe, count: c._count })),
    });
  });
}
