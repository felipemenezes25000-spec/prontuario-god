/**
 * Rule engine de interações medicamentosas com cannabinoides.
 * Determinístico — NUNCA confia em LLM para safety-critical.
 *
 * Fontes:
 * - Drugs.com (interactions DB)
 * - Lazarjani 2020 (canabinoides e CYP450)
 * - Brown 2019 (CBD-warfarin INR elevation)
 */

export type Severidade = "critica" | "alta" | "moderada" | "baixa";

export interface InteracaoFlag {
  medicamento: string;
  severidade: Severidade;
  mecanismo: string;
  recomendacao: string;
  cannabinoid: "CBD" | "THC" | "ambos";
}

interface Regra {
  /** Padrão regex no nome do medicamento (case-insensitive, normalizado) */
  match: RegExp;
  /** Detalhes da interação */
  flag: Omit<InteracaoFlag, "medicamento">;
}

const REGRAS: Regra[] = [
  {
    match: /warfar/i,
    flag: {
      severidade: "critica",
      mecanismo:
        "CBD inibe CYP2C9 e CYP3A4, aumentando INR. Risco de sangramento.",
      recomendacao:
        "Monitorar INR semanalmente nas primeiras 4 semanas. Reduzir warfarina se INR > 3.5. Considerar alternativa anticoagulante.",
      cannabinoid: "CBD",
    },
  },
  {
    match: /clobaz/i,
    flag: {
      severidade: "alta",
      mecanismo:
        "CBD aumenta níveis de N-desmetilclobazam (metabólito ativo) — sedação aumentada.",
      recomendacao:
        "Reduzir clobazam em 25% ao iniciar CBD ≥10mg/dia. Vigilância de sedação.",
      cannabinoid: "CBD",
    },
  },
  {
    match: /tacrolim|ciclospor|sirolim|everolim/i,
    flag: {
      severidade: "alta",
      mecanismo:
        "CBD inibe CYP3A4 — aumenta níveis de imunossupressores. Risco de toxicidade.",
      recomendacao:
        "Monitorar nível sérico do imunossupressor. Reduzir dose se elevação.",
      cannabinoid: "CBD",
    },
  },
  {
    match: /valpro/i,
    flag: {
      severidade: "alta",
      mecanismo: "Combinação CBD + valproato eleva risco de hepatotoxicidade.",
      recomendacao:
        "Monitorar ALT/AST a cada 2 semanas nas primeiras 8 semanas. Suspender se ALT > 3x ULN.",
      cannabinoid: "CBD",
    },
  },
  {
    match: /metadon|metadona/i,
    flag: {
      severidade: "alta",
      mecanismo:
        "CBD/THC podem alterar metabolismo da metadona via CYP3A4 — alterações na analgesia.",
      recomendacao: "Avaliar resposta analgésica em 1-2 semanas. Ajustar dose se necessário.",
      cannabinoid: "ambos",
    },
  },
  {
    match: /sertralin|fluoxet|paroxet|escital|citalopr/i,
    flag: {
      severidade: "moderada",
      mecanismo:
        "ISRS + THC podem potencializar efeitos serotoninérgicos. Risco baixo de síndrome serotoninérgica.",
      recomendacao:
        "Iniciar com baixa dose de THC, monitorar ansiedade, agitação, tremores.",
      cannabinoid: "THC",
    },
  },
  {
    match: /duloxetin|venlafax|desvenlafax/i,
    flag: {
      severidade: "moderada",
      mecanismo:
        "SNRI + cannabinoides — risco serotoninérgico aditivo + sedação aumentada com THC.",
      recomendacao:
        "Iniciar THC em dose baixa, monitorar humor/ansiedade nas primeiras 2 semanas.",
      cannabinoid: "THC",
    },
  },
  {
    match: /pregabalin|gabapentin/i,
    flag: {
      severidade: "moderada",
      mecanismo:
        "Gabapentinoide + cannabinoides — sedação aditiva, possível tontura/ataxia.",
      recomendacao:
        "Orientar sobre risco de queda em idosos. Avaliar redução do gabapentinoide após 4 semanas se sintomas controlados.",
      cannabinoid: "ambos",
    },
  },
  {
    match: /benzodiazep|diazep|alprazol|clonazep|lorazep|midazol/i,
    flag: {
      severidade: "moderada",
      mecanismo: "Sedação aditiva com cannabinoides.",
      recomendacao:
        "Orientar paciente sobre risco de sonolência. Considerar reduzir BZD com sucesso da titulação.",
      cannabinoid: "ambos",
    },
  },
  {
    match: /clopidogr|aspirin|ácido acetil|aas\b/i,
    flag: {
      severidade: "moderada",
      mecanismo: "CBD pode aumentar efeito antiagregante. Risco aumentado de sangramento.",
      recomendacao: "Vigilância clínica para sinais de sangramento.",
      cannabinoid: "CBD",
    },
  },
  {
    match: /opioid|oxicodon|morfin|hidromorf|fentanil|tramadol|codeín/i,
    flag: {
      severidade: "moderada",
      mecanismo:
        "Sinergismo analgésico — pode permitir redução de dose opioide (efeito desejado, mas requer titulação).",
      recomendacao:
        "Titular cannabis e reduzir opioide gradualmente após 2-4 semanas se controle melhorar.",
      cannabinoid: "ambos",
    },
  },
];

export function avaliarInteracoes(medicamentos: string[]): InteracaoFlag[] {
  const flags: InteracaoFlag[] = [];
  for (const med of medicamentos) {
    const norm = med.trim();
    if (!norm) continue;
    for (const regra of REGRAS) {
      if (regra.match.test(norm)) {
        flags.push({ medicamento: norm, ...regra.flag });
      }
    }
  }
  return flags;
}

export function temInteracaoCritica(flags: InteracaoFlag[]): boolean {
  return flags.some((f) => f.severidade === "critica");
}
