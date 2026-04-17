/**
 * VIDaaS (Valid) — cloud signing ICP-Brasil.
 *
 * Docs públicos: https://developer.valid.com/
 *
 * Fluxo OAuth2 (resumo):
 * 1. GET /oauth2/auth?client_id=...&redirect_uri=...&scope=signature_session
 *    → redireciona ao Valid que autentica o médico (biometria no app Valid)
 * 2. Callback com code → troca por access_token
 * 3. POST /signatures com { hash, cert_thumbprint, ... }
 * 4. Usuário recebe push no app Valid e aprova
 * 5. API retorna signature CMS/PKCS#7 → embutimos no PDF (PAdES-B-LT)
 *
 * Implementação produção deve:
 * - Refresh token handling (short access + long refresh)
 * - PDF embedding com pdf-lib ou @signpdf/signpdf (PAdES-B-LT)
 * - Timestamp TSA (acórdão ANVISA exige)
 * - Retry exponencial em 503
 *
 * Esta classe deixa o contrato pronto — a implementação real precisa das credenciais
 * e uma conta parceira com a Valid.
 */
import type { IcpBrasilAdapter } from "./types.js";
import { env } from "../../env.js";

export const icpBrasilVidaasAdapter: IcpBrasilAdapter = {
  async listarCertificados(_medico_user_id: string) {
    requireCreds();
    throw new Error("VIDaaS.listarCertificados não implementado. Integração requer contrato Valid + OAuth2 flow.");
  },

  async assinar(_pedido) {
    requireCreds();
    throw new Error("VIDaaS.assinar não implementado. Integração requer contrato Valid + OAuth2 flow.");
  },

  async validar(_pdf_bytes) {
    requireCreds();
    throw new Error("VIDaaS.validar não implementado.");
  },
};

function requireCreds(): void {
  if (!env.ICP_BRASIL_VIDAAS_BASE_URL || !env.ICP_BRASIL_CLIENT_ID || !env.ICP_BRASIL_CLIENT_SECRET) {
    throw new Error(
      "VIDaaS: defina ICP_BRASIL_VIDAAS_BASE_URL, ICP_BRASIL_CLIENT_ID, ICP_BRASIL_CLIENT_SECRET no .env",
    );
  }
}
