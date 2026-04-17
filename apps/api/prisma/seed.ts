/**
 * Seed Prisma — popula desenvolvimento com:
 * - 1 Clínica (Meridiana Paulista)
 * - 2 Médicos (Dra. Ana Lima + Dr. João Marques)
 * - 3 Pacientes (Maria, Carlos, Lucia)
 * - Catálogo completo de produtos
 * - 3 Prescrições de exemplo
 *
 * Executar: pnpm --filter @meridiana/api db:seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CATALOGO_SEED } from "../src/catalog/produtos-seed.js";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log("[seed] iniciando…");

  // ---------- Clínica ----------
  const clinic = await prisma.clinic.upsert({
    where: { cnpj: "12345678000190" },
    create: {
      razao_social: "Meridiana Cannabis Medicinal LTDA",
      nome_fantasia: "Meridiana Paulista",
      cnpj: "12345678000190",
      cnes: "1234567",
      endereco_json: {
        logradouro: "Av. Paulista",
        numero: "1000",
        cep: "01310100",
        uf: "SP",
        municipio: "São Paulo",
        ibge: "3550308",
      },
      telefone_e164: "+551133331234",
      email: "contato@meridiana.health",
      website: "https://meridiana.health",
      plano: "clinica",
    },
    update: {},
  });
  console.log("  ✓ clínica:", clinic.nome_fantasia);

  // ---------- Médicos ----------
  const senhaHash = await bcrypt.hash("SenhaSegura2026!", 12);

  const userAna = await prisma.user.upsert({
    where: { email: "ana@meridiana.health" },
    create: {
      email: "ana@meridiana.health",
      password_hash: senhaHash,
      nome_completo: "Dra. Ana Beatriz Lima",
      cpf: "11144477735",
      telefone_e164: "+5511988776655",
      role: "medico",
      email_verified: true,
    },
    update: {},
  });
  const medicoAna = await prisma.medico.upsert({
    where: { user_id: userAna.id },
    create: {
      user_id: userAna.id,
      clinic_id: clinic.id,
      crm_numero: "123456",
      crm_uf: "SP",
      crm_status: "ativo",
      crm_verificado_em: new Date(),
      especialidade: ["dor", "cuidados_paliativos"],
      rqe: ["12345"],
    },
    update: {},
  });
  await prisma.clinicMembership.upsert({
    where: { clinic_id_user_id: { clinic_id: clinic.id, user_id: userAna.id } },
    create: { clinic_id: clinic.id, user_id: userAna.id, role: "owner" },
    update: {},
  });
  console.log("  ✓ médica:", userAna.nome_completo);

  const userJoao = await prisma.user.upsert({
    where: { email: "joao@meridiana.health" },
    create: {
      email: "joao@meridiana.health",
      password_hash: senhaHash,
      nome_completo: "Dr. João Marques",
      cpf: "22255588846",
      role: "medico",
      email_verified: true,
    },
    update: {},
  });
  const medicoJoao = await prisma.medico.upsert({
    where: { user_id: userJoao.id },
    create: {
      user_id: userJoao.id,
      clinic_id: clinic.id,
      crm_numero: "234567",
      crm_uf: "SP",
      crm_status: "ativo",
      crm_verificado_em: new Date(),
      especialidade: ["neurologia", "psiquiatria"],
    },
    update: {},
  });
  await prisma.clinicMembership.upsert({
    where: { clinic_id_user_id: { clinic_id: clinic.id, user_id: userJoao.id } },
    create: { clinic_id: clinic.id, user_id: userJoao.id, role: "medico" },
    update: {},
  });

  // ---------- Pacientes ----------
  const mariaUser = await prisma.user.upsert({
    where: { email: "maria.silva@paciente.meridiana.health" },
    create: {
      email: "maria.silva@paciente.meridiana.health",
      password_hash: senhaHash,
      nome_completo: "Maria Silva",
      cpf: "12345678909",
      role: "paciente",
      email_verified: true,
    },
    update: {},
  });
  const maria = await prisma.paciente.upsert({
    where: { cpf: "12345678909" },
    create: {
      user_id: mariaUser.id,
      clinic_id: clinic.id,
      medico_responsavel_id: medicoAna.id,
      nome_completo: "Maria Silva",
      cpf: "12345678909",
      data_nascimento: new Date("1978-03-12"),
      sexo_biologico: "feminino",
      peso_kg: "68",
      altura_cm: 162,
      comorbidades: ["fibromialgia", "depressão moderada"],
      medicamentos_em_uso: ["duloxetina 60mg/dia", "pregabalina 150mg 2x/dia"],
      alergias: [],
      via_acesso_preferida: "anvisa_industrializado",
      consentimento_clinico_em: new Date(),
      prontuario: {
        create: {
          medico_responsavel_id: medicoAna.id,
          cid10_principal: "M79.7",
          cid10_secundarios: ["F32.1"],
          evidencia_indicacao: "B",
          resumo_atual: "Paciente com fibromialgia refratária a pregabalina+duloxetina; candidata a cannabis 20:1.",
        },
      },
    },
    update: {},
  });
  console.log("  ✓ paciente:", maria.nome_completo);

  const carlos = await prisma.paciente.upsert({
    where: { cpf: "98765432100" },
    create: {
      clinic_id: clinic.id,
      medico_responsavel_id: medicoJoao.id,
      nome_completo: "Carlos Augusto Pereira",
      cpf: "98765432100",
      data_nascimento: new Date("1965-11-04"),
      sexo_biologico: "masculino",
      peso_kg: "88",
      altura_cm: 175,
      comorbidades: ["doença de parkinson", "tremor essencial"],
      medicamentos_em_uso: ["levodopa + carbidopa 250mg 4x/dia"],
      alergias: ["dipirona"],
      via_acesso_preferida: "anvisa_rdc_660_importacao",
      consentimento_clinico_em: new Date(),
      prontuario: {
        create: {
          medico_responsavel_id: medicoJoao.id,
          cid10_principal: "G20",
          evidencia_indicacao: "B",
          resumo_atual: "Parkinson com tremor refratário; Sativex importado via RDC 660.",
        },
      },
    },
    update: {},
  });

  const lucia = await prisma.paciente.upsert({
    where: { cpf: "55566677788" },
    create: {
      clinic_id: clinic.id,
      medico_responsavel_id: medicoJoao.id,
      nome_completo: "Lucia Fernandes",
      cpf: "55566677788",
      data_nascimento: new Date("2012-05-20"),
      sexo_biologico: "feminino",
      peso_kg: "34",
      altura_cm: 142,
      comorbidades: ["síndrome de dravet", "epilepsia refratária"],
      medicamentos_em_uso: ["clobazam 10mg", "valproato 750mg"],
      alergias: [],
      responsavel_legal_nome: "Patricia Fernandes",
      responsavel_legal_cpf: "44422299901",
      via_acesso_preferida: "anvisa_industrializado",
      consentimento_clinico_em: new Date(),
      prontuario: {
        create: {
          medico_responsavel_id: medicoJoao.id,
          cid10_principal: "G40.4",
          evidencia_indicacao: "A",
          resumo_atual: "Dravet; CBD isolado 100mg/mL em titulação, mãe é responsável legal.",
        },
      },
    },
    update: {},
  });

  // ---------- Catálogo ----------
  console.log("  → catálogo:", CATALOGO_SEED.length, "produtos");
  for (const p of CATALOGO_SEED) {
    // Usa nome_comercial + fabricante como chave natural
    const existing = await prisma.produto.findFirst({
      where: { nome_comercial: p.nome_comercial, fabricante: p.fabricante },
    });
    if (!existing) {
      await prisma.produto.create({ data: p });
    }
  }
  const totalProdutos = await prisma.produto.count();
  console.log("  ✓ produtos no DB:", totalProdutos);

  // ---------- Subscription ----------
  await prisma.subscription.upsert({
    where: { provider_sub_id: "sub_mock_seed" },
    create: {
      clinic_id: clinic.id,
      provider: "mock",
      provider_customer_id: "cus_mock_seed",
      provider_sub_id: "sub_mock_seed",
      plan: "clinica",
      status: "active",
      current_period_start: new Date(),
      current_period_end: new Date(Date.now() + 30 * 86400_000),
    },
    update: {},
  });

  console.log("[seed] ✓ concluído");
}

main()
  .catch((e) => {
    console.error("[seed] ✗ erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
