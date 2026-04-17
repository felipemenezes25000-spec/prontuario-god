import { aiRouter } from "../../lib/ai-router.js";
import { auditLog } from "../../lib/audit.js";
import { repos, type TrackerLog } from "../../db/store.js";
import {
  TrackerLogInputSchema,
  TrackerInsightSchema,
  type TrackerLogInput,
  type TrackerInsight,
} from "./schema.js";

export async function registrarLog(input: TrackerLogInput, userId: string): Promise<TrackerLog> {
  const parsed = TrackerLogInputSchema.parse(input);

  const paciente = repos.pacientes.get(parsed.paciente_id);
  if (!paciente) throw new Error(`Paciente ${parsed.paciente_id} não encontrado`);

  const log = repos.trackerLogs.insert(parsed as never);

  auditLog.append({
    entity: "tracker_log",
    entity_id: log.id,
    action: "create",
    user_id: userId,
    user_role: "paciente",
    payload: { paciente_id: parsed.paciente_id, entrada_via: parsed.entrada_via },
  });

  return log;
}

export function listarLogsDoPaciente(pacienteId: string, limit = 100): TrackerLog[] {
  return repos.trackerLogs
    .list((l) => l.paciente_id === pacienteId)
    .sort((a, b) => b.criado_em.localeCompare(a.criado_em))
    .slice(0, limit);
}

const INSIGHT_SYSTEM_PROMPT = `Você é um analista clínico de cannabis medicinal. Recebe diário de tracking de um paciente
(últimas 1-2 semanas) e gera insight semanal estruturado em JSON.

Critérios:
- Tendência principal: comparar sintomas da última semana vs anterior. Melhora se redução média ≥20%.
- Achados: padrões temporais (manhã vs noite), correlação dose↔sintoma, side effects emergentes.
- Sugestões para médico: ajustes de dose, mudança de via, exames adicionais.
- Red flags: ideação suicida (palavras-chave), abuso, deterioração rápida.

Saída JSON, PT-BR conciso. Sem dados pessoais identificáveis.`;

export async function gerarInsightSemanal(pacienteId: string): Promise<TrackerInsight & { _ai: { modelo: string; provider: string; cost_brl: number } }> {
  const paciente = repos.pacientes.get(pacienteId);
  if (!paciente) throw new Error(`Paciente ${pacienteId} não encontrado`);

  const ultimosLogs = listarLogsDoPaciente(pacienteId, 30);
  if (ultimosLogs.length === 0) {
    return {
      resumo: "Sem dados suficientes — paciente ainda não registrou logs.",
      tendencia_principal: "estavel",
      achados: [],
      sugestoes_para_medico: ["Orientar paciente a registrar diário diariamente nas primeiras 2 semanas."],
      red_flags: [],
      _ai: { modelo: "n/a", provider: "n/a", cost_brl: 0 },
    };
  }

  const resumido = ultimosLogs.map((l) => ({
    quando: l.criado_em,
    dose: l.dose_mg ?? null,
    via: l.via ?? null,
    sintomas: l.sintomas,
    efeitos: l.efeitos_colaterais,
    humor: l.humor_score ?? null,
  }));

  const result = await aiRouter.invoke({
    task: "tracker.insights_weekly",
    patientId: pacienteId,
    systemPrompt: INSIGHT_SYSTEM_PROMPT,
    userPrompt: `LOGS RECENTES (mais novos primeiro):\n${JSON.stringify(resumido, null, 2)}`,
    schema: TrackerInsightSchema,
    cacheable: true,
  });

  return {
    ...result.data,
    _ai: { modelo: result.model, provider: result.provider, cost_brl: result.cost_brl },
  };
}
