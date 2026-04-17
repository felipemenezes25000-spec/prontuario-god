/**
 * Budget guard simples in-memory. POC.
 * Em produção: substituir por Redis (chave por paciente/mês), com TTL = início do próximo mês.
 */

export interface BudgetSnapshot {
  patient_id: string;
  spent_brl: number;
  month_key: string;
}

export class InMemoryBudgetStore {
  private readonly store = new Map<string, number>();

  private key(patientId: string): string {
    const now = new Date();
    const ym = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    return `${patientId}:${ym}`;
  }

  add(patientId: string, brl: number): number {
    const k = this.key(patientId);
    const next = (this.store.get(k) ?? 0) + brl;
    this.store.set(k, next);
    return next;
  }

  get(patientId: string): number {
    return this.store.get(this.key(patientId)) ?? 0;
  }

  reset(patientId: string): void {
    this.store.delete(this.key(patientId));
  }

  snapshot(patientId: string): BudgetSnapshot {
    const k = this.key(patientId);
    return {
      patient_id: patientId,
      spent_brl: this.store.get(k) ?? 0,
      month_key: k.split(":")[1] ?? "",
    };
  }
}
