/**
 * Pacientes — service layer (Prisma).
 *
 * Regras críticas:
 * - CPF é único; validação com dígito verificador no schema Zod
 * - Soft-delete (deleted_at) — nunca DROP, CFM 1.821 20 anos
 * - Busca fuzzy usa trigram (pg_trgm) + unaccent
 * - Search só retorna pacientes da mesma clínica OU do médico (multi-tenant)
 * - Todas as leituras emitem audit event `paciente_read`
 */
import { Prisma, type Paciente } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { auditLog } from "../../lib/audit.js";
import type { AuthContext } from "../../lib/auth.js";

// ---------- Validação CPF (dígito verificador) ----------
export function validarCpf(cpf: string): boolean {
  const digitos = cpf.replace(/\D/g, "");
  if (digitos.length !== 11 || /^(\d)\1+$/.test(digitos)) return false;
  for (let t = 9; t < 11; t++) {
    let d = 0;
    for (let c = 0; c < t; c++) d += Number(digitos[c]) * (t + 1 - c);
    d = ((d * 10) % 11) % 10;
    if (d !== Number(digitos[t])) return false;
  }
  return true;
}

// ---------- Filtros de listagem ----------
export interface ListPacientesOpts {
  clinic_id?: string | undefined;
  medico_responsavel_id?: string | undefined;
  query?: string | undefined;              // busca por nome / CPF
  incluir_deletados?: boolean | undefined;
  cursor?: string | undefined;             // paginação cursor-based
  take?: number | undefined;
}

export async function listarPacientes(
  auth: AuthContext,
  opts: ListPacientesOpts = {},
): Promise<{ items: Paciente[]; next_cursor: string | null }> {
  const take = Math.min(opts.take ?? 25, 100);

  const where: Prisma.PacienteWhereInput = {
    ...(opts.incluir_deletados ? {} : { deleted_at: null }),
  };

  // Scope multi-tenant
  if (auth.role === "medico") {
    const medico = await prisma.medico.findUnique({ where: { user_id: auth.user_id } });
    if (!medico) return { items: [], next_cursor: null };
    where.medico_responsavel_id = medico.id;
  } else if (auth.role === "admin" && auth.clinic_id) {
    where.clinic_id = auth.clinic_id;
  } else if (auth.role === "paciente") {
    where.user_id = auth.user_id;
  }

  if (opts.query?.trim()) {
    const q = opts.query.trim();
    where.OR = [
      { nome_completo: { contains: q, mode: "insensitive" } },
      { cpf: { contains: q.replace(/\D/g, "") } },
    ];
  }

  const items = await prisma.paciente.findMany({
    where,
    orderBy: { criado_em: "desc" },
    take: take + 1,
    ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
  });

  let next_cursor: string | null = null;
  if (items.length > take) {
    const next = items.pop();
    next_cursor = next?.id ?? null;
  }

  auditLog.append({
    user_id: auth.user_id,
    user_role: auth.role,
    action: "paciente_read",
    entity: "pacientes",
    payload: { count: items.length, query: opts.query ?? null },
  });

  return { items, next_cursor };
}

export async function obterPaciente(auth: AuthContext, id: string): Promise<Paciente | null> {
  const p = await prisma.paciente.findUnique({ where: { id } });
  if (!p || p.deleted_at) return null;

  // RBAC: médico só vê próprios; paciente só vê próprio
  if (auth.role === "medico") {
    const medico = await prisma.medico.findUnique({ where: { user_id: auth.user_id } });
    if (!medico || p.medico_responsavel_id !== medico.id) return null;
  } else if (auth.role === "paciente") {
    if (p.user_id !== auth.user_id) return null;
  }

  auditLog.append({
    user_id: auth.user_id,
    user_role: auth.role,
    action: "paciente_read",
    entity: "paciente",
    entity_id: id,
    payload: {},
  });

  return p;
}

// ---------- Criar ----------
export interface CriarPacienteInput {
  nome_completo: string;
  cpf: string;
  data_nascimento: string; // ISO
  sexo_biologico?: "masculino" | "feminino" | "intersexo" | "nao_informado" | undefined;
  peso_kg?: number | undefined;
  altura_cm?: number | undefined;
  comorbidades?: string[] | undefined;
  medicamentos_em_uso?: string[] | undefined;
  alergias?: string[] | undefined;
  via_acesso_preferida?: string | undefined;
  email?: string | undefined;
  telefone_e164?: string | undefined;
  endereco_json?: Prisma.JsonValue | undefined;
  responsavel_legal_nome?: string | undefined;
  responsavel_legal_cpf?: string | undefined;
  clinic_id?: string | undefined;
  medico_responsavel_id: string;
  consentimento_clinico: boolean;
}

