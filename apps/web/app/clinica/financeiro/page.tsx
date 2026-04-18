"use client";

import { useState } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { Topbar } from "@/components/shell/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal, ModalField, ModalInput, ModalSelect } from "@/components/ui/Modal";
import { useToast } from "@/providers/ToastProvider";

interface Fatura {
  id: string;
  data: string;
  paciente: string;
  servico: string;
  valor: number;
  status: "paga" | "pendente" | "atrasada";
  forma: string;
}

const INIT: Fatura[] = [
  { id: "f1", data: "15 abr 2026", paciente: "Maria Silva", servico: "Consulta retorno", valor: 350, status: "paga", forma: "PIX" },
  { id: "f2", data: "14 abr 2026", paciente: "Lucia Fernandes", servico: "Consulta titulação (pediatria)", valor: 420, status: "paga", forma: "Cartão" },
  { id: "f3", data: "14 abr 2026", paciente: "Gabriela Torres", servico: "Telemedicina + ajuste RDC 660", valor: 280, status: "paga", forma: "PIX" },
  { id: "f4", data: "13 abr 2026", paciente: "Henrique Dias", servico: "Telemedicina retorno", valor: 280, status: "paga", forma: "Cartão" },
  { id: "f5", data: "12 abr 2026", paciente: "Sandra Lima", servico: "Primeira consulta", valor: 450, status: "paga", forma: "PIX" },
  { id: "f6", data: "12 abr 2026", paciente: "Pedro Martins", servico: "Consulta retorno", valor: 350, status: "pendente", forma: "—" },
  { id: "f7", data: "11 abr 2026", paciente: "Carla Mendes", servico: "Telemedicina (TEA)", valor: 300, status: "paga", forma: "PIX" },
  { id: "f8", data: "10 abr 2026", paciente: "Rafael Gomes", servico: "Primeira consulta", valor: 450, status: "paga", forma: "Cartão" },
  { id: "f9", data: "10 abr 2026", paciente: "Júlia Barbosa", servico: "Consulta retorno (pediatria)", valor: 350, status: "paga", forma: "PIX" },
  { id: "f10", data: "08 abr 2026", paciente: "Alberto Nunes", servico: "Consulta paliativa + RDC 660", valor: 520, status: "atrasada", forma: "—" },
];

const MENSAL = [
  { mes: "Nov 25", receita: 12400 },
  { mes: "Dez 25", receita: 13800 },
  { mes: "Jan 26", receita: 14200 },
  { mes: "Fev 26", receita: 15900 },
  { mes: "Mar 26", receita: 17300 },
  { mes: "Abr 26", receita: 9850 },
];
const max = Math.max(...MENSAL.map((m) => m.receita));

