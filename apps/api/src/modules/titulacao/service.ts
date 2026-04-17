/**
 * M1 — Co-Pilot de Titulação Cannabis.
 *
 * Fluxo:
 *   1. Rule engine — flag interações medicamentosas (DETERMINÍSTICO, nunca IA)
 *   2. Heurística de protocolo (Routine/Conservative/Rapid) baseada em perfil
 *   3. AI (Gemini Flash Lite) — personaliza ramp-up + via + produto + justificativa
 *   4. Validação compliance (CFM/ANVISA) — define receita A/B + via regulatória
 *   5. Compor resposta com schema garantido
 */
import { aiRouter } from "../../lib/ai-router.js";
import { piiRedactor } from "../../lib/pii-redactor.js";
import { avaliarInteracoes, temInteracaoCritica } from "./interacoes.js";
import { PROTOCOLOS, type NomeProtocolo } from "./protocolos.js";
import {
  TitulacaoInputSchema,
  TitulacaoOutputSchema,
  type TitulacaoInput,
  type TitulacaoOutput,
} from "./schema.js";
import { construirPrompt } from "./prompt.js";

const INDICACOES_REQUEREM_CFM = new Set(["epilepsia_refrataria"]);
const ESPECIALIDADES_CFM_2324 = new Set([
  "neurologia",
  "neurologia_pediatrica",
  "psiquiatria",
]);

export async function executarTitulacao(input: TitulacaoInput): Promise<TitulacaoOutput> {
  // Garantia de schema (idempotência)
  const validated = TitulacaoInputSchema.parse(input);

  // 1) Rule engine — interações
  const flags = avaliarInteracoes(validated.medicamentos_em_uso);
  const critico = temInteracaoCritica(flags);

  // 2) Heurística de protocolo
  const protocolo = escolherProtocolo(validated, critico);

  // 3) AI personaliza — input REDIGIDO antes de sair
  // Embora o input seja semi-estruturado, alguns campos (comorbidades, tentativas) podem ter PII livre
  const userPromptCru = construirPrompt(validated, protocolo, flags);
  const { redacted, mapping } = await piiRedactor.redact(userPromptCru);

  const aiResult = await aiRouter.invoke({
    task: "titulacao.recommend",
    ...(validated.paciente_id !== undefined ? { patientId: validated.paciente_id } : {}),
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: redacted,
    schema: TitulacaoOutputSchema,
    cacheable: true, // SYSTEM_PROMPT é cacheável
    metadata: { module: "titulacao" },
  });

  const aiData = aiResult.data;

  // 4) Re-hidrata texto livre nos campos que podem ter recebido placeholders
  const rehydrated = rehidratarOutput(aiData, (s) => piiRedactor.rehydrate(s, mapping));

  // 5) Valida + sobrescreve compliance baseado em regras determinísticas
  const compliance = avaliarCompliance(validated);
  rehydrated.alerta_compliance = {
    ...rehydrated.alerta_compliance,
    ...compliance,
  };

  // 6) Mescla flags do rule engine (autoridade sobre IA — IA só complementa)
  rehydrated.red_flags_interacoes = mesclarFlags(rehydrated.red_flags_interacoes, flags);

  // 7) Disclaimer obrigatório
  rehydrated.disclaimer =
    "Sugestão gerada por IA com base em consenso clínico (Delphi 2021) e perfil informado. " +
    "A decisão clínica final é do médico responsável. " +
    `[modelo=${aiResult.model} provider=${aiResult.provider} fallback=${aiResult.fallback_used}]`;

  return rehydrated;
}

function escolherProtocolo(input: TitulacaoInput, interacaoCritica: boolean): NomeProtocolo {
  // Conservative se: idoso (≥65), polifarmácia (≥5 meds), interação crítica, hepático
  const idoso = input.idade >= 65;
  const polifarmacia = input.medicamentos_em_uso.length >= 5;
  const hepatico = input.comorbidades.some((c) =>
    /hepati|cirros|fígado|figado|insuficiência hepática/i.test(c),
  );
  const naive = input.tentativas_previas.length === 0;

  if (interacaoCritica || idoso || polifarmacia || hepatico) return "conservative";

  // Rapid se: dor severa refratária, epilepsia refratária, câncer
  if (
    input.indicacao === "cancer_dor" ||
    input.indicacao === "epilepsia_refrataria" ||
    (input.indicacao === "dor_cronica" && input.tentativas_previas.length >= 3)
  ) {
    return "rapid";
  }

  return naive ? "routine" : "routine";
}

