/**
 * Mock ICP-Brasil — para demos e desenvolvimento.
 *
 * Produz um PDF "assinado" simulado (concatena marcação ao bytes) e um hash real.
 * A cadeia de confiança é falsa — NÃO usar em produção.
 */
import { createHash } from "node:crypto";
import type { IcpBrasilAdapter, PedidoAssinatura, ResultadoAssinatura, CertificadoICP } from "./types.js";

const MOCK_CERT: CertificadoICP = {
  thumbprint: "MOCK-THUMB-0000-1111-2222-3333",
  titular_nome: "DR. MOCK CANNABIS",
  titular_cpf: "11144477735",
  serial_number: "MOCK-SERIAL-42",
  valido_de: "2025-01-01T00:00:00Z",
  valido_ate: "2028-12-31T23:59:59Z",
  emissor: "AC Mock Meridiana Dev v1",
  tipo: "A3",
  provider: "mock",
};

export const icpBrasilMockAdapter: IcpBrasilAdapter = {
  async listarCertificados(_medico_user_id) {
    return [MOCK_CERT];
  },

  async assinar(pedido: PedidoAssinatura): Promise<ResultadoAssinatura> {
    const hash = createHash("sha256").update(pedido.pdf_bytes).digest("hex");
    // PDF "assinado" = PDF original + rodapé mock
    const rodape = new TextEncoder().encode(
      `\n%% MERIDIANA-MOCK-ICP-SIGNATURE thumbprint=${MOCK_CERT.thumbprint} hash=${hash} signed_at=${new Date().toISOString()}\n`,
    );
    const pdfAssinado = new Uint8Array(pedido.pdf_bytes.length + rodape.length);
    pdfAssinado.set(pedido.pdf_bytes, 0);
    pdfAssinado.set(rodape, pedido.pdf_bytes.length);
    return {
      sucesso: true,
      pdf_assinado_bytes: pdfAssinado,
      hash_sha256: hash,
      timestamp_tsa: Buffer.from(`mock-tsa-${Date.now()}`).toString("base64"),
      certificado: MOCK_CERT,
    };
  },

  async validar(pdf_bytes: Uint8Array) {
    const str = new TextDecoder().decode(pdf_bytes.slice(-256));
    if (str.includes("MERIDIANA-MOCK-ICP-SIGNATURE")) {
      return { valida: true, certificado: MOCK_CERT };
    }
    return { valida: false, erro: "Assinatura mock não detectada no PDF" };
  },
};