export default function FinanceiroPage() {
  const toast = useToast();
  const [faturas, setFaturas] = useState<Fatura[]>(INIT);
  const [novaOpen, setNovaOpen] = useState(false);
  const [detalhe, setDetalhe] = useState<Fatura | null>(null);

  const receitaAbr = MENSAL[MENSAL.length - 1]?.receita ?? 0;
  const fatHoje = faturas.filter((f) => f.data.startsWith("15")).reduce((a, f) => a + f.valor, 0);
  const fatPendente = faturas.filter((f) => f.status !== "paga").reduce((a, f) => a + f.valor, 0);

  function criarFatura(form: FormData) {
    const paciente = String(form.get("paciente") ?? "");
    const servico = String(form.get("servico") ?? "");
    const valor = Number(form.get("valor") ?? 0);
    if (!paciente || !servico || !valor) return;
    const nova: Fatura = {
      id: `f-${Date.now()}`,
      data: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).replace(/\./g, ""),
      paciente,
      servico,
      valor,
      status: "pendente",
      forma: "—",
    };
    setFaturas((a) => [nova, ...a]);
    setNovaOpen(false);
    toast.show(`Fatura de R$ ${valor.toLocaleString("pt-BR")} criada — PIX enviado via WhatsApp`, "success");
  }

  function marcarPaga(f: Fatura) {
    setFaturas((a) => a.map((x) => (x.id === f.id ? { ...x, status: "paga" as const, forma: "PIX" } : x)));
    setDetalhe(null);
    toast.show(`Fatura de ${f.paciente} marcada como paga`, "success");
  }

  return (
    <AppShell>
      <Topbar title="Financeiro" subtitle="Receita · faturas · MRR da clínica" />
      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 space-y-4 md:space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card><div className="text-xs text-muted uppercase tracking-wide mb-1">Receita do mês</div><div className="text-xl md:text-3xl font-semibold text-text tnum">R$ {receitaAbr.toLocaleString("pt-BR")}</div><div className="text-xs text-leaf mt-1">proj. R$ {(receitaAbr * 2).toLocaleString("pt-BR")}</div></Card>
          <Card><div className="text-xs text-muted uppercase tracking-wide mb-1">Hoje</div><div className="text-xl md:text-3xl font-semibold text-text tnum">R$ {fatHoje.toLocaleString("pt-BR")}</div><div className="text-xs text-muted mt-1">{faturas.filter((f) => f.data.startsWith("15")).length} faturas</div></Card>
          <Card><div className="text-xs text-muted uppercase tracking-wide mb-1">A receber</div><div className="text-xl md:text-3xl font-semibold text-ochre tnum">R$ {fatPendente.toLocaleString("pt-BR")}</div><div className="text-xs text-muted mt-1">{faturas.filter((f) => f.status !== "paga").length} faturas</div></Card>
          <Card><div className="text-xs text-muted uppercase tracking-wide mb-1">Ticket médio</div><div className="text-xl md:text-3xl font-semibold text-text tnum">R$ 368</div><div className="text-xs text-muted mt-1">últimos 30d</div></Card>
        </div>

        <Card>
          <CardHeader title="Receita mensal — últimos 6 meses" action={<Badge tone="success">+12% MoM</Badge>} />
          <div className="flex items-end gap-2 md:gap-4 h-40 md:h-48 mt-4 md:mt-6 px-1 md:px-2">
            {MENSAL.map((m, i) => {
              const h = Math.round((m.receita / max) * 170);
              return (
                <div key={m.mes} className="flex-1 flex flex-col items-center gap-1 md:gap-2">
                  <div className="font-mono tnum text-[10px] md:text-xs text-text whitespace-nowrap">R$ {(m.receita / 1000).toFixed(1)}k</div>
                  <div className={`w-full rounded-t ${i === MENSAL.length - 1 ? "bg-primary/50" : "bg-primary"} transition-all`} style={{ height: `${h}px` }} />
                  <div className="text-[9px] md:text-[10px] text-muted whitespace-nowrap">{m.mes}</div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader title="Plano Meridiana — Clínica" action={<Badge tone="success">ativo</Badge>} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4">
            <div><div className="text-xs text-muted uppercase">Plano</div><div className="text-text font-medium">Clínica</div><div className="text-xs text-muted mt-1">R$ 499/mês</div></div>
            <div><div className="text-xs text-muted uppercase">Próxima</div><div className="text-text font-medium tnum">05 mai 2026</div></div>
            <div><div className="text-xs text-muted uppercase">Forma</div><div className="text-text font-medium">PIX recorrente</div></div>
            <div><div className="text-xs text-muted uppercase">Uso</div><div className="text-text font-medium tnum">32/200h telemed</div></div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button variant="secondary" size="sm" onClick={() => toast.show("Redirecionando para o portal de pagamentos", "info")}>Mudar plano</Button>
            <Button variant="secondary" size="sm" onClick={() => toast.show("NFSe do plano baixada", "success")}>Baixar NF</Button>
            <Button variant="secondary" size="sm" onClick={() => toast.show("Abrindo opções de pagamento", "info")}>Alterar forma</Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Faturas recentes" action={<Button size="sm" onClick={() => setNovaOpen(true)}>+ Nova fatura</Button>} />

          <div className="hidden md:block mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted border-b border-border">
                  <th className="text-left py-2 font-medium">Data</th>
                  <th className="text-left py-2 font-medium">Paciente</th>
                  <th className="text-left py-2 font-medium">Serviço</th>
                  <th className="text-right py-2 font-medium">Valor</th>
                  <th className="text-left py-2 font-medium">Forma</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-right py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {faturas.map((f) => (
                  <tr key={f.id} className="hover:bg-surface">
                    <td className="py-3 text-muted tnum text-xs whitespace-nowrap">{f.data}</td>
                    <td className="py-3 text-text">{f.paciente}</td>
                    <td className="py-3 text-muted">{f.servico}</td>
                    <td className="py-3 text-right font-mono tnum text-text">R$ {f.valor.toLocaleString("pt-BR")}</td>
                    <td className="py-3 text-muted text-xs">{f.forma}</td>
                    <td className="py-3"><Badge tone={f.status === "paga" ? "success" : f.status === "atrasada" ? "danger" : "warm"}>{f.status}</Badge></td>
                    <td className="py-3 text-right"><Button variant="secondary" size="sm" onClick={() => setDetalhe(f)}>Abrir</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden mt-3 space-y-2">
            {faturas.map((f) => (
              <button key={f.id} onClick={() => setDetalhe(f)} className="w-full text-left border border-border rounded-lg p-3 hover:border-primary/40">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="text-sm font-medium text-text truncate">{f.paciente}</div>
                  <div className="font-mono tnum text-sm text-text whitespace-nowrap">R$ {f.valor.toLocaleString("pt-BR")}</div>
                </div>
                <div className="text-xs text-muted truncate">{f.servico}</div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-[10px] text-muted tnum">{f.data} · {f.forma}</div>
                  <Badge tone={f.status === "paga" ? "success" : f.status === "atrasada" ? "danger" : "warm"}>{f.status}</Badge>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={novaOpen} onClose={() => setNovaOpen(false)} title="Nova fatura" subtitle="Cobrança será gerada com PIX + link WhatsApp" size="lg">
        <form onSubmit={(e) => { e.preventDefault(); criarFatura(new FormData(e.currentTarget)); }} className="space-y-4">
          <ModalField label="Paciente *">
            <ModalSelect name="paciente" required defaultValue="">
              <option value="" disabled>Escolha…</option>
              <option>Maria Silva</option><option>Carlos Augusto Pereira</option><option>Lucia Fernandes</option>
              <option>Rosa Albuquerque</option><option>Pedro Martins</option><option>Gabriela Torres</option>
              <option>Henrique Dias</option><option>Sandra Lima</option>
            </ModalSelect>
          </ModalField>
          <ModalField label="Serviço *">
            <ModalSelect name="servico" required defaultValue="">
              <option value="" disabled>Escolha…</option>
              <option>Primeira consulta</option>
              <option>Consulta retorno</option>
              <option>Telemedicina</option>
              <option>Telemedicina + ajuste RDC 660</option>
              <option>Consulta titulação</option>
              <option>Consulta paliativa</option>
              <option>Relatório / laudo</option>
            </ModalSelect>
          </ModalField>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModalField label="Valor (R$) *"><ModalInput name="valor" type="number" min={0} step={0.01} required defaultValue="350" /></ModalField>
            <ModalField label="Vencimento"><ModalInput name="venc" type="date" defaultValue="2026-04-22" /></ModalField>
          </div>
          <ModalField label="Forma de pagamento">
            <ModalSelect name="forma" defaultValue="PIX">
              <option>PIX</option>
              <option>Cartão crédito</option>
              <option>Cartão débito</option>
              <option>Boleto</option>
              <option>Dinheiro</option>
            </ModalSelect>
          </ModalField>
          <label className="flex items-center gap-2 text-xs text-muted">
            <input type="checkbox" defaultChecked /> Enviar link de pagamento via WhatsApp
          </label>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setNovaOpen(false)}>Cancelar</Button>
            <Button type="submit">Criar fatura</Button>
          </div>
        </form>
      </Modal>

      <Modal open={detalhe !== null} onClose={() => setDetalhe(null)} title={`Fatura · ${detalhe?.paciente ?? ""}`} subtitle={detalhe ? `${detalhe.data} · ${detalhe.servico}` : undefined} size="md"
        footer={detalhe && <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="secondary" onClick={() => { toast.show("NFSe baixada", "success"); setDetalhe(null); }}>📥 NFSe</Button>
          <Button variant="secondary" onClick={() => { toast.show("Lembrete enviado via WhatsApp", "success"); setDetalhe(null); }}>💬 Cobrar</Button>
          {detalhe.status !== "paga" && <Button onClick={() => marcarPaga(detalhe)}>Marcar como paga</Button>}
        </div>}
      >
        {detalhe && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-xs text-muted uppercase">Valor</div><div className="text-text font-mono tnum text-lg">R$ {detalhe.valor.toLocaleString("pt-BR")}</div></div>
              <div><div className="text-xs text-muted uppercase">Status</div><div><Badge tone={detalhe.status === "paga" ? "success" : detalhe.status === "atrasada" ? "danger" : "warm"}>{detalhe.status}</Badge></div></div>
              <div><div className="text-xs text-muted uppercase">Forma</div><div className="text-text">{detalhe.forma}</div></div>
              <div><div className="text-xs text-muted uppercase">Data</div><div className="text-text tnum">{detalhe.data}</div></div>
            </div>
            <div className="text-xs text-muted border-l-2 border-primary/30 pl-2 py-1">
              Cobrança via Stripe · PIX recorrente configurável · NFSe emitida automaticamente via ContaAzul (integração).
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
