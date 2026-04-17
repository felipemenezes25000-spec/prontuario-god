/**
 * Seed rico para demo: popula o prontuário da Maria com:
 * - 5 consultas (30d) com SOAP estruturado completo
 * - 4 prescrições mostrando titulação CBD 10→20→30→40 + RDC 660
 * - 20 tracker logs mostrando evolução real (dor 8→3, sono 3→8)
 * - 2 sessões de telemedicina finalizadas
 * - 1 HC de associação
 *
 * Chamado automaticamente no bootstrap do dev.
 */
import { repos, type Prescricao, type ProntuarioEvento, type TrackerLog, type TelemedicinaSession } from "./store.js";
import { uuid } from "../lib/uuid.js";

const MEDICO_ID = "00000000-0000-0000-0000-000000000001";
const PACIENTE_ID = "00000000-0000-0000-0000-000000000002";

const DIA_MS = 24 * 3600 * 1000;

export function seedRichProntuarioMaria(prontuarioId: string): void {
  // Se já tem eventos ricos, não faz de novo
  const existentes = repos.prontuarioEventos.list((e) => e.prontuario_id === prontuarioId);
  if (existentes.length >= 5) return;

  const agora = Date.now();

  // ============ CONSULTAS (5 ao longo de 30 dias) ============
  const CONSULTAS: Array<{ dia_atras: number; transcricao: string; soap: ProntuarioEvento["payload"] }> = [
    {
      dia_atras: 30,
      transcricao:
        "Consulta inicial. Paciente Maria, 47 anos, fibromialgia há 8 anos. Dor difusa 8/10 em coxas, ombros e região lombar. Sono muito fragmentado (~3-4h/noite). Em uso de duloxetina 60mg/dia e pregabalina 150mg 2x/dia há 2 anos, sem alívio adequado. Tentou amitriptilina sem resposta, fisioterapia sem alívio. Exame físico: sensibilidade muscular generalizada, sem sinais inflamatórios. Humor: depressão moderada. Avaliando início de CBD-predominante sublingual.",
      soap: {
        soap: {
          subjetivo:
            "Paciente refere dor difusa intensa (8/10) em coxas, ombros e lombar há 8 anos. Sono muito fragmentado (3-4h/noite). Humor rebaixado. Refratária a duloxetina + pregabalina.",
          objetivo:
            "Exame físico: sensibilidade muscular generalizada, tender points ativos. Sem sinais inflamatórios. Sinais vitais normais. PHQ-9: 14 (depressão moderada). BPI intensidade: 7.8.",
          avaliacao:
            "Fibromialgia (CID M79.7) refratária a tratamento convencional há 2 anos. Depressão moderada associada (F32.1). Caso elegível para cannabis medicinal conforme RDC 327/2019.",
          plano:
            "Iniciar CBD sublingual 5mg 2x/dia (protocolo Routine, Delphi 2021). Titular com +10mg a cada 3 dias conforme tolerância. Meta 40mg/dia em 14 dias. Manter duloxetina e pregabalina. Retorno em 14 dias. Tracker diário no app.",
          cid10_sugeridos: ["M79.7", "F32.1", "R52"],
          evidencia_indicacao_cannabis: "B",
          alertas: [
            "Interação CBD × duloxetina (SNRI) — vigilância serotoninérgica",
            "Interação CBD × pregabalina — sedação aditiva, orientar risco de quedas",
          ],
        },
      },
    },
    {
      dia_atras: 23,
      transcricao:
        "Primeiro retorno após início CBD 10mg/dia há 7 dias. Paciente refere redução de dor para 6/10, sono melhorando (5h/noite, acorda mais descansada). Sem efeitos adversos significativos além de boca seca leve. Humor estável. Adesão ao tracker 100%.",
      soap: {
        soap: {
          subjetivo:
            "Primeiro retorno (7d). Refere dor 6/10 (vs 8/10 basal, queda 25%). Sono 5h/noite (vs 3-4h). Sem sonolência diurna. Boca seca leve apenas.",
          objetivo:
            "Exame físico: mantém tender points mas menos sensíveis à palpação superficial. Sinais vitais normais. Adesão app 7/7 dias. PHQ-9: 12 (estável).",
          avaliacao:
            "Resposta inicial favorável ao CBD sublingual. Tolerância boa. Indicador precoce de responder.",
          plano:
            "Subir CBD para 20mg/dia (10mg 2x). Manter demais medicações. Retorno 14d. Reforçar hidratação (boca seca).",
          cid10_sugeridos: ["M79.7"],
          evidencia_indicacao_cannabis: "B",
          alertas: [],
        },
      },
    },
    {
      dia_atras: 16,
      transcricao:
        "Segundo retorno. Em CBD 20mg/dia há 7 dias. Dor 4/10, sono 6h/noite, humor melhorando. Reduzindo pregabalina para 100mg 2x (em acordo). Sem interações relevantes.",
      soap: {
        soap: {
          subjetivo:
            "Retorno 14d. Dor 4/10 (queda 50% do basal). Sono 6h consolidados. Humor subindo. Sem efeitos adversos.",
          objetivo:
            "Exame físico: melhora clara de tender points. BPI intensidade: 4.2. PHQ-9: 9 (leve). Adesão 14/14.",
          avaliacao:
            "Resposta sustentada ao CBD. Melhora funcional e de humor. Redução de gabapentinoide indicada.",
          plano:
            "Subir CBD para 30mg/dia. Reduzir pregabalina para 100mg 2x. Retorno 14d. Se persistir melhora, avaliar redução duloxetina em 4 semanas.",
          cid10_sugeridos: ["M79.7"],
          evidencia_indicacao_cannabis: "B",
          alertas: [],
        },
      },
    },
    {
      dia_atras: 9,
      transcricao:
        "Terceiro retorno. CBD 30mg/dia há 7 dias. Dor 3/10 constante, algumas noites de dor <2. Sono 7h consolidados. Ansiedade baixa. Paciente relata 'melhor qualidade de vida em 8 anos'.",
      soap: {
        soap: {
          subjetivo:
            "Retorno 21d. Dor 3/10 (queda 62% do basal). Sono 7h consolidados. Ansiedade baixa. Paciente refere 'melhor qualidade de vida em 8 anos'. Sem efeitos adversos.",
          objetivo:
            "Exame físico: redução marcante de tender points. BPI intensidade: 3.0. PHQ-9: 6 (minimal). GAD-7: 4.",
          avaliacao:
            "Excelente resposta sustentada. Paciente candidata a considerar reducão de duloxetina.",
          plano:
            "Manter CBD 30mg/dia por 2 semanas. Discutir redução gradual de duloxetina (60→45mg) em próxima consulta. Retorno 14d.",
          cid10_sugeridos: ["M79.7"],
          evidencia_indicacao_cannabis: "A",
          alertas: [],
        },
      },
    },
    {
      dia_atras: 2,
      transcricao:
        "Quarto retorno. CBD 30mg/dia mantido. Dor mediana 3/10, sono 7-8h/noite. Discutido escalar para 40mg e considerar importação RDC 660 de produto com melhor concentração.",
      soap: {
        soap: {
          subjetivo:
            "Retorno 28d. Dor mediana 3/10, picos eventuais em 4. Sono 7-8h. Humor estável. Ansiedade controlada. Solicita produto importado com concentração melhor.",
          objetivo:
            "BPI intensidade: 3.0. PHQ-9: 5. GAD-7: 3. Sinais vitais normais.",
          avaliacao:
            "Titulação completa e bem sucedida. Paciente em dose de manutenção. Elegível para importação via RDC 660 de produto de maior concentração para facilitar uso.",
          plano:
            "Prescrever CBD Rich Oil 30mg/ml (Aurora) via RDC 660. Manter dose equivalente 30mg/dia. Preparar ofício 660. Retorno 30d. Discutir redução de duloxetina se manter resposta.",
          cid10_sugeridos: ["M79.7"],
          evidencia_indicacao_cannabis: "A",
          alertas: [],
        },
      },
    },
  ];

  CONSULTAS.forEach((c) => {
    const ts = new Date(agora - c.dia_atras * DIA_MS).toISOString();
    repos.prontuarioEventos.insert({
      id: uuid(),
      criado_em: ts,
      prontuario_id: prontuarioId,
      tipo: "consulta",
      payload: c.soap,
      transcricao: c.transcricao,
      criado_por_user_id: MEDICO_ID,
    } as ProntuarioEvento);
  });

  // Atualiza versão do prontuário
  const prontAtual = repos.prontuarios.get(prontuarioId);
  if (prontAtual) {
    repos.prontuarios.update(prontuarioId, {
      versao: 5,
      resumo_atual:
        "Fibromialgia refratária. Excelente resposta ao CBD sublingual (titulação 5→30mg/dia em 30 dias). Dor caiu 62%. Sono restaurado. Candidata a redução gradual de duloxetina.",
      cid10_principal: "M79.7",
      cid10_secundarios: ["F32.1", "R52"],
      evidencia_indicacao: "A",
    });
  }

  // ============ PRESCRIÇÕES (titulação escalonando) ============
  const PRESCRICOES: Array<Omit<Prescricao, "id" | "criado_em" | "paciente_id" | "medico_id"> & { dia_atras: number }> = [
    {
      dia_atras: 30,
      produto_descricao: "CBD 100mg/ml (Prati-Donaduzzi) — Óleo sublingual — frasco 30ml",
      cbd_mg_por_dose: 10,
      thc_mg_por_dose: 0,
      posologia_texto: "5mg sublingual 2x/dia. Aumentar gradualmente conforme orientação médica.",
      dose_alvo_mg_dia: 10,
      duracao_dias: 7,
      tipo_receita: "B",
      via_regulatoria: "anvisa_industrializado",
      notificacao_receita_numero: "NR-SP-2026-131001",
      status_660: "nao_aplicavel",
    },
    {
      dia_atras: 23,
      produto_descricao: "CBD 200mg/ml (Verdemed) — Óleo sublingual 30ml",
      cbd_mg_por_dose: 20,
      thc_mg_por_dose: 0,
      posologia_texto: "10mg sublingual 2x/dia. Manter horários regulares.",
      dose_alvo_mg_dia: 20,
      duracao_dias: 7,
      tipo_receita: "B",
      via_regulatoria: "anvisa_industrializado",
      notificacao_receita_numero: "NR-SP-2026-135782",
      status_660: "nao_aplicavel",
    },
    {
      dia_atras: 16,
      produto_descricao: "CBD 200mg/ml (Verdemed) — Óleo sublingual 30ml",
      cbd_mg_por_dose: 30,
      thc_mg_por_dose: 0,
      posologia_texto: "15mg sublingual 2x/dia. Aguardar 60s antes de engolir.",
      dose_alvo_mg_dia: 30,
      duracao_dias: 14,
      tipo_receita: "B",
      via_regulatoria: "anvisa_industrializado",
      notificacao_receita_numero: "NR-SP-2026-138761",
      status_660: "nao_aplicavel",
    },
    {
      dia_atras: 2,
      produto_descricao: "CBD Rich Oil 30mg/ml (Aurora) — Importado via RDC 660",
      cbd_mg_por_dose: 30,
      thc_mg_por_dose: 1,
      posologia_texto: "1ml sublingual 2x/dia (30mg CBD/dose). Importação aprovada RDC 660.",
      dose_alvo_mg_dia: 40,
      duracao_dias: 90,
      tipo_receita: "A",
      via_regulatoria: "anvisa_rdc_660_importacao",
      notificacao_receita_numero: "NR-SP-2026-142337",
      status_660: "aprovado",
      validade_660_ate: new Date(agora + 2 * 365 * DIA_MS).toISOString().slice(0, 10),
    },
  ];

  PRESCRICOES.forEach((p) => {
    const { dia_atras, ...rest } = p;
    const ts = new Date(agora - dia_atras * DIA_MS).toISOString();
    repos.prescricoes.insert({
      id: uuid(),
      criado_em: ts,
      paciente_id: PACIENTE_ID,
      medico_id: MEDICO_ID,
      ...rest,
    } as Prescricao);
  });

  // ============ TRACKER LOGS (28 dias de evolução) ============
  // Dor: 8 → 3 (melhora de 62%)
  // Sono: 3 → 8
  // Ansiedade: 7 → 3
  // Humor: 3 → 8
  const DIAS = 28;
  for (let d = DIAS; d >= 0; d--) {
    // curva de melhora baseada em titulação
    const progress = (DIAS - d) / DIAS; // 0→1
    const dose = d > 21 ? 10 : d > 14 ? 20 : d > 7 ? 30 : 30; // escalonamento
    const dor = Math.max(3, Math.round((8 - progress * 5) * 10) / 10); // 8→3
    const sono = Math.min(9, Math.round((3 + progress * 5) * 10) / 10); // 3→8
    const ansiedade = Math.max(3, Math.round((7 - progress * 4) * 10) / 10); // 7→3
    const humor = Math.min(9, Math.round((3 + progress * 5) * 10) / 10); // 3→8
    const ruido = (Math.random() - 0.5) * 0.6; // ±0.3 de variação natural

    const ts = new Date(agora - d * DIA_MS + 20 * 3600 * 1000).toISOString(); // ~20h

    const efeitos: string[] = [];
    if (d > 25 && Math.random() > 0.5) efeitos.push("boca seca leve");
    if (d === 20 && Math.random() > 0.5) efeitos.push("sonolência diurna leve");

    repos.trackerLogs.insert({
      id: uuid(),
      criado_em: ts,
      paciente_id: PACIENTE_ID,
      dose_mg: dose,
      via: "sublingual",
      sintomas: {
        dor: clamp(dor + ruido),
        sono: clamp(sono + ruido * -1),
        ansiedade: clamp(ansiedade + ruido),
        humor: clamp(humor + ruido * -1),
      },
      efeitos_colaterais: efeitos,
      humor_score: clamp(humor + ruido * -1),
      entrada_via: d % 5 === 0 ? "voz" : d % 3 === 0 ? "sms" : "app",
      contexto: {
        sono_horas: Math.round((5 + progress * 3) * 10) / 10,
        estresse_1_10: Math.max(2, Math.round((6 - progress * 3) * 10) / 10),
      },
    } as TrackerLog);
  }

  // ============ SESSÕES DE TELEMEDICINA ============
  const tele1 = repos.telemedicinaSessions.insert({
    id: uuid(),
    criado_em: new Date(agora - 23 * DIA_MS).toISOString(),
    medico_id: MEDICO_ID,
    paciente_id: PACIENTE_ID,
    agendado_para: new Date(agora - 23 * DIA_MS).toISOString(),
    iniciada_em: new Date(agora - 23 * DIA_MS).toISOString(),
    finalizada_em: new Date(agora - 23 * DIA_MS + 30 * 60 * 1000).toISOString(),
    status: "finalizada",
    url_sala: `https://livekit.meridiana.health/sala/${uuid()}`,
    brief_pre_consulta:
      "Paciente iniciou CBD há 7 dias. Tracker mostra queda de dor 8→6 e sono 3h→5h. Bom responder. Preparada para titular para 20mg.",
    transcricao: "Videoconsulta finalizada — 30min.",
  } as TelemedicinaSession);

  const tele2 = repos.telemedicinaSessions.insert({
    id: uuid(),
    criado_em: new Date(agora - 9 * DIA_MS).toISOString(),
    medico_id: MEDICO_ID,
    paciente_id: PACIENTE_ID,
    agendado_para: new Date(agora - 9 * DIA_MS).toISOString(),
    iniciada_em: new Date(agora - 9 * DIA_MS).toISOString(),
    finalizada_em: new Date(agora - 9 * DIA_MS + 25 * 60 * 1000).toISOString(),
    status: "finalizada",
    url_sala: `https://livekit.meridiana.health/sala/${uuid()}`,
    brief_pre_consulta:
      "CBD 30mg/dia. Tracker: dor 3, sono 7, humor 7. Candidata a considerar redução de duloxetina.",
    transcricao: "Videoconsulta finalizada — 25min.",
  } as TelemedicinaSession);

  console.log(`[seed-rich] Prontuário Maria populado: 5 consultas + ${PRESCRICOES.length} receitas + ${DIAS + 1} tracker logs + 2 teles`);
}

function clamp(n: number): number {
  return Math.max(0, Math.min(10, Math.round(n * 10) / 10));
}
