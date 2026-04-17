import { z } from "zod";

/** M2 — Prontuário (criação/leitura) */
export const ProntuarioCreateSchema = z.object({
  paciente_id: z.string(),
  cid10_principal: z.string().optional(),
  cid10_secundarios: z.array(z.string()).default([]),
  evidencia_indicacao: z.enum(["A", "B", "C", "D"]).optional(),
});

export const ConsultaInputSchema = z.object({
  prontuario_id: z.string(),
  /** Texto livre da consulta (substituir por transcrição Whisper em produção) */
  transcricao: z.string().min(20),
  /** Marca como nota_voz se veio de áudio */
  origem: z.enum(["digitada", "voz_transcrita"]).default("digitada"),
});

export const SoapEstruturadoSchema = z.object({
  subjetivo: z.string(),
  objetivo: z.string(),
  avaliacao: z.string(),
  plano: z.string(),
  cid10_sugeridos: z.array(z.string()),
  evidencia_indicacao_cannabis: z.enum(["A", "B", "C", "D"]),
  alertas: z.array(z.string()),
});

export type ProntuarioCreate = z.infer<typeof ProntuarioCreateSchema>;
export type ConsultaInput = z.infer<typeof ConsultaInputSchema>;
export type SoapEstruturado = z.infer<typeof SoapEstruturadoSchema>;
