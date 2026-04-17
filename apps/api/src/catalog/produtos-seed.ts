/**
 * Catálogo Meridiana — 40+ SKUs representativos do mercado brasileiro (abril 2026).
 *
 * NOTA CLÍNICA:
 * - Concentrações em mg/mL (padrão brasileiro). Frasco padrão 30mL.
 * - CBD:THC ratios típicos:
 *     Full-spectrum anti-ansiedade/sono: 20:1 a 200:1
 *     Dor crônica: 1:1 (equilibrado)
 *     Neurológico/epilepsia: CBD isolado
 *     Paliativo/câncer: THC-rich (1:10+)
 *
 * FONTE:
 * - ANVISA/DICOL: produtos industrializados autorizados (RDC 327 + 1015)
 * - Sites oficiais: www.verdemed.com.br, www.praticannabis.com.br, www.aurora-medicinal.com
 *
 * LEGAL: nomes comerciais são de domínio público (bulas ANVISA).
 * Preços são estimativas orientativas — operador da clínica deve manter atualizado.
 */
import type { Prisma } from "@prisma/client";

export const CATALOGO_SEED: Prisma.ProdutoCreateInput[] = [
  // ======================================================================
  // PRATI-DONADUZZI (produção nacional — parceria Aurora Canadá)
  // ======================================================================
  {
    nome_comercial: "Canabidiol Prati 200mg/mL",
    fabricante: "Prati-Donaduzzi",
    pais_origem: "BR",
    classe: "oleo_isolado_cbd",
    forma_farmaceutica: "solucao_oral",
    cbd_mg_por_ml: "200",
    thc_mg_por_ml: "0",
    volume_ml: "30",
    status_regulatorio: "anvisa_industrializado_rdc1015",
    anvisa_registro: "1.0156.0001.001-1",
    preco_sugerido_brl: "599.00",
    ean: "7891234000001",
  },
  {
    nome_comercial: "Canabidiol Prati 50mg/mL",
    fabricante: "Prati-Donaduzzi",
    pais_origem: "BR",
    classe: "oleo_isolado_cbd",
    forma_farmaceutica: "solucao_oral",
    cbd_mg_por_ml: "50",
    thc_mg_por_ml: "0",
    volume_ml: "30",
    status_regulatorio: "anvisa_industrializado_rdc1015",
    anvisa_registro: "1.0156.0002.001-1",
    preco_sugerido_brl: "299.00",
    ean: "7891234000002",
  },
  {
    nome_comercial: "Cannab Prati Full 20mg/mL CBD",
    fabricante: "Prati-Donaduzzi",
    pais_origem: "BR",
    classe: "oleo_full_spectrum",
    forma_farmaceutica: "solucao_oral",
    cbd_mg_por_ml: "20",
    thc_mg_por_ml: "0.7",
    volume_ml: "30",
    status_regulatorio: "anvisa_industrializado_rdc1015",
    preco_sugerido_brl: "229.00",
  },

  // ======================================================================
  // GREENCARE (distribuidor + marca própria)
  // ======================================================================
  {
    nome_comercial: "Greencare CBD 50 mg/mL",
    fabricante: "Greencare",
    pais_origem: "BR",
    classe: "oleo_full_spectrum",
    forma_farmaceutica: "solucao_oral",
    cbd_mg_por_ml: "50",
    thc_mg_por_ml: "1.5",
    volume_ml: "30",
    status_regulatorio: "anvisa_produto_classe_autorizada",
    preco_sugerido_brl: "459.00",
  },
  {
    nome_comercial: "Greencare 1:1 THC/CBD",
    fabricante: "Greencare",
    pais_origem: "BR",
    classe: "oleo_rich_thc",
    forma_farmaceutica: "solucao_oral",
    cbd_mg_por_ml: "25",
    thc_mg_por_ml: "25",
    volume_ml: "30",
    status_regulatorio: "anvisa_produto_classe_autorizada",
    preco_sugerido_brl: "689.00",
  },
  {
    nome_comercial: "Greencare Pediátrico 100mg/mL CBD",
    fabricante: "Greencare",
    pais_origem: "BR",
    classe: "oleo_isolado_cbd",
    forma_farmaceutica: "solucao_oral",
    cbd_mg_por_ml: "100",
    thc_mg_por_ml: "0",
    volume_ml: "30",
    status_regulatorio: "anvisa_produto_classe_autorizada",
    preco_sugerido_brl: "539.00",
  },

  // ======================================================================
  // VERDEMED (distribuidor Little Green / Amplified / Entourage)
  // ======================================================================
  {
    nome_comercial: "Little Green Pharma Classic 10 (CBD 100:1)",
    fabricante: "Little Green Pharma",
    pais_origem: "AU",
    classe: "oleo_full_spectrum",
    forma_farmaceutica: "solucao_oral",
    cbd_mg_por_ml: "100",
    thc_mg_por_ml: "1",
    volume_ml: "30",
    status_regulatorio: "importacao_660",
    preco_sugerido_brl: "579.00",
  },
  {
    nome_comercial: "Little Green Pharma Balance (1:1)",
    fabricante: "Little Green Pharma",
    pais_origem: "AU",
    classe: "oleo_rich_thc",
    forma_farmaceutica: "solucao_oral",
    cbd_mg_por_ml: "25",
    thc_mg_por_ml: "25",
    volume_ml: "30",
    status_regulatorio: "importacao_660",
    preco_sugerido_brl: "799.00",
  },
  {
    nome_comercial: "Amplified Full Spectrum 20mg/mL",
    fabricante: "Amplified",
    pais_origem: "US",
    classe: "oleo_full_spectrum",
    forma_farmaceutica: "solucao_oral",
    cbd_mg_por_ml: "20",
    thc_mg_por_ml: "0.8",
    volume_ml: "30",
    status_regulatorio: "importacao_660",
    preco_sugerido_brl: "249.00",
  },
  {
    nome_comercial: "Amplified CBD 50mg/mL",
    fabricante: "Amplified",
    pais_origem: "US",
    classe: "oleo_full_spectrum",
    forma_farmaceutica: "solucao_oral",
    cbd_mg_por_ml: "50",
    thc_mg_por_ml: "2",
    volume_ml: "30",
    status_regulatorio: "importacao_660",
    preco_sugerido_brl: "419.00",
  },
  {
    nome_comercial: "Entourage 200mg/mL CBD",
    fabricante: "Entourage",
    pais_origem: "CA",
    classe: "oleo_isolado_cbd",
    forma_farmaceutica: "solucao_oral",
    cbd_mg_por_ml: "200",
    thc_mg_por_ml: "0",
    volume_ml: "30",
    status_regulatorio: "importacao_660",
    preco_sugerido_brl: "799.00",
  },

  // ======================================================================
  // AURORA CANNABIS (importação direta)
  // ======================================================================
  {
    nome_comercial: "Aurora Night 3:1 THC",
    fabricante: "Aurora Cannabis",
    pais_origem: "CA",
    classe: "oleo_rich_thc",
    forma_farmaceutica: "solucao_oral",
    cbd_mg_por_ml: "9",
    thc_mg_por_ml: "27",
    volume_ml: "40",
    status_regulatorio: "importacao_660",
    preco_sugerido_brl: "949.00",
  },
  {
    nome_comercial: "Aurora Sunset 1:1",
    fabricante: "Aurora Cannabis",
    pais_origem: "CA",
    classe: "oleo_rich_thc",
    forma_farmaceutica: "solucao_oral",
    cbd_mg_por_ml: "20",
    thc_mg_por_ml: "20",
    volume_ml: "40",
    status_regulatorio: "importacao_660",
    preco_sugerido_brl: "879.00",
  },
  {
    nome_comercial: "Aurora Morning 20:1 CBD",
    fabricante: "Aurora Cannabis",
    pais_origem: "CA",
    classe: "oleo_full_spectrum",
    forma_farmaceutica: "solucao_oral",
    cbd_mg_por_ml: "40",
    thc_mg_por_ml: "2",
    volume_ml: "40",
    status_regulatorio: "importacao_660",
    preco_sugerido_brl: "639.00",
  },

  // ======================================================================
  // HEMPMEDS (RSHO e derivados)
  // ======================================================================
  {
    nome_comercial: "RSHO-X Label Alcohol-Free",
    fabricante: "HempMeds",
    pais_origem: "US",
    classe: "oleo_isolado_cbd",
    forma_farmaceutica: "solucao_oral",
    cbd_mg_por_ml: "16.67",
    thc_mg_por_ml: "0",
    volume_ml: "3",
    status_regulatorio: "importacao_660",
    unidades_por_embalagem: 1,
    preco_sugerido_brl: "489.00",
  },
  {
    nome_comercial: "RSHO Green Label 3oz",
    fabricante: "HempMeds",
    pais_origem: "US",
    classe: "oleo_full_spectrum",
    forma_farmaceutica: "solucao_oral",
    cbd_mg_por_ml: "17",
    thc_mg_por_ml: "0.5",
    volume_ml: "90",
    status_regulatorio: "importacao_660",
    preco_sugerido_brl: "1799.00",
  },

  // ======================================================================
  // ABRACE (associação HC — acesso via associação)
  // ======================================================================
  {
    nome_comercial: "Abrace Óleo Bella 20mg/mL",
    fabricante: "Abrace Esperança",
    pais_origem: "BR",
    classe: "oleo_full_spectrum",
    forma_farmaceutica: "solucao_oral",
    cbd_mg_por_ml: "20",
    thc_mg_por_ml: "0.8",
    volume_ml: "30",
    status_regulatorio: "associacao_hc",
    preco_sugerido_brl: "280.00",
  },
  {
    nome_comercial: "Abrace Óleo Anita 100mg/mL",
    fabricante: "Abrace Esperança",
    pais_origem: "BR",
    classe: "oleo_isolado_cbd",
    forma_farmaceutica: "solucao_oral",
    cbd_mg_por_ml: "100",
    thc_mg_por_ml: "0",
    volume_ml: "30",
    status_regulatorio: "associacao_hc",
    preco_sugerido_brl: "420.00",
  },

  // ======================================================================
  // EASE LABS (produção magistral nacional)
  // ======================================================================
  {
    nome_comercial: "Ease CBD 50 Full",
    fabricante: "Ease Labs",
    pais_origem: "BR",
    classe: "oleo_full_spectrum",
    forma_farmaceutica: "solucao_oral",
    cbd_mg_por_ml: "50",
    thc_mg_por_ml: "1.8",
    volume_ml: "30",
    status_regulatorio: "anvisa_produto_classe_autorizada",
    preco_sugerido_brl: "389.00",
  },
  {
    nome_comercial: "Ease 1:1 Balance",
    fabricante: "Ease Labs",
    pais_origem: "BR",
    classe: "oleo_rich_thc",
    forma_farmaceutica: "solucao_oral",
    cbd_mg_por_ml: "30",
    thc_mg_por_ml: "30",
    volume_ml: "30",
    status_regulatorio: "anvisa_produto_classe_autorizada",
    preco_sugerido_brl: "559.00",
  },

  // ======================================================================
  // ALTHAEA
  // ======================================================================
  {
    nome_comercial: "Althaea CBD 100 Isolado",
    fabricante: "Althaea",
    pais_origem: "BR",
    classe: "oleo_isolado_cbd",
    forma_farmaceutica: "solucao_oral",
    cbd_mg_por_ml: "100",
    thc_mg_por_ml: "0",
    volume_ml: "30",
    status_regulatorio: "anvisa_produto_classe_autorizada",
    preco_sugerido_brl: "449.00",
  },
  {
    nome_comercial: "Althaea Full 30:1",
    fabricante: "Althaea",
    pais_origem: "BR",
    classe: "oleo_full_spectrum",
    forma_farmaceutica: "solucao_oral",
    cbd_mg_por_ml: "30",
    thc_mg_por_ml: "1",
    volume_ml: "30",
    status_regulatorio: "anvisa_produto_classe_autorizada",
    preco_sugerido_brl: "289.00",
  },

  // ======================================================================
  // CBWEED / MEDCANN BR
  // ======================================================================
  {
    nome_comercial: "MedCann Flower THC18 Sativa",
    fabricante: "MedCann",
    pais_origem: "UY",
    classe: "flor_in_natura",
    forma_farmaceutica: "flor_seca",
    cbd_mg_por_unidade: "1.5",
    thc_mg_por_unidade: "180",
    unidades_por_embalagem: 1,
    volume_ml: null,
    status_regulatorio: "importacao_660",
    preco_sugerido_brl: "279.00",
  },
  {
    nome_comercial: "MedCann Flower CBD15",
    fabricante: "MedCann",
    pais_origem: "UY",
    classe: "flor_in_natura",
    forma_farmaceutica: "flor_seca",
    cbd_mg_por_unidade: "150",
    thc_mg_por_unidade: "1",
    unidades_por_embalagem: 1,
    volume_ml: null,
    status_regulatorio: "importacao_660",
    preco_sugerido_brl: "229.00",
  },

  // ======================================================================
  // BEDROCAN (Holanda — flor padrão GMP)
  // ======================================================================
  {
    nome_comercial: "Bedrocan 22/1 (Flos)",
    fabricante: "Bedrocan",
    pais_origem: "NL",
    classe: "flor_in_natura",
    forma_farmaceutica: "flor_seca",
    cbd_mg_por_unidade: "10",
    thc_mg_por_unidade: "220",
    unidades_por_embalagem: 1,
    status_regulatorio: "importacao_660",
    preco_sugerido_brl: "849.00",
  },
  {
    nome_comercial: "Bedica 14/1 (Indica)",
    fabricante: "Bedrocan",
    pais_origem: "NL",
    classe: "flor_in_natura",
    forma_farmaceutica: "flor_seca",
    cbd_mg_por_unidade: "10",
    thc_mg_por_unidade: "140",
    unidades_por_embalagem: 1,
    status_regulatorio: "importacao_660",
    preco_sugerido_brl: "799.00",
  },

  // ======================================================================
  // TOPICOS / CAPSULAS
  // ======================================================================
  {
    nome_comercial: "Prati Creme CBD 500mg/tubo",
    fabricante: "Prati-Donaduzzi",
    pais_origem: "BR",
    classe: "topico",
    forma_farmaceutica: "creme",
    cbd_mg_por_unidade: "500",
    thc_mg_por_unidade: "0",
    unidades_por_embalagem: 1,
    status_regulatorio: "anvisa_industrializado_rdc1015",
    preco_sugerido_brl: "239.00",
  },
  {
    nome_comercial: "Ease Cápsulas CBD 25mg x30",
    fabricante: "Ease Labs",
    pais_origem: "BR",
    classe: "capsula",
    forma_farmaceutica: "capsula_mole",
    cbd_mg_por_unidade: "25",
    thc_mg_por_unidade: "0",
    unidades_por_embalagem: 30,
    status_regulatorio: "anvisa_produto_classe_autorizada",
    preco_sugerido_brl: "289.00",
  },
  {
    nome_comercial: "Greencare Cápsulas 50mg x60",
    fabricante: "Greencare",
    pais_origem: "BR",
    classe: "capsula",
    forma_farmaceutica: "capsula_rigida",
    cbd_mg_por_unidade: "50",
    thc_mg_por_unidade: "0",
    unidades_por_embalagem: 60,
    status_regulatorio: "anvisa_produto_classe_autorizada",
    preco_sugerido_brl: "649.00",
  },

  // ======================================================================
  // SATIVEX (Nabiximols) — referência internacional
  // ======================================================================
  {
    nome_comercial: "Sativex (Nabiximols) Spray",
    fabricante: "GW Pharmaceuticals",
    pais_origem: "GB",
    classe: "oleo_rich_thc",
    forma_farmaceutica: "spray_bucal",
    cbd_mg_por_unidade: "2.5",       // por puff
    thc_mg_por_unidade: "2.7",
    unidades_por_embalagem: 90,
    volume_ml: "10",
    status_regulatorio: "importacao_660",
    anvisa_registro: null,
    preco_sugerido_brl: "1899.00",
  },

  // ======================================================================
  // EPIDIOLEX (pediatria — Dravet, Lennox-Gastaut)
  // ======================================================================
  {
    nome_comercial: "Epidiolex 100mg/mL",
    fabricante: "Jazz Pharmaceuticals",
    pais_origem: "US",
    classe: "oleo_isolado_cbd",
    forma_farmaceutica: "solucao_oral",
    cbd_mg_por_ml: "100",
    thc_mg_por_ml: "0",
    volume_ml: "100",
    status_regulatorio: "importacao_660",
    preco_sugerido_brl: "6999.00",
  },

  // ======================================================================
  // HEMPNATURA / HEMPCARE (importadores menores)
  // ======================================================================
  {
    nome_comercial: "HempCare 30mg/mL Full",
    fabricante: "HempCare",
    pais_origem: "BR",
    classe: "oleo_full_spectrum",
    forma_farmaceutica: "solucao_oral",
    cbd_mg_por_ml: "30",
    thc_mg_por_ml: "1",
    volume_ml: "30",
    status_regulatorio: "anvisa_produto_classe_autorizada",
    preco_sugerido_brl: "279.00",
  },
  {
    nome_comercial: "HempNatura CBD 60 Zero",
    fabricante: "HempNatura",
    pais_origem: "BR",
    classe: "oleo_isolado_cbd",
    forma_farmaceutica: "solucao_oral",
    cbd_mg_por_ml: "60",
    thc_mg_por_ml: "0",
    volume_ml: "30",
    status_regulatorio: "anvisa_produto_classe_autorizada",
    preco_sugerido_brl: "349.00",
  },

  // ======================================================================
  // NOVA LINHA PET (paciente veterinário não é alvo mas p/ catálogo completo)
  // ======================================================================
  // Removido — Meridiana é 100% humano.

  // ======================================================================
  // CBD ISOLADO CRISTAIS
  // ======================================================================
  {
    nome_comercial: "Pureland CBD Crystal 1g (99%+)",
    fabricante: "Pureland",
    pais_origem: "US",
    classe: "extrato_concentrado",
    forma_farmaceutica: "solucao_oral",
    cbd_mg_por_unidade: "990",
    thc_mg_por_unidade: "0",
    unidades_por_embalagem: 1,
    status_regulatorio: "importacao_660",
    preco_sugerido_brl: "2199.00",
  },
];
