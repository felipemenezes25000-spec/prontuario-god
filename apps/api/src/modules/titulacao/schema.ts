import { z } from "zod";

/**
 * Indicações suportadas pela RDC 1.015/2026 + CFM 2.324/22 + literatura.
 * Lista NÃO exaustiva — outras condições podem ser tratadas, mas o sistema só recomenda confiantemente para estas.
 */
export const IndicacaoEnum = z.enum([
  "epilepsia_refrataria",
  "fibromialgia",
  "lupus",
  "dor_cronica",
  "ansiedade",
  "insonia",
  "esclerose_multipla",
  "autismo",
  "parkinson",
  "cancer_dor",
  "endometriose",
  "outra",
]);

export const TitulacaoInputSchema = z.object({
  indicacao: IndicacaoEnum,
  indicacao_outra_descricao: z.string().optional(),
  idade: z.number().int().min(0).max(120),
  peso_kg: z.number().positive().max(300),
  sexo_biologico: z.enum(["masculino", "feminino", "intersexo"]).optional(),
  comorbidades: z.array(z.string()).default([]),
  medicamentos_em_uso: z.array(z.string()).default([]),
  tentativas_previas: z.array(z.string()).default([]),
  alergias: z.array(z.string()).default([]),
  /** Para audit/budget */
  paciente_id: z.string().uuid().optional(),
  /** Especialidade do prescritor — para validar CFM 2.324 quando aplicável */
  especialidade_prescritor: z
    .enum([
      "neurologia",
      "neurologia_pediatrica",
      "psiquiatria",
      "dor",
      "oncologia",
      "geriatria",
      "outra",
    ])
    .optional(),
});

export type TitulacaoInput = z.infer<typeof TitulacaoInputSchema>;

export const TitulacaoOutputSchema = z.object({
  protocolo_recomendado: z.enum(["routine", "conservative", "rapid"]),
  protocolo_justificativa: z.string(),
  produto_sugerido: z.object({
    tipo: z.enum(["CBD-isolado", "CBD-predominante", "balanced-1:1", "THC-predominante"]),
    via_administracao: z.enum(["sublingual", "oral", "inalada", "dermatologica", "bucal"]),
    razao: z.string(),
  }),
  dose_inicial: z.object({
    cbd_mg: z.number(),
    thc_mg: z.number().nullable(),
    frequencia_diaria: z.number().int(),
    via: z.string(),
  }),
  ramp_up: z.array(
    z.object({
      dia: z.number().int(),
      cbd_mg_dia: z.number(),
      thc_mg_dia: z.number().nullable(),
      observacao: z.string(),
    }),
  ),
  red_flags_interacoes: z.array(
    z.object({
      medicamento: z.string(),
      severidade: z.enum(["critica", "alta", "moderada", "baixa"]),
      mecanismo: z.string(),
      recomendacao: z.string(),
    }),
  ),
  alerta_compliance: z.object({
    receita_tipo: z.enum(["A", "B"]),
    via_regulatoria: z.enum([
      "anvisa_industrializado",
      "anvisa_rdc_660_importacao",
      "magistral",
      "associacao_hc",
    ]),
    observacao_cfm: z.string().nullable(),
  }),
  evidencia: z.object({
    nivel: z.enum(["A", "B", "C", "D"]),
    referencias: z.array(z.string()),
  }),
  proximos_passos: z.array(z.string()),
  disclaimer: z.string(),
});

export type TitulacaoOutput = z.infer<typeof TitulacaoOutputSchema>;
