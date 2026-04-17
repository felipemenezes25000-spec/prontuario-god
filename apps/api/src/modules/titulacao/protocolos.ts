/**
 * Protocolos de titulação cannabis — consenso Delphi 2021 (MacCallum et al.).
 * Fonte: https://pmc.ncbi.nlm.nih.gov/articles/PMC8252988/
 *
 * Estes valores alimentam (a) o RAG do M1 e (b) o rule engine de seleção de protocolo.
 */

export type NomeProtocolo = "routine" | "conservative" | "rapid";

export interface Protocolo {
  nome: NomeProtocolo;
  descricao: string;
  populacao_alvo: string[];
  cbd: {
    dose_inicial_mg: number;
    frequencia_diaria: number;
    incremento_mg: number;
    intervalo_incremento_dias: [number, number]; // [min, max]
    dose_maxima_mg_dia: number;
  };
  thc: {
    dose_inicial_mg: number;
    incremento_mg: number;
    intervalo_incremento_dias: [number, number];
    dose_maxima_mg_dia: number;
    iniciar_apos: string; // condição
  };
  evidencia_nivel: "A" | "B";
  fonte: string;
}

export const PROTOCOLOS: Record<NomeProtocolo, Protocolo> = {
  routine: {
    nome: "routine",
    descricao:
      "Protocolo padrão — adultos sem fragilidade especial, sem polifarmácia complexa.",
    populacao_alvo: [
      "adulto sem comorbidade hepática",
      "sem polifarmácia significativa",
      "tolerância padrão",
    ],
    cbd: {
      dose_inicial_mg: 5,
      frequencia_diaria: 2,
      incremento_mg: 10,
      intervalo_incremento_dias: [2, 3],
      dose_maxima_mg_dia: 40,
    },
    thc: {
      dose_inicial_mg: 2.5,
      incremento_mg: 2.5,
      intervalo_incremento_dias: [2, 7],
      dose_maxima_mg_dia: 40,
      iniciar_apos: "se 40mg/dia CBD não atingir alvo terapêutico",
    },
    evidencia_nivel: "B",
    fonte: "MacCallum 2021 — Delphi consensus chronic pain (PMC8252988)",
  },

  conservative: {
    nome: "conservative",
    descricao:
      "Protocolo conservador — pacientes sensíveis, idosos frágeis, comorbidade hepática, polifarmácia.",
    populacao_alvo: [
      "idoso (≥65a) frágil",
      "comorbidade hepática",
      "polifarmácia ≥5 medicamentos",
      "história de eventos adversos prévios",
      "naïve cannabinoid",
    ],
    cbd: {
      dose_inicial_mg: 5,
      frequencia_diaria: 1,
      incremento_mg: 10,
      intervalo_incremento_dias: [2, 3],
      dose_maxima_mg_dia: 40,
    },
    thc: {
      dose_inicial_mg: 1,
      incremento_mg: 1,
      intervalo_incremento_dias: [7, 7],
      dose_maxima_mg_dia: 40,
      iniciar_apos: "se 40mg/dia CBD não atingir alvo, com vigilância",
    },
    evidencia_nivel: "B",
    fonte: "MacCallum 2021 — Delphi consensus (PMC8252988)",
  },

  rapid: {
    nome: "rapid",
    descricao:
      "Protocolo rápido — paciente com sintoma severo refratário e necessidade de alívio imediato. Início direto com balanced THC:CBD.",
    populacao_alvo: [
      "dor severa refratária",
      "epilepsia refratária com episódios frequentes",
      "paciente experiente em cannabinoides",
      "câncer com dor severa",
    ],
    cbd: {
      dose_inicial_mg: 2.5,
      frequencia_diaria: 2,
      incremento_mg: 5,
      intervalo_incremento_dias: [2, 3],
      dose_maxima_mg_dia: 40,
    },
    thc: {
      dose_inicial_mg: 2.5,
      incremento_mg: 5,
      intervalo_incremento_dias: [2, 3],
      dose_maxima_mg_dia: 40,
      iniciar_apos: "início simultâneo com CBD (1:1)",
    },
    evidencia_nivel: "B",
    fonte: "MacCallum 2021 — Delphi consensus (PMC8252988)",
  },
};
