import { aiRouter } from "../../lib/ai-router.js";
import { auditLog } from "../../lib/audit.js";
import { repos, type TelemedicinaSession } from "../../db/store.js";
import {
  PreConsultaBriefSchema,
  type PreConsultaBrief,
  type SessionCreate,
} from "./schema.js";
import { listarLogsDoPaciente } from "../tracker/service.js";
import { uuid } from "../../lib/uuid.js";

const BRIEF_SYSTEM_PROMPT = `Você é um co-pilot que prepara o médico ANTES de uma teleconsulta de cannabis medicinal.

Recebe: dados do paciente (comorbidades, medicações, prescrições anteriores) + últimos logs do tracker.
Devolve: resumo curto (≤200 palavras), pontos principais (3-5), perguntas sugeridas (3-5), alertas (interações, red flags do tracker).

Estilo: telegráfico, médico-para-médico. Sem floreios.`;

export async function criarSession(input: SessionCreate, medicoId: string): Promise<TelemedicinaSession> {
  const session = repos.telemedicinaSessions.insert({
    medico_id: medicoId,
    paciente_id: input.paciente_id,
    agendado_para: input.agendado_para,
    status: "agendada",
    url_sala: `https://livekit.meridiana.health/sala/${uuid()}`,
  } as never);

  auditLog.append({
    entity: "telemedicina_session",
    entity_id: session.id,
    action: "create",
    user_id: medicoId,
    user_role: "medico",
    payload: { paciente_id: input.paciente_id, agendado_para: input.agendado_para },
  });

  return session;
}

export async function gerarBriefPreConsulta(sessionId: string): Promise<PreConsultaBrief & { _ai: { modelo: string; provider: string; cost_brl: number } }> {
  const session = repos.telemedicinaSessions.get(sessionId);
  if (!session) throw new Error(`Session ${sessionId} não encontrada`);

  const paciente = repos.pacientes.get(session.paciente_id);
  if (!paciente) throw new Error("Paciente não encontrado");

  const ultimosLogs = listarLogsDoPaciente(paciente.id, 14);
  const ultimasPrescricoes = repos.prescricoes
    .list((p) => p.paciente_id === paciente.id)
    .sort((a, b) => b.criado_em.localeCompare(a.criado_em))
    .slice(0, 3);

  const userPrompt = `## PACIENTE
Idade: ${calcularIdade(paciente.data_nascimento)} | Peso: ${paciente.peso_kg}kg
Comorbidades: ${paciente.comorbidades.join("; ") || "nenhuma"}
Medicações em uso: ${paciente.medicamentos_em_uso.join("; ") || "nenhuma"}

## ÚLTIMAS PRESCRIÇÕES
${ultimasPrescricoes
  .map(
    (p) =>
      `- ${p.criado_em.slice(0, 10)}: ${p.produto_descricao} | dose alvo ${p.dose_alvo_mg_dia}mg/dia`,
  )
  .join("\n") || "Nenhuma prescrição prévia."}

## TRACKER (últimos ${ultimosLogs.length} logs)
${ultimosLogs
  .map(
    (l) =>
      `- ${l.criado_em.slice(0, 10)}: dose=${l.dose_mg ?? "—"}mg via ${l.via ?? "—"} | sintomas=${JSON.stringify(l.sintomas)} | efeitos=${l.efeitos_colaterais.join(",") || "nenhum"}`,
  )
  .join("\n") || "Sem registros do paciente."}`;

  const result = await aiRouter.invoke({
    task: "consulta.brief",
    patientId: paciente.id,
    systemPrompt: BRIEF_SYSTEM_PROMPT,
    userPrompt,
    schema: PreConsultaBriefSchema,
    cacheable: true,
  });

  // Persiste no session
  repos.telemedicinaSessions.update(sessionId, {
    brief_pre_consulta: result.data.resumo_paciente,
  });

  return {
    ...result.data,
    _ai: { modelo: result.model, provider: result.provider, cost_brl: result.cost_brl },
  };
}

export function iniciarSession(sessionId: string, medicoId: string): TelemedicinaSession {
  const session = repos.telemedicinaSessions.get(sessionId);
  if (!session) throw new Error("Session não encontrada");
  const updated = repos.telemedicinaSessions.update(sessionId, {
    status: "em_andamento",
    iniciada_em: new Date().toISOString(),
  });
  auditLog.append({
    entity: "telemedicina_session",
    entity_id: sessionId,
    action: "update",
    user_id: medicoId,
    user_role: "medico",
    payload: { acao: "iniciar" },
  });
  return updated!;
}

export function finalizarSession(args: {
  session_id: string;
  transcricao?: string;
  gravacao_url?: string;
  medico_id: string;
}): TelemedicinaSession {
  const session = repos.telemedicinaSessions.get(args.session_id);
  if (!session) throw new Error("Session não encontrada");

  // Cria prontuario_evento de telemedicina
  const evento = repos.prontuarioEventos.insert({
    prontuario_id: repos.prontuarios
      .list((p) => p.paciente_id === session.paciente_id)
      .sort((a, b) => b.criado_em.localeCompare(a.criado_em))[0]?.id ?? "",
    tipo: "telemedicina",
    payload: { session_id: args.session_id },
    transcricao: args.transcricao ?? "",
    transcricao_modelo: "whisper-large-v3",
    criado_por_user_id: args.medico_id,
  } as never);

  const updated = repos.telemedicinaSessions.update(args.session_id, {
    status: "finalizada",
    finalizada_em: new Date().toISOString(),
    ...(args.transcricao !== undefined ? { transcricao: args.transcricao } : {}),
    ...(args.gravacao_url !== undefined ? { gravacao_url: args.gravacao_url } : {}),
    prontuario_evento_id: evento.id,
  });

  auditLog.append({
    entity: "telemedicina_session",
    entity_id: args.session_id,
    action: "update",
    user_id: args.medico_id,
    user_role: "medico",
    payload: { acao: "finalizar", prontuario_evento_id: evento.id },
  });

  return updated!;
}

function calcularIdade(dataNascimento: string): number {
  const nasc = new Date(dataNascimento);
  const ms = Date.now() - nasc.getTime();
  return Math.floor(ms / (365.25 * 24 * 3600 * 1000));
}
