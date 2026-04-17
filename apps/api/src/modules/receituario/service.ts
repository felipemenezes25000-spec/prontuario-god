import { auditLog } from "../../lib/audit.js";
import { repos, type Prescricao } from "../../db/store.js";
import {
  ReceituarioInputSchema,
  type ReceituarioInput,
  type ReceituarioOutput,
} from "./schema.js";

/**
 * M3 — Receituário ANVISA.
 * Lógica determinística (não chama IA — segurança jurídica primeiro).
 *
 * - Calcula tipo de receita (A ou B) com base em concentração de THC
 * - Gera Notificação de Receita serializada
 * - Renderiza receita em markdown (POC; produção: PDF via headless chrome / pdfkit)
 * - Se via=RDC 660: gera ofício de importação adicional
 * - Persiste em store + audit log
 */
export async function emitirReceita(
  input: ReceituarioInput,
  medicoId: string,
): Promise<ReceituarioOutput> {
  const parsed = ReceituarioInputSchema.parse(input);

  const paciente = repos.pacientes.get(parsed.paciente_id);
  if (!paciente) throw new Error(`Paciente ${parsed.paciente_id} não encontrado`);

  const medico = repos.medicos.get(medicoId);
  if (!medico) throw new Error(`Médico ${medicoId} não encontrado`);

  // 1) Determina tipo de receita
  // % THC do produto = thc_mg / (thc_mg + cbd_mg + ...). Aproximação: se thc_mg_por_dose / total > 0.002 → Tipo A
  const total = parsed.produto.thc_mg_por_dose + parsed.produto.cbd_mg_por_dose;
  const thc_pct = total > 0 ? parsed.produto.thc_mg_por_dose / total : 0;
  const tipo_receita: "A" | "B" = thc_pct > 0.002 ? "A" : "B";

  // 2) Gera Notificação de Receita (serializada)
  const notificacao_numero = gerarNotificacaoReceitaNumero(medico.crm_uf);

  // 3) Validade e status do RDC 660
  const validade_660_ate =
    parsed.via_acesso === "anvisa_rdc_660_importacao"
      ? new Date(Date.now() + 2 * 365 * 24 * 3600 * 1000).toISOString().slice(0, 10)
      : null;
  const status_660: Prescricao["status_660"] =
    parsed.via_acesso === "anvisa_rdc_660_importacao" ? "pendente" : "nao_aplicavel";

  // 4) Persiste prescrição
  const prescricao = repos.prescricoes.insert({
    paciente_id: parsed.paciente_id,
    medico_id: medicoId,
    produto_descricao: `${parsed.produto.nome_comercial}${
      parsed.produto.fabricante ? ` (${parsed.produto.fabricante})` : ""
    } — CBD ${parsed.produto.cbd_mg_por_dose}mg/dose, THC ${parsed.produto.thc_mg_por_dose}mg/dose, via ${parsed.produto.via_administracao}`,
    cbd_mg_por_dose: parsed.produto.cbd_mg_por_dose,
    thc_mg_por_dose: parsed.produto.thc_mg_por_dose,
    posologia_texto: parsed.posologia_texto,
    dose_alvo_mg_dia: parsed.dose_alvo_mg_dia,
    duracao_dias: parsed.duracao_dias,
    tipo_receita,
    via_regulatoria: parsed.via_acesso,
    notificacao_receita_numero: notificacao_numero,
    ...(validade_660_ate !== null ? { validade_660_ate } : {}),
    ...(status_660 !== null ? { status_660 } : {}),
  } as never);

  // 5) Renderiza markdown da receita
  const pdf_receita_md = renderReceitaMarkdown({
    medico,
    paciente,
    prescricao,
    produto: parsed.produto,
  });

  const pdf_oficio_660_md =
    parsed.via_acesso === "anvisa_rdc_660_importacao"
      ? renderOficio660Markdown({
          medico,
          paciente,
          prescricao,
          produto: parsed.produto,
          laudo_clinico: parsed.laudo_clinico ?? "",
        })
      : null;

  // 6) Alertas
  const alertas: string[] = [];
  if (tipo_receita === "A") {
    alertas.push(
      "Receita Tipo A (Notificação amarela) — restrita a casos graves/refratários (ANVISA RDC 327/2019).",
    );
  }
  if (parsed.via_acesso === "anvisa_rdc_660_importacao" && !parsed.laudo_clinico) {
    alertas.push("RDC 660 exige laudo clínico — campo laudo_clinico vazio. Adicione antes do envio.");
  }
  if (medico.especialidade.length === 0) {
    alertas.push("Especialidade do médico não cadastrada — verifique CFM 2.324/22 antes de prescrever CBD para epilepsia.");
  }

  auditLog.append({
    entity: "prescricao",
    entity_id: prescricao.id,
    action: "create",
    user_id: medicoId,
    user_role: "medico",
    payload: {
      paciente_id: parsed.paciente_id,
      tipo_receita,
      via: parsed.via_acesso,
    },
  });

  return {
    prescricao_id: prescricao.id,
    tipo_receita,
    notificacao_receita_numero: notificacao_numero,
    pdf_receita_md,
    pdf_oficio_660_md,
    validade_660_ate,
    status_660,
    alertas,
  };
}