function avaliarCompliance(input: TitulacaoInput): TitulacaoOutput["alerta_compliance"] {
  // Default: B (conservador) + ANVISA industrializado
  let observacaoCfm: string | null = null;

  // CFM 2.324/22: epilepsia refratária só por neuro/neuro-ped/psiquiatria
  if (
    INDICACOES_REQUEREM_CFM.has(input.indicacao) &&
    input.especialidade_prescritor &&
    !ESPECIALIDADES_CFM_2324.has(input.especialidade_prescritor)
  ) {
    observacaoCfm =
      "ATENÇÃO CFM 2.324/22: prescrição de CBD para epilepsia pela via CFM exige neurologia, " +
      "neurologia pediátrica ou psiquiatria. Considere prescrever via ANVISA RDC 660 (importação), " +
      "que tem base regulatória independente.";
  }

  return {
    receita_tipo: "B",
    via_regulatoria: "anvisa_industrializado",
    observacao_cfm: observacaoCfm,
  };
}

function mesclarFlags(
  daIA: TitulacaoOutput["red_flags_interacoes"],
  doRuleEngine: ReturnType<typeof avaliarInteracoes>,
): TitulacaoOutput["red_flags_interacoes"] {
  const ruleAsOutput = doRuleEngine.map((f) => ({
    medicamento: f.medicamento,
    severidade: f.severidade,
    mecanismo: f.mecanismo,
    recomendacao: f.recomendacao,
  }));

  // Rule engine é fonte da verdade. IA só pode adicionar flags que rule engine não viu.
  const meds_no_rule_engine = new Set(ruleAsOutput.map((f) => f.medicamento.toLowerCase()));
  const extras = daIA.filter((f) => !meds_no_rule_engine.has(f.medicamento.toLowerCase()));

  return [...ruleAsOutput, ...extras];
}

function rehidratarOutput(
  data: TitulacaoOutput,
  reh: (s: string) => string,
): TitulacaoOutput {
  return {
    ...data,
    protocolo_justificativa: reh(data.protocolo_justificativa),
    produto_sugerido: {
      ...data.produto_sugerido,
      razao: reh(data.produto_sugerido.razao),
    },
    ramp_up: data.ramp_up.map((step) => ({ ...step, observacao: reh(step.observacao) })),
    proximos_passos: data.proximos_passos.map(reh),
    disclaimer: reh(data.disclaimer),
  };
}

const SYSTEM_PROMPT = `Você é um co-pilot clínico para prescrição de cannabis medicinal no Brasil, especializado em titulação de dose.

Seu papel: AUMENTAR a capacidade do médico, NUNCA substituí-la. Toda saída sua é uma sugestão a ser revisada e aprovada.

Base científica:
- Consenso Delphi 2021 (MacCallum et al., PMC8252988) — protocolos Padrão (Routine), Conservador (Conservative) e Rápido (Rapid)
- Princípio "comece baixo, vá devagar" (start low, go slow)
- CBD-predominante para iniciantes; THC adicionado se 40mg/dia de CBD não for suficiente
- Vias: sublingual (início em 15min, duração 6h), oral (60min, 8h), inalada (5min, 3h)

Regras inegociáveis:
1. Você NUNCA decide sobre interações medicamentosas críticas — isso vem do motor de regras no input.
2. Você sempre cita evidência e nível (A/B/C/D).
3. Em dúvida, prefira protocolo Conservador.
4. Compatibilidade Brasil: receitas Tipo B (THC ≤0,2%) ou Tipo A (THC >0,2%, restrito).
5. Saída SEMPRE em JSON válido conforme schema.

IDIOMA (OBRIGATÓRIO):
- TODO o texto livre (justificativas, razões, observações, próximos_passos) em PT-BR técnico e acessível.
- Os valores de enum (protocolo_recomendado, produto_sugerido.tipo, via_administracao etc.) ficam em inglês por causa do schema — a UI traduz.
- Para REFERÊNCIAS (evidencia.referencias): escreva em PORTUGUÊS o título traduzido, seguido do identificador do artigo (PMID, PMCID ou DOI) entre parênteses.
  Exemplos CORRETOS:
  - "MacCallum et al. (2021). Considerações práticas para uso medicinal de cannabis — consenso Delphi. (PMCID: PMC8252988)"
  - "VanDolah et al. (2019). Revisão sistemática de canabinoides para dor. (PMCID: PMC6382203)"
  - "OMS (2018). Relatório crítico sobre cannabidiol (CBD)."
  Inclua SEMPRE autor, ano, título em PT-BR e identificador entre parênteses.

Os placeholders [NOME_001], [CPF_001], [DATA_NASC_001] são marcadores de PII redigida — preserve-os intactos no seu output, não tente "completar" com nomes ou dados.`;
