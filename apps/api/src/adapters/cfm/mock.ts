/**
 * Mock CFM adapter — comportamento determinístico p/ testes.
 *
 * Regras:
 * - CRM "999999" em qualquer UF retorna "cassado" (teste de bloqueio)
 * - CRM "000000" em qualquer UF retorna "nao_encontrado"
 * - Demais: "ativo" com especialidade "dor" (nossa cohort alvo)
 */
import type { CfmAdapter, CrmStatus } from "./types.js";

export const cfmMockAdapter: CfmAdapter = {
  async consultar(numero, uf) {
    const now = new Date().toISOString();

    if (numero === "999999") {
      return mkResult(numero, uf, "cassado", "DR. EXEMPLO CASSADO", now);
    }
    if (numero === "000000") {
      return {
        numero,
        uf,
        nome_completo: "",
        situacao: "nao_encontrado",
        especialidades: [],
        verificado_em: now,
        fonte: "mock",
      };
    }
    return mkResult(numero, uf, "ativo", "DR. MEDICO MOCK", now);
  },
};

function mkResult(
  numero: string,
  uf: string,
  situacao: CrmStatus["situacao"],
  nome: string,
  now: string,
): CrmStatus {
  return {
    numero,
    uf,
    nome_completo: nome,
    situacao,
    especialidades: ["clinica_medica", "dor"],
    data_inscricao: "2018-06-15",
    verificado_em: now,
    fonte: "mock",
  };
}
