import { z } from "zod";

export const ReceituarioInputSchema = z.object({
  paciente_id: z.string(),
  /** Pode vir do M1 (titulação) */
  produto: z.object({
    nome_comercial: z.string(),
    fabricante: z.string().optional(),
    cbd_mg_por_dose: z.number().nonnegative(),
    thc_mg_por_dose: z.number().nonnegative(),
    via_administracao: z.enum(["oral", "sublingual", "inalada", "dermatologica", "bucal"]),
    forma_farmaceutica: z.enum(["oleo", "capsula", "flor", "dermo", "vape"]).optional(),
  }),
  posologia_texto: z.string().min(5),
  dose_alvo_mg_dia: z.number().positive(),
  duracao_dias: z.number().int().positive(),
  /** Se importado, gera ofício RDC 660 também */
  via_acesso: z.enum([
    "anvisa_industrializado",
    "anvisa_rdc_660_importacao",
    "magistral",
    "associacao_hc",
  ]),
  laudo_clinico: z.string().min(20).optional(),
});

export type ReceituarioInput = z.infer<typeof ReceituarioInputSchema>;

export const ReceituarioOutputSchema = z.object({
  prescricao_id: z.string(),
  tipo_receita: z.enum(["A", "B"]),
  notificacao_receita_numero: z.string(),
  pdf_receita_md: z.string(), // POC: markdown que vira PDF
  pdf_oficio_660_md: z.string().nullable(),
  validade_660_ate: z.string().nullable(),
  status_660: z
    .enum(["nao_aplicavel", "pendente", "submetido", "aprovado", "negado", "expirado"])
    .nullable(),
  alertas: z.array(z.string()),
});

export type ReceituarioOutput = z.infer<typeof ReceituarioOutputSchema>;
