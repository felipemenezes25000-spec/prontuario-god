/**
 * Repository — interface agnóstica persistência.
 *
 * Por que não usar direto o PrismaClient em toda parte?
 * - Testes ficam dependentes de banco real
 * - LGPD: precisamos de camada onde injetar audit/encryption interceptors
 * - Pluggabilidade: migrar p/ outro ORM (Drizzle, Kysely) sem reescrever services
 *
 * Cada módulo acessa `repos.pacientes`, `repos.prescricoes` etc.
 * Em testes: `DB_MODE=memory` (default) — isolado, rápido.
 * Em produção: `DB_MODE=prisma` — ACID, migrations, backups.
 */
import { uuid } from "../lib/uuid.js";

export interface BaseEntity {
  id: string;
  criado_em: string;
}

export interface Repository<T extends BaseEntity> {
  insert(input: Omit<T, "id" | "criado_em"> & Partial<Pick<T, "id" | "criado_em">>): T;
  get(id: string): T | undefined;
  list(filter?: (item: T) => boolean): T[];
  update(id: string, patch: Partial<T>): T | undefined;
  remove(id: string): boolean;
  count(): number;
}

export function createInMemoryRepository<T extends BaseEntity>(): Repository<T> {
  const data = new Map<string, T>();

  return {
    insert(input) {
      const id = (input.id as string | undefined) ?? uuid();
      const criado_em = (input.criado_em as string | undefined) ?? new Date().toISOString();
      const item = { ...input, id, criado_em } as T;
      data.set(id, item);
      return item;
    },
    get(id) {
      return data.get(id);
    },
    list(filter) {
      const all = Array.from(data.values());
      return filter ? all.filter(filter) : all;
    },
    update(id, patch) {
      const existing = data.get(id);
      if (!existing) return undefined;
      const updated = { ...existing, ...patch, id: existing.id, criado_em: existing.criado_em };
      data.set(id, updated);
      return updated;
    },
    remove(id) {
      return data.delete(id);
    },
    count() {
      return data.size;
    },
  };
}
