/**
 * Store in-memory — wrapper de compatibilidade.
 *
 * Arquitetura atual (pós-refactor):
 * - DB_MODE=memory (default em dev/test): este arquivo fornece os repos in-memory.
 * - DB_MODE=prisma (produção): services devem acessar `prisma` direto via `./prisma.ts`.
 *
 * Os repos aqui continuam funcionando para o código legado do MVP. Novos módulos
 * (pacientes-crud, exames, multi-clinic, billing) usam Prisma diretamente.
 */
import { createInMemoryRepository, type BaseEntity, type Repository } from "./repository.js";

export type { BaseEntity, Repository };
export const createRepository = createInMemoryRepository;

// ---------- Entidades ----------

export interface Medico extends BaseEntity {
  nome_completo: string;
  cpf: string;
  crm_numero: string;
  crm_uf: string;
  especialidade: string[];
  email: string;
  plano: "free" | "solo" | "clinica" | "enterprise";
}

export interface Paciente extends BaseEntity {
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
  sexo_biologico?: "masculino" | "feminino" | "intersexo";
  peso_kg: number;
  altura_cm?: number;
  comorbidades: string[];
  medicamentos_em_uso: string[];
  alergias: string[];
  medico_responsavel_id: string;
  via_acesso_preferida?:
    | "industrializado"
    | "importacao_660"
    | "magistral"
    | "associacao"
    | "cultivo_hc";
  consentimento_clinico_em?: string;
}

export interface Prontuario extends BaseEntity {
  paciente_id: string;
  medico_responsavel_id: string;
  cid10_principal?: string;
  cid10_secundarios: string[];
  evidencia_indicacao?: "A" | "B" | "C" | "D";
  resumo_atual?: string;
  versao: number;
}

export interface ProntuarioEvento extends BaseEntity {
  prontuario_id: string;
  tipo:
    | "consulta"
    | "tracker"
    | "prescricao"
    | "import_660"
    | "nota_voz"
    | "exame_anexado"
    | "telemedicina";
  payload: Record<string, unknown>;
  transcricao?: string;
  transcricao_modelo?: string;
  criado_por_user_id: string;
}

export interface Prescricao extends BaseEntity {
  paciente_id: string;
  medico_id: string;
  produto_descricao: string;
  cbd_mg_por_dose: number;
  thc_mg_por_dose: number;
  posologia_texto: string;
  dose_alvo_mg_dia: number;
  duracao_dias: number;
  tipo_receita: "A" | "B";
  via_regulatoria:
    | "anvisa_industrializado"
    | "anvisa_rdc_660_importacao"
    | "magistral"
    | "associacao_hc";
  notificacao_receita_numero?: string;
  pdf_receita_url?: string;
  pdf_oficio_660_url?: string;
  status_660?: "nao_aplicavel" | "pendente" | "submetido" | "aprovado" | "negado" | "expirado";
  validade_660_ate?: string;
}

export interface TrackerLog extends BaseEntity {
  paciente_id: string;
  prescricao_id?: string;
  dose_mg?: number;
  via?: "oral" | "sublingual" | "inalada" | "dermatologica" | "bucal";
  sintomas: Record<string, number>;
  efeitos_colaterais: string[];
  contexto?: { sono_horas?: number; estresse_1_10?: number; observacao?: string };
  humor_score?: number;
  entrada_via: "app" | "sms" | "whatsapp" | "voz";
  transcricao_voz?: string;
}

export interface TelemedicinaSession extends BaseEntity {
  medico_id: string;
  paciente_id: string;
  agendado_para: string;
  iniciada_em?: string;
  finalizada_em?: string;
  status: "agendada" | "em_andamento" | "finalizada" | "cancelada";
  url_sala: string;
  brief_pre_consulta?: string;
  gravacao_url?: string;
  transcricao?: string;
  prontuario_evento_id?: string;
}

// ---------- Repositórios singletons ----------

export const repos = {
  medicos: createRepository<Medico>(),
  pacientes: createRepository<Paciente>(),
  prontuarios: createRepository<Prontuario>(),
  prontuarioEventos: createRepository<ProntuarioEvento>(),
  prescricoes: createRepository<Prescricao>(),
  trackerLogs: createRepository<TrackerLog>(),
  telemedicinaSessions: createRepository<TelemedicinaSession>(),
};

/** Seed dev — médico + paciente para curl/demo funcionarem direto */
export function seedDev(): { medico: Medico; paciente: Paciente; prontuario: Prontuario } {
  if (repos.medicos.count() > 0) {
    const medico = repos.medicos.list()[0]!;
    const paciente = repos.pacientes.list()[0]!;
    const prontuario = repos.prontuarios.list()[0]!;
    return { medico, paciente, prontuario };
  }

  const medico = repos.medicos.insert({
    id: "00000000-0000-0000-0000-000000000001",
    nome_completo: "Dra. Ana Beatriz Lima",
    cpf: "11144477735",
    crm_numero: "123456",
    crm_uf: "SP",
    especialidade: ["dor"],
    email: "ana@meridiana.health",
    plano: "free",
  });

  const paciente = repos.pacientes.insert({
    id: "00000000-0000-0000-0000-000000000002",
    nome_completo: "Maria Silva",
    cpf: "12345678909",
    data_nascimento: "1978-03-12",
    sexo_biologico: "feminino",
    peso_kg: 68,
    altura_cm: 162,
    comorbidades: ["fibromialgia", "depressão moderada"],
    medicamentos_em_uso: ["duloxetina 60mg/dia", "pregabalina 150mg 2x/dia"],
    alergias: [],
    medico_responsavel_id: medico.id,
    via_acesso_preferida: "anvisa_industrializado" as never,
    consentimento_clinico_em: new Date().toISOString(),
  } as never);

  const prontuario = repos.prontuarios.insert({
    paciente_id: paciente.id,
    medico_responsavel_id: medico.id,
    cid10_principal: "M79.7",
    cid10_secundarios: ["F32.1"],
    versao: 1,
  });

  return { medico, paciente, prontuario };
}