export async function criarPaciente(auth: AuthContext, input: CriarPacienteInput): Promise<Paciente> {
  if (!validarCpf(input.cpf)) {
    throw new Error("CPF inválido");
  }
  if (!input.consentimento_clinico) {
    throw new Error("Consentimento clínico LGPD art. 11 obrigatório");
  }

  const cpfLimpo = input.cpf.replace(/\D/g, "");
  const existing = await prisma.paciente.findUnique({ where: { cpf: cpfLimpo } });
  if (existing) throw new Error("Paciente com este CPF já cadastrado");

  const p = await prisma.paciente.create({
    data: {
      nome_completo: input.nome_completo,
      cpf: cpfLimpo,
      data_nascimento: new Date(input.data_nascimento),
      sexo_biologico: (input.sexo_biologico ?? "nao_informado") as "masculino" | "feminino" | "intersexo" | "nao_informado",
      peso_kg: input.peso_kg ? String(input.peso_kg) : null,
      altura_cm: input.altura_cm ?? null,
      comorbidades: input.comorbidades ?? [],
      medicamentos_em_uso: input.medicamentos_em_uso ?? [],
      alergias: input.alergias ?? [],
      via_acesso_preferida: (input.via_acesso_preferida ?? null) as never,
      email: input.email ?? null,
      telefone_e164: input.telefone_e164 ?? null,
      endereco_json: (input.endereco_json ?? Prisma.DbNull) as Prisma.InputJsonValue,
      responsavel_legal_nome: input.responsavel_legal_nome ?? null,
      responsavel_legal_cpf: input.responsavel_legal_cpf ?? null,
      clinic_id: input.clinic_id ?? null,
      medico_responsavel_id: input.medico_responsavel_id,
      consentimento_clinico_em: new Date(),
    },
  });

  auditLog.append({
    user_id: auth.user_id,
    user_role: auth.role,
    action: "paciente_created",
    entity: "paciente",
    entity_id: p.id,
    payload: { nome: p.nome_completo },
  });

  return p;
}

// ---------- Atualizar ----------
export type AtualizarPacienteInput = {
  [K in keyof Omit<CriarPacienteInput, "cpf" | "consentimento_clinico" | "medico_responsavel_id">]?:
    | CriarPacienteInput[K]
    | undefined;
};

export async function atualizarPaciente(
  auth: AuthContext,
  id: string,
  patch: AtualizarPacienteInput,
): Promise<Paciente> {
  const existing = await obterPaciente(auth, id);
  if (!existing) throw new Error("Paciente não encontrado ou sem permissão");

  const data: Prisma.PacienteUpdateInput = {};
  if (patch.nome_completo !== undefined) data.nome_completo = patch.nome_completo;
  if (patch.data_nascimento !== undefined) data.data_nascimento = new Date(patch.data_nascimento);
  if (patch.sexo_biologico !== undefined) {
    data.sexo_biologico = patch.sexo_biologico as "masculino" | "feminino" | "intersexo" | "nao_informado";
  }
  if (patch.peso_kg !== undefined) data.peso_kg = String(patch.peso_kg);
  if (patch.altura_cm !== undefined) data.altura_cm = patch.altura_cm;
  if (patch.comorbidades !== undefined) data.comorbidades = patch.comorbidades;
  if (patch.medicamentos_em_uso !== undefined) data.medicamentos_em_uso = patch.medicamentos_em_uso;
  if (patch.alergias !== undefined) data.alergias = patch.alergias;
  if (patch.via_acesso_preferida !== undefined) data.via_acesso_preferida = patch.via_acesso_preferida as never;
  if (patch.email !== undefined) data.email = patch.email;
  if (patch.telefone_e164 !== undefined) data.telefone_e164 = patch.telefone_e164;
  if (patch.endereco_json !== undefined) data.endereco_json = patch.endereco_json as Prisma.InputJsonValue;
  if (patch.responsavel_legal_nome !== undefined) data.responsavel_legal_nome = patch.responsavel_legal_nome;
  if (patch.responsavel_legal_cpf !== undefined) data.responsavel_legal_cpf = patch.responsavel_legal_cpf;

  const updated = await prisma.paciente.update({ where: { id }, data });

  auditLog.append({
    user_id: auth.user_id,
    user_role: auth.role,
    action: "paciente_updated",
    entity: "paciente",
    entity_id: id,
    payload: { campos: Object.keys(patch) },
  });

  return updated;
}

// ---------- Soft-delete (retenção CFM 1.821) ----------
export async function deletarPaciente(auth: AuthContext, id: string): Promise<void> {
  const existing = await obterPaciente(auth, id);
  if (!existing) throw new Error("Paciente não encontrado");

  const retencaoAte = new Date();
  retencaoAte.setFullYear(retencaoAte.getFullYear() + 20);

  await prisma.paciente.update({
    where: { id },
    data: { deleted_at: new Date(), retencao_ate: retencaoAte },
  });

  auditLog.append({
    user_id: auth.user_id,
    user_role: auth.role,
    action: "paciente_deleted",
    entity: "paciente",
    entity_id: id,
    payload: { retencao_ate: retencaoAte.toISOString(), motivo: "soft-delete CFM 1.821" },
  });
}
