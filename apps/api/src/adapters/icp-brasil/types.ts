/**
 * ICP-Brasil — assinatura digital de prescrições.
 *
 * Contexto regulatório:
 * - CFM 2.299/21 + MP 2.200-2/2001: assinatura digital ICP-Brasil tem validade jurídica
 * - Receitas tipo A/B só são 100% válidas eletronicamente com assinatura ICP-Brasil A3 (cartão/token)
 *   ou A1 em nuvem (certificados "na nuvem" aprovados AC-Raiz)
 *
 * Providers brasileiros comuns:
 * - VIDaaS (Valid): cloud signing com autenticação biométrica
 * - BirdID (SoluteCert): cloud com 2FA
 * - Soluti: híbrido (cloud + token físico)
 * - Certisign / Serasa: mais tradicionais, cartão/token físico
 *
 * Fluxo típico:
 * 1. Médico autentica com o provider via OAuth2 (primeira vez)
 * 2. Para assinar: app envia hash SHA-256 do PDF
 * 3. Provider confirma ao médico (app mobile / biometria)
 * 4. Retorna assinatura PKCS#7/CMS → embutimos no PDF como PAdES-B-LT
 *
 * Assinatura PAdES-B-LT é o padrão para saúde (long-term, com timestamp TSA).
 */

export interface CertificadoICP {
  thumbprint: string;          // SHA-256 do certificado em hex
  titular_nome: string;
  titular_cpf: string;
  serial_number: string;
  valido_de: string;           // ISO
  valido_ate: string;          // ISO
  emissor: string;             // AC emissora (ex: "AC Serasa RFB v5")
  tipo: "A1" | "A3" | "e_cnpj_a1" | "e_cnpj_a3";
  provider: "vidaas" | "birdid" | "soluti" | "certisign" | "serasa" | "mock";
}

export interface PedidoAssinatura {
  medico_user_id: string;
  pdf_bytes: Uint8Array;       // PDF a ser assinado
  documento_nome: string;      // "Receita_Maria_Silva_2026-04-17.pdf"
  metadados?: {
    paciente_cpf?: string;
    prescricao_id?: string;
    tipo_receita?: "A" | "B";
  };
}

export interface ResultadoAssinatura {
  sucesso: boolean;
  assinatura_id?: string;      // id do nosso model AssinaturaDigital
  pdf_assinado_bytes?: Uint8Array; // PDF já com carimbo PAdES embutido
  hash_sha256: string;
  timestamp_tsa?: string;      // timestamp token (base64)
  certificado?: CertificadoICP;
  raw?: unknown;
  erro?: string;
}

export interface IcpBrasilAdapter {
  /** Lista certificados do médico (pré-cache antes de assinar) */
  listarCertificados(medico_user_id: string): Promise<CertificadoICP[]>;

  /** Assina um PDF. Pode exigir interação do usuário (push mobile) */
  assinar(pedido: PedidoAssinatura): Promise<ResultadoAssinatura>;

  /** Valida uma assinatura existente (verify chain + TSA + LCR) */
  validar(pdf_bytes: Uint8Array): Promise<{
    valida: boolean;
    certificado?: CertificadoICP;
    erro?: string;
  }>;
}
