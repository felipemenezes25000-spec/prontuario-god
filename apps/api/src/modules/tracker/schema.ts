import { z } from "zod";

export const TrackerLogInputSchema = z.object({
  paciente_id: z.string(),
  prescricao_id: z.string().optional(),
  dose_mg: z.number().nonnegative().optional(),
  via: z.enum(["oral", "sublingual", "inalada", "dermatologica", "bucal"]).optional(),
  /** Sintoma → escala 1-10 */
  sintomas: z.record(z.number().min(0).max(10)),
  efeitos_colaterais: z.array(z.string()).default([]),
  contexto: z
    .object({
      sono_horas: z.number().nonnegative().optional(),
      estresse_1_10: z.number().min(0).max(10).optional(),
      observacao: z.string().optional(),
    })
    .optional(),
  humor_score: z.number().min(0).max(10).optional(),
  entrada_via: z.enum(["app", "sms", "whatsapp", "voz"]).default("app"),
  transcricao_voz: z.string().optional(),
});

export type TrackerLogInput = z.infer<typeof TrackerLogInputSchema>;

export const TrackerInsightSchema = z.object({
  resumo: z.string(),
  tendencia_principal: z.enum(["melhora", "estavel", "piora"]),
  achados: z.array(z.string()),
  sugestoes_para_medico: z.array(z.string()),
  red_flags: z.array(z.string()),
});

export type TrackerInsight = z.infer<typeof TrackerInsightSchema>;
