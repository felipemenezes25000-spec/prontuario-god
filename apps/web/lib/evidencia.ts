/**
 * Base de evidências conhecidas — traduzidas e resumidas em PT-BR.
 * Quando a IA retorna uma referência com PMID/PMCID conhecido, enriquecemos
 * com tradução e resumo. Caso contrário, mostramos o texto cru + link automático.
 */

export interface EvidenciaEnriquecida {
  id: string; // PMCID, PMID ou hash do texto
  tipo: "pmcid" | "pmid" | "doi" | "texto";
  raw: string; // texto original
  titulo_pt: string | null;
  resumo_pt: string | null;
  link: string | null;
  autores: string | null;
  ano: number | null;
}

// Base curada de referências comuns em titulação de cannabis
const BASE: Record<string, Omit<EvidenciaEnriquecida, "id" | "raw" | "tipo">> = {
  PMC8252988: {
    titulo_pt: "Considerações práticas para uso medicinal de cannabis e canabinoides: um consenso Delphi",
    resumo_pt:
      "Consenso de 20 especialistas em dor e medicina canabinoide. Define três protocolos de titulação: Padrão (CBD 5mg 2×/dia, incrementos de 10mg), Conservador (CBD 5mg 1×/dia, incrementos menores) e Rápido (início balanceado 1:1 CBD:THC). Base da lógica do Co-Pilot.",
    autores: "MacCallum CA, Lo LA, Boivin M",
    ano: 2021,
    link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8252988/",
  },
  PMC6382203: {
    titulo_pt: "Revisão de revisões sistemáticas sobre canabinoides e dor",
    resumo_pt:
      "Meta-revisão que consolida evidência para uso de canabinoides em dor crônica. Conclui evidência moderada de benefício, especialmente em dor neuropática. Recomenda CBD-predominante como primeira escolha pela tolerabilidade.",
    autores: "VanDolah HJ, Bauer BA, Mauck KF",
    ano: 2019,
    link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6382203/",
  },
  PMC11705032: {
    titulo_pt: "Preditores de resposta à cannabis medicinal em dor crônica (estudo retrospectivo)",
    resumo_pt:
      "Análise de dados reais do app Strainprint. Identifica perfis demográficos que respondem melhor: mulheres 40-60 anos com fibromialgia tiveram as maiores quedas de BPI. Justifica protocolos personalizados.",
    autores: "Cuttler C, LaFrance EM, Craft RM",
    ano: 2024,
    link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11705032/",
  },
  PMC11225978: {
    titulo_pt: "Tecnologia de smartphone para rastrear ansiedade/depressão em usuários de cannabis na Flórida",
    resumo_pt:
      "Estudo observacional que mostra queda significativa de sintomas ansiosos e depressivos auto-reportados. Justifica o Diário do paciente com escala visual — paciente logando diariamente melhora a acurácia clínica.",
    autores: "Rupasinghe P, Cuttler C",
    ano: 2024,
    link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11225978/",
  },
};

// Títulos em inglês comuns → tradução mapeada (fallback)
const TITLE_PATTERNS: Array<{ match: RegExp; titulo_pt: string; resumo_pt: string; link?: string }> = [
  {
    match: /practical considerations.*cannabis.*cannabinoids.*delphi consensus/i,
    titulo_pt: "Considerações práticas para uso medicinal de cannabis — consenso Delphi",
    resumo_pt:
      "Consenso internacional de especialistas definindo protocolos de titulação: Padrão, Conservador e Rápido. Base das recomendações do Co-Pilot.",
    link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8252988/",
  },
  {
    match: /systematic reviews.*cannabinoids.*pain/i,
    titulo_pt: "Revisão sistemática de canabinoides para dor",
    resumo_pt:
      "Meta-revisão que consolida evidência para dor crônica, especialmente neuropática. Recomenda CBD-predominante como primeira escolha.",
    link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6382203/",
  },
  {
    match: /cannabidiol.*critical review.*world health organization|WHO.*cannabidiol/i,
    titulo_pt: "Cannabidiol (CBD) — Relatório crítico da OMS",
    resumo_pt:
      "Revisão crítica da Organização Mundial da Saúde estabelecendo o CBD como sendo seguro e sem potencial de abuso. Base para remoção do CBD das listas de controle em vários países.",
    link: "https://www.who.int/teams/health-product-policy-and-standards/controlled-substances/pre-review-critical-review",
  },
  {
    match: /start low.*go slow|titration.*cannabinoid/i,
    titulo_pt: "Titulação de canabinoides — princípio comece baixo, vá devagar",
    resumo_pt: "Princípio universal na farmacologia de canabinoides: iniciar com doses baixas e aumentar gradualmente minimiza efeitos adversos e identifica a dose mínima eficaz.",
  },
];

/**
 * Enriquece uma referência crua com tradução + resumo + link.
 */
export function enriquecerEvidencia(raw: string): EvidenciaEnriquecida {
  const pmcMatch = raw.match(/PMC(\d{5,})/i);
  const pmidMatch = raw.match(/PMID[:\s]*(\d{5,})/i);
  const doiMatch = raw.match(/10\.\d{4,}\/[^\s)]+/);

  // Tenta base curada primeiro
  if (pmcMatch) {
    const pmcId = `PMC${pmcMatch[1]}`;
    const base = BASE[pmcId];
    if (base) {
      return { id: pmcId, tipo: "pmcid", raw, ...base };
    }
    // Sem base: link automático
    return {
      id: pmcId,
      tipo: "pmcid",
      raw,
      titulo_pt: null,
      resumo_pt: null,
      autores: extrairAutores(raw),
      ano: extrairAno(raw),
      link: `https://pmc.ncbi.nlm.nih.gov/articles/${pmcId}/`,
    };
  }

  if (pmidMatch) {
    const pmid = pmidMatch[1]!;
    return {
      id: `PMID${pmid}`,
      tipo: "pmid",
      raw,
      titulo_pt: null,
      resumo_pt: null,
      autores: extrairAutores(raw),
      ano: extrairAno(raw),
      link: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
    };
  }

  if (doiMatch) {
    return {
      id: doiMatch[0],
      tipo: "doi",
      raw,
      titulo_pt: null,
      resumo_pt: null,
      autores: extrairAutores(raw),
      ano: extrairAno(raw),
      link: `https://doi.org/${doiMatch[0]}`,
    };
  }

  // Tenta padrão de título conhecido
  for (const tp of TITLE_PATTERNS) {
    if (tp.match.test(raw)) {
      return {
        id: hash(raw),
        tipo: "texto",
        raw,
        titulo_pt: tp.titulo_pt,
        resumo_pt: tp.resumo_pt,
        autores: extrairAutores(raw),
        ano: extrairAno(raw),
        link: tp.link ?? null,
      };
    }
  }

  return {
    id: hash(raw),
    tipo: "texto",
    raw,
    titulo_pt: null,
    resumo_pt: null,
    autores: extrairAutores(raw),
    ano: extrairAno(raw),
    link: null,
  };
}

function extrairAutores(raw: string): string | null {
  // Exemplo: "MacCallum et al. (2021)..." → "MacCallum et al."
  const m = raw.match(/^([A-Z][a-zA-Z]+(?:\s+[A-Z]{2,})?(?:\s+et\s+al\.?|,\s+[A-Z][a-z]+(?:,\s+[A-Z][a-z]+)*)?)/);
  return m?.[1] ?? null;
}

function extrairAno(raw: string): number | null {
  const m = raw.match(/\b(19|20)\d{2}\b/);
  return m ? Number(m[0]) : null;
}

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}
