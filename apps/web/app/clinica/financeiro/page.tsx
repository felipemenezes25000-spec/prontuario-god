"use client";

import { AppShell } from "@/components/shell/AppShell";
import { Topbar } from "@/components/shell/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const FATURAS = [
  { data: "15 abr 2026", paciente: "Maria Silva", servico: "Consulta retorno", valor: 350, status: "paga", forma: "PIX" },
  { data: "14 abr 2026", paciente: "Lucia Fernandes", servico: "Consulta titulação (pediatria)", valor: 420, status: "paga", forma: "Cartão" },
  { data: "14 abr 2026", paciente: "Gabriela Torres", servico: "Telemedicina + ajuste RDC 660", valor: 280, status: "paga", forma: "PIX" },
  { data: "13 abr 2026", paciente: "Henrique Dias", servico: "Telemedicina retorno", valor: 280, status: "paga", forma: "Cartão" },
  { data: "12 abr 2026", paciente: "Sandra Lima", servico: "Primeira consulta", valor: 450, status: "paga", forma: "PIX" },
  { data: "12 abr 2026", paciente: "Pedro Martins", servico: "Consulta retorno", valor: 350, status: "pendente", forma: "—" },
  { data: "11 abr 2026", paciente: "Carla Mendes", servico: "Telemedicina (TEA)", valor: 300, status: "paga", forma: "PIX" },
  { data: "10 abr 2026", paciente: "Rafael Gomes", servico: "Primeira consulta", valor: 450, status: "paga", forma: "Cartão" },
  { data: "10 abr 2026", paciente: "Júlia Barbosa", servico: "Consulta retorno (pediatria)", valor: 350, status: "paga", forma: "PIX" },
  { data: "08 abr 2026", paciente: "Alberto Nunes", servico: "Consulta paliativa + RDC 660", valor: 520, status: "atrasada", forma: "—" },
];

const MENSAL = [
  { mes: "Nov 25", receita: 12400 },
  { mes: "Dez 25", receita: 13800 },
  { mes: "Jan 26", receita: 14200 },
  { mes: "Fev 26", receita: 15900 },
  { mes: "Mar 26", receita: 17300 },
  { mes: "Abr 26", receita: 9850 },
];

const max = Math.max(...MENSAL.map(m => m.receita));

export default function FinanceiroPage() {
  const receitaAbr = MENSAL[MENSAL.length - 1]?.receita ?? 0;
  const receitaMar = MENSAL[MENSAL.length - 2]?.receita ?? 0;
  const fatHoje = FATURAS.filter(f => f.data.startsWith("15")).reduce((a, f) => a + f.valor, 0);
  const fatPendente = FATURAS.filter(f => f.status !== "paga").reduce((a, f) => a + f.valor, 0);

  return (
    <AppShell>
      <Topbar title="Financeiro" subtitle="Receita · faturas · MRR da clínica" />
      <div className="px-6 lg:px-10 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Receita do mês</div>
            <div className="text-3xl font-semibold text-text tnum">R$ {receitaAbr.toLocaleString("pt-BR")}</div>
            <div className="text-xs text-leaf mt-1">projetado R$ {(receitaAbr * 2).toLocaleString("pt-BR")}</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Hoje</div>
            <div className="text-3xl font-semibold text-text tnum">R$ {fatHoje.toLocaleString("pt-BR")}</div>
            <div className="text-xs text-muted mt-1">{FATURAS.filter(f => f.data.startsWith("15")).length} faturas</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">A receber</div>
            <div className="text-3xl font-semibold text-ochre tnum">R$ {fatPendente.toLocaleString("pt-BR")}</div>
            <div className="text-xs text-muted mt-1">{FATURAS.filter(f => f.status !== "paga").length} faturas</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Ticket médio</div>
            <div className="text-3xl font-semibold text-text tnum">R$ 368</div>
            <div className="text-xs text-muted mt-1">últimos 30d</div>
          </Card>
        </div>

        <Card>
          <CardHeader title="Receita mensal — últimos 6 meses" action={<Badge tone="success">+12% MoM</Badge>} />
          <div className="flex items-end gap-4 h-48 mt-6 px-2">
            {MENSAL.map((m, i) => {
              const h = Math.round((m.receita / max) * 170);
              return (
                <div key={m.mes} className="flex-1 flex flex-col items-center gap-2">
                  <div className="font-mono tnum text-xs text-text">R$ {(m.receita / 1000).toFixed(1)}k</div>
                  <div
                    className={`w-full rounded-t ${i === MENSAL.length - 1 ? "bg-primary/50" : "bg-primary"} transition-all`}
                    style={{ height: `${h}px` }}
                  />
                  <div className="text-[10px] text-muted">{m.mes}</div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Plano Meridiana — Clínica"
            action={<Badge tone="success">ativo</Badge>}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div>
              <div className="text-xs text-muted uppercase">Plano</div>
              <div className="text-text font-medium">Clínica</div>
              <div className="text-xs text-muted mt-1">R$ 499/mês</div>
            </div>
            <div>
              <div className="text-xs text-muted uppercase">Próxima cobrança</div>
              <div className="text-text font-medium tnum">05 mai 2026</div>
            </div>
            <div>
              <div className="text-xs text-muted uppercase">Forma</div>
              <div className="text-text font-medium">PIX recorrente</div>
            </div>
            <div>
              <div className="text-xs text-muted uppercase">Uso do plano</div>
              <div className="text-text font-medium tnum">32/200h telemed</div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="secondary" size="sm">Upgrade plano</Button>
            <Button variant="secondary" size="sm">Baixar NF</Button>
            <Button variant="secondary" size="sm">Alterar forma</Button>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Faturas recentes"
            action={<Button size="sm">+ Nova fatura</Button>}
          />
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted border-b border-border">
                  <th className="text-left py-2 font-medium">Data</th>
                  <th className="text-left py-2 font-medium">Paciente</th>
                  <th className="text-left py-2 font-medium">Serviço</th>
                  <th className="text-right py-2 font-medium">Valor</th>
                  <th className="text-left py-2 font-medium">Forma</th>
                  <th className="text-left py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {FATURAS.map((f, i) => (
                  <tr key={i} className="hover:bg-surface">
                    <td className="py-3 text-muted tnum text-xs">{f.data}</td>
                    <td className="py-3 text-text">{f.paciente}</td>
                    <td className="py-3 text-muted">{f.servico}</td>
                    <td className="py-3 text-right font-mono tnum text-text">R$ {f.valor.toLocaleString("pt-BR")}</td>
                    <td className="py-3 text-muted text-xs">{f.forma}</td>
                    <td className="py-3">
                      <Badge tone={f.status === "paga" ? "success" : f.status === "atrasada" ? "danger" : "warm"}>
                        {f.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
