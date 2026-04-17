import { aiRouter } from "../../lib/ai-router.js";
import { auditLog } from "../../lib/audit.js";
import { piiRedactor } from "../../lib/pii-redactor.js";
import { repos, type Prontuario, type ProntuarioEvento } from "../../db/store.js";
import {
  ProntuarioCreateSchema,
  ConsultaInputSchema,
  SoapEstruturadoSchema,
  type ProntuarioCreate,
  type ConsultaInput,
} from "./schema.js";

const SOAP_SYSTEM_PROMPT = `Você é um assistente clínico que estrutura consultas médicas de cannabis medicinal no formato SOAP.

S = Subjetivo: queixas, sintomas relatados pelo paciente
O = Objetivo: achados de exame físico, vital signs, exames mencionados
A = Avaliação: hipóteses diagnósticas, evolução clínica
P = Plano: condutas, prescrições propostas, retorno

Considerações cannabis-específicas:
- Identifique CID-10 sugeridos relevantes para indicação cannabis (M79.7 fibromialgia, G40 epilepsia, F32 depressão, F41 ansiedade, M54 dor lombar, R52 dor crônica)
- Avalie nível de evidência (A=meta-análise/consenso, B=ensaios clínicos, C=série de casos, D=opinião)
- Levante alertas: interações medicamentosas mencionadas, comorbidades hepáticas, gestação, idoso frágil

Saída em JSON. PT-BR técnico mas conciso. Preserve placeholders [NOME_001] etc.`;

export async function criarProntuario(input: ProntuarioCreate, userId: string): Promise<Prontuario> {
  const parsed = ProntuarioCreateSchema.parse(input);

  const paciente = repos.pacientes.get(parsed.paciente_id);
  if (!paciente) throw new Error(`Paciente ${parsed.paciente_id} não encontrado`);

  const prontuario = repos.prontuarios.insert({
    paciente_id: parsed.paciente_id,
    medico_responsavel_id: paciente.medico_responsavel_id,
    cid10_principal: parsed.cid10_principal,
    cid10_secundarios: parsed.cid10_secundarios,
    evidencia_indicacao: parsed.evidencia_indicacao,
    versao: 1,
  } as never);

  auditLog.append({
    entity: "prontuario",
    entity_id: prontuario.id,
    action: "create",
    user_id: userId,
    user_role: "medico",
    payload: { paciente_id: parsed.paciente_id },
  });

  return prontuario;
}

export interface RegistrarConsultaResult {
  evento: ProntuarioEvento;
  soap: ReturnType<typeof SoapEstruturadoSchema.parse>;
  ai_meta: { modelo: string; provider: string; cost_brl: number };
}

export async function registrarConsulta(
  input: ConsultaInput,
  userId: string,
): Promise<RegistrarConsultaResult> {
  const parsed = ConsultaInputSchema.parse(input);
  const prontuario = repos.prontuarios.get(parsed.prontuario_id);
  if (!prontuario) throw new Error(`Prontuário ${parsed.prontuario_id} não encontrado`);

  const paciente = repos.pacientes.get(prontuario.paciente_id);
  if (!paciente) throw new Error("Paciente do prontuário não encontrado");

  // 1) PII redaction
  const { redacted, mapping } = await piiRedactor.redact(parsed.transcricao);

  // 2) IA estrutura SOAP
  const aiResult = await aiRouter.invoke({
    task: "soap.structure",
    patientId: paciente.id,
    systemPrompt: SOAP_SYSTEM_PROMPT,
    userPrompt: `Contexto paciente: ${paciente.comorbidades.join("; ") || "sem comorbidades"} | meds: ${paciente.medicamentos_em_uso.join("; ") || "nenhum"}\n\nTRANSCRIÇÃO:\n${redacted}`,
    schema: SoapEstruturadoSchema,
    cacheable: true,
  });

  // 3) Re-hidrata
  const soap = aiResult.data;
  soap.subjetivo = piiRedactor.rehydrate(soap.subjetivo, mapping);
  soap.objetivo = piiRedactor.rehydrate(soap.objetivo, mapping);
  soap.avaliacao = piiRedactor.rehydrate(soap.avaliacao, mapping);
  soap.plano = piiRedactor.rehydrate(soap.plano, mapping);

  // 4) Persiste evento
  const evento = repos.prontuarioEventos.insert({
    prontuario_id: prontuario.id,
    tipo: parsed.origem === "voz_transcrita" ? "nota_voz" : "consulta",
    payload: { soap },
    transcricao: parsed.transcricao,
    transcricao_modelo: parsed.origem === "voz_transcrita" ? "whisper-large-v3" : undefined,
    criado_por_user_id: userId,
  } as never);

  // 5) Atualiza prontuário com último resumo + cid sugerido principal
  const novoResumo = `${soap.avaliacao.slice(0, 200)} → ${soap.plano.slice(0, 200)}`;
  const novoCid = prontuario.cid10_principal ?? soap.cid10_sugeridos[0];
  const novaEvidencia =
    prontuario.evidencia_indicacao ?? soap.evidencia_indicacao_cannabis;
  repos.prontuarios.update(prontuario.id, {
    versao: prontuario.versao + 1,
    resumo_atual: novoResumo,
    ...(novoCid !== undefined ? { cid10_principal: novoCid } : {}),
    ...(novaEvidencia !== undefined ? { evidencia_indicacao: novaEvidencia } : {}),
  });

  auditLog.append({
    entity: "prontuario_evento",
    entity_id: evento.id,
    action: "create",
    user_id: userId,
    user_role: "medico",
    payload: { prontuario_id: prontuario.id, tipo: evento.tipo },
  });

  return {
    evento,
    soap,
    ai_meta: {
      modelo: aiResult.model,
      provider: aiResult.provider,
      cost_brl: aiResult.cost_brl,
    },
  };
}

export function obterProntuarioCompleto(prontuarioId: string) {
  const prontuario = repos.prontuarios.get(prontuarioId);
  if (!prontuario) return null;
  const eventos = repos.prontuarioEventos
    .list((e) => e.prontuario_id === prontuarioId)
    .sort((a, b) => a.criado_em.localeCompare(b.criado_em));
  return { prontuario, eventos };
}
