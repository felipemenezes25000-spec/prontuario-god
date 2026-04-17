/**
 * Cliente fetch para a Meridiana API.
 * Modo POC: lê base URL via NEXT_PUBLIC_API_URL ou default localhost:3001.
 * Auth: passa headers fixos para demo.
 */
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const MEDICO_HEADERS = {
  "x-user-id": "00000000-0000-0000-0000-000000000001",
  "x-user-role": "medico",
};
const PACIENTE_HEADERS = {
  "x-user-id": "00000000-0000-0000-0000-000000000002",
  "x-user-role": "paciente",
};

export const MEDICO_DEMO_ID = "00000000-0000-0000-0000-000000000001";
export const PACIENTE_DEMO_ID = "00000000-0000-0000-0000-000000000002";

export async function callTitulacao(input: unknown) {
  const res = await fetch(`${API_BASE}/co-pilot/titulacao`, {
    method: "POST",
    headers: { ...MEDICO_HEADERS, "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

export interface PacienteFull {
  paciente: {
    id: string;
    nome_completo: string;
    cpf: string;
    data_nascimento: string;
    sexo_biologico?: string;
    peso_kg: number;
    comorbidades: string[];
    medicamentos_em_uso: string[];
    alergias: string[];
  };
  prontuario: {
    id: string;
    cid10_principal?: string;
    cid10_secundarios: string[];
    evidencia_indicacao?: "A" | "B" | "C" | "D";
    resumo_atual?: string;
    versao: number;
    criado_em: string;
  };
  eventos: Array<{
    id: string;
    prontuario_id: string;
    tipo: string;
    payload: Record<string, unknown>;
    transcricao?: string;
    criado_em: string;
  }>;
  prescricoes: Array<{
    id: string;
    produto_descricao: string;
    tipo_receita: "A" | "B";
    via_regulatoria: string;
    dose_alvo_mg_dia: number;
    duracao_dias: number;
    status_660?: string;
    validade_660_ate?: string;
    criado_em: string;
  }>;
  tracker_logs: Array<{
    id: string;
    dose_mg?: number;
    via?: string;
    sintomas: Record<string, number>;
    efeitos_colaterais: string[];
    humor_score?: number;
    entrada_via: string;
    criado_em: string;
  }>;
}

export async function getPacienteFull(pacienteId: string): Promise<PacienteFull> {
  const res = await fetch(`${API_BASE}/paciente/${pacienteId}/full`, {
    headers: MEDICO_HEADERS,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function postConsulta(
  prontuarioId: string,
  input: { transcricao: string; origem: "digitada" | "voz_transcrita" },
) {
  const res = await fetch(`${API_BASE}/prontuario/${prontuarioId}/consulta`, {
    method: "POST",
    headers: { ...MEDICO_HEADERS, "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function postTrackerLog(input: unknown) {
  const res = await fetch(`${API_BASE}/tracker/log`, {
    method: "POST",
    headers: { ...PACIENTE_HEADERS, "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function getInsight(pacienteId: string) {
  const res = await fetch(`${API_BASE}/tracker/${pacienteId}/insight`, {
    headers: MEDICO_HEADERS,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