function gerarNotificacaoReceitaNumero(uf: string): string {
  // Formato POC: NR-{UF}-{YYYY}-{6 dígitos aleatórios}
  const yyyy = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 999999)).padStart(6, "0");
  return `NR-${uf}-${yyyy}-${seq}`;
}

function renderReceitaMarkdown(opts: {
  medico: { nome_completo: string; crm_numero: string; crm_uf: string };
  paciente: { nome_completo: string; cpf: string };
  prescricao: { tipo_receita: "A" | "B"; notificacao_receita_numero?: string; produto_descricao: string; posologia_texto: string; dose_alvo_mg_dia: number; duracao_dias: number };
  produto: { nome_comercial: string };
}): string {
  const tipoLabel = opts.prescricao.tipo_receita === "A" ? "TIPO A — Notificação Amarela (RDC 327/2019)" : "TIPO B — Notificação Azul (RDC 327/2019)";
  return `# Receita Especial de Controle Especial — ${tipoLabel}

**Notificação nº ${opts.prescricao.notificacao_receita_numero ?? "—"}**

---

**Médico(a):** ${opts.medico.nome_completo}
**CRM:** ${opts.medico.crm_numero}/${opts.medico.crm_uf}

**Paciente:** ${opts.paciente.nome_completo}
**CPF:** ${opts.paciente.cpf}

---

## Prescrição

**Produto:** ${opts.prescricao.produto_descricao}

**Posologia:** ${opts.prescricao.posologia_texto}

**Dose alvo:** ${opts.prescricao.dose_alvo_mg_dia} mg/dia
**Duração:** ${opts.prescricao.duracao_dias} dias

---

_Assinatura digital ICP-Brasil A3 — gerada eletronicamente pelo sistema Meridiana._
_Data: ${new Date().toLocaleString("pt-BR")}_
`;
}

function renderOficio660Markdown(opts: {
  medico: { nome_completo: string; crm_numero: string; crm_uf: string };
  paciente: { nome_completo: string; cpf: string; data_nascimento: string };
  prescricao: { produto_descricao: string; dose_alvo_mg_dia: number; duracao_dias: number };
  produto: { nome_comercial: string };
  laudo_clinico: string;
}): string {
  return `# Solicitação de Autorização de Importação Excepcional
## ANVISA — RDC 660/2022 (Cannabis Medicinal)

**Solicitante:** ${opts.paciente.nome_completo}
**CPF:** ${opts.paciente.cpf}
**Data de nascimento:** ${opts.paciente.data_nascimento}

---

## Médico Prescritor

**Nome:** ${opts.medico.nome_completo}
**CRM:** ${opts.medico.crm_numero}/${opts.medico.crm_uf}

## Produto

${opts.prescricao.produto_descricao}

**Dose:** ${opts.prescricao.dose_alvo_mg_dia} mg/dia
**Duração estimada do tratamento:** ${opts.prescricao.duracao_dias} dias

## Laudo Clínico

${opts.laudo_clinico || "_Laudo a ser anexado pelo médico._"}

---

## Declarações

- Declaro estar ciente de que o produto destina-se ao uso pessoal e exclusivo do solicitante.
- Declaro estar ciente das normas da RDC 660/2022 da ANVISA.
- Autorização válida por **2 (dois) anos** a partir da data de aprovação.

_Documento gerado pela plataforma Meridiana — ${new Date().toLocaleString("pt-BR")}_
`;
}
