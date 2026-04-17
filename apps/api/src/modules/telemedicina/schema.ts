import { z } from "zod";

export const SessionCreateSchema = z.object({
  paciente_id: z.string(),
  agendado_para: z.string(), // ISO datetime
});

export const SessionStartSchema = z.object({
  session_id: z.string(),
});

export const SessionFinishSchema = z.object({
  session_id: z.string(),
  transcricao: z.string().optional(),
  gravacao_url: z.string().url().optional(),
});

export const PreConsultaBriefSchema = z.object({
  resumo_paciente: z.string(),
  pontos_principais: z.array(z.string()),
  perguntas_sugeridas: z.array(z.string()),
  alertas: z.array(z.string()),
});

export type SessionCreate = z.infer<typeof SessionCreateSchema>;
export type SessionStart = z.infer<typeof SessionStartSchema>;
export type SessionFinish = z.infer<typeof SessionFinishSchema>;
export type PreConsultaBrief = z.infer<typeof PreConsultaBriefSchema>;
