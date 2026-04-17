/**
 * Audit log com hash chain — cada evento referencia o hash do anterior.
 * Implementação POC in-memory. Em produção: tabela `audit_event` com Postgres.
 *
 * Por que hash chain: detecção de tampering. Mesmo um admin de DB que apaga uma linha
 * quebra o chain — auditoria forense vê o gap.
 */
import { sha256 } from "./hash.js";
import { uuid } from "./uuid.js";

export type AuditAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "export"
  | "consent_grant"
  | "consent_revoke"
  | "ai_call"
  | "auth_login"
  | "regulacao_diff"
  // --- novos (Prisma era + adapters) ---
  | "login"
  | "logout"
  | "login_failed"
  | "user_created"
  | "user_updated"
  | "paciente_created"
  | "paciente_read"
  | "paciente_updated"
  | "paciente_deleted"
  | "prescricao_signed"
  | "prescricao_emitted"
  | "rdc660_submitted"
  | "telemed_started"
  | "telemed_finished";

export interface AuditEvent {
  id: string;
  ts: string;
  entity: string;
  entity_id?: string;
  action: AuditAction;
  user_id?: string;
  user_role?: string;
  payload_hash: string;
  payload_redacted: Record<string, unknown>;
  hash_anterior: string;
  hash_atual: string;
}

const GENESIS_HASH = "0".repeat(64);

class AuditLog {
  private readonly events: AuditEvent[] = [];

  append(input: {
    entity: string;
    entity_id?: string | undefined;
    action: AuditAction;
    user_id?: string | undefined;
    user_role?: string | undefined;
    payload: Record<string, unknown>;
  }): AuditEvent {
    const ts = new Date().toISOString();
    const hash_anterior = this.events[this.events.length - 1]?.hash_atual ?? GENESIS_HASH;

    // Redação simples — remove campos comuns de PII para o que vai para audit
    const payload_redacted = redactForAudit(input.payload);
    const payload_hash = sha256(JSON.stringify(input.payload));

    const partial = {
      id: uuid(),
      ts,
      entity: input.entity,
      ...(input.entity_id !== undefined ? { entity_id: input.entity_id } : {}),
      action: input.action,
      ...(input.user_id !== undefined ? { user_id: input.user_id } : {}),
      ...(input.user_role !== undefined ? { user_role: input.user_role } : {}),
      payload_hash,
      payload_redacted,
      hash_anterior,
    };

    const hash_atual = sha256(JSON.stringify(partial));
    const event: AuditEvent = { ...partial, hash_atual };
    this.events.push(event);
    return event;
  }

  list(opts: { entity?: string; entity_id?: string; limit?: number } = {}): AuditEvent[] {
    let filtered = this.events;
    if (opts.entity) filtered = filtered.filter((e) => e.entity === opts.entity);
    if (opts.entity_id) filtered = filtered.filter((e) => e.entity_id === opts.entity_id);
    return filtered.slice(-(opts.limit ?? 100));
  }

  /** Verifica integridade do chain — útil para healthcheck */
  verifyChain(): { ok: boolean; broken_at?: number } {
    let prev = GENESIS_HASH;
    for (let i = 0; i < this.events.length; i++) {
      const e = this.events[i];
      if (!e) continue;
      if (e.hash_anterior !== prev) return { ok: false, broken_at: i };
      const recomputed = sha256(
        JSON.stringify({
          id: e.id,
          ts: e.ts,
          entity: e.entity,
          ...(e.entity_id !== undefined ? { entity_id: e.entity_id } : {}),
          action: e.action,
          ...(e.user_id !== undefined ? { user_id: e.user_id } : {}),
          ...(e.user_role !== undefined ? { user_role: e.user_role } : {}),
          payload_hash: e.payload_hash,
          payload_redacted: e.payload_redacted,
          hash_anterior: e.hash_anterior,
        }),
      );
      if (recomputed !== e.hash_atual) return { ok: false, broken_at: i };
      prev = e.hash_atual;
    }
    return { ok: true };
  }

  size(): number {
    return this.events.length;
  }
}

function redactForAudit(payload: Record<string, unknown>): Record<string, unknown> {
  const SENSITIVE = new Set([
    "cpf",
    "rg",
    "cns",
    "nome_completo",
    "endereco",
    "telefone",
    "email",
    "data_nascimento",
    "senha",
    "transcricao",
    "audio_url",
  ]);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload)) {
    if (SENSITIVE.has(k.toLowerCase())) {
      out[k] = "[REDACTED]";
    } else {
      out[k] = v;
    }
  }
  return out;
}

export const auditLog = new AuditLog();
