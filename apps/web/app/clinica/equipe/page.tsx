"use client";

import { AppShell } from "@/components/shell/AppShell";
import { Topbar } from "@/components/shell/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { demoAction } from "@/lib/demo-actions";

const EQUIPE = [
  { iniciais: "AB", nome: "Dra. Ana Beatriz Lima", crm: "123456/SP", esp: ["Dor", "Cuidados paliativos"], role: "owner", pacientes: 47, status: "online" },
  { iniciais: "JM", nome: "Dr. João Marques", crm: "234567/SP", esp: ["Neurologia", "Psiquiatria"], role: "medico", pacientes: 32, status: "online" },
  { iniciais: "MC", nome: "Dra. Mariana Castro", crm: "345678/SP", esp: ["Pediatria"], role: "medico", pacientes: 18, status: "offline" },
  { iniciais: "RP", nome: "Dr. Rafael Prado", crm: "456789/RJ", esp: ["Oncologia"], role: "medico", pacientes: 24, status: "online" },
  { iniciais: "LS", nome: "Luiza Santos", crm: "—", esp: ["Recepção"], role: "recepcao", pacientes: 0, status: "online" },
  { iniciais: "FC", nome: "Fernanda Cavalcanti", crm: "—", esp: ["Financeiro"], role: "financeiro", pacientes: 0, status: "offline" },
];

const ROLE_LABEL: Record<string, string> = { owner: "Owner", admin: "Admin", medico: "Médico", recepcao: "Recepção", financeiro: "Financeiro" };

export default function EquipePage() {
  return (
    <AppShell>
      <Topbar title="Equipe" subtitle="Meridiana Paulista · Plano Clínica (até 5 médicos)" />
      <div className="px-6 lg:px-10 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Total</div>
            <div className="text-3xl font-semibold text-text tnum">{EQUIPE.length}</div>
            <div className="text-xs text-muted mt-1">membros ativos</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Médicos</div>
            <div className="text-3xl font-semibold text-text tnum">{EQUIPE.filter(e => e.role === "medico" || e.role === "owner").length}</div>
            <div className="text-xs text-muted mt-1">de 5 do plano</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Online agora</div>
            <div className="text-3xl font-semibold text-leaf tnum">{EQUIPE.filter(e => e.status === "online").length}</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Pacientes compart.</div>
            <div className="text-3xl font-semibold text-text tnum">{EQUIPE.reduce((a, e) => a + e.pacientes, 0)}</div>
          </Card>
        </div>

        <Card>
          <CardHeader
            title="Membros da clínica"
            action={<Button size="sm" onClick={demoAction("Email de convite enviado")}>+ Convidar membro</Button>}
          />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted border-b border-border">
                  <th className="text-left py-2 font-medium">Nome</th>
                  <th className="text-left py-2 font-medium">CRM</th>
                  <th className="text-left py-2 font-medium">Especialidades</th>
                  <th className="text-left py-2 font-medium">Papel</th>
                  <th className="text-right py-2 font-medium">Pacientes</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-right py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {EQUIPE.map((m) => (
                  <tr key={m.crm + m.nome} className="hover:bg-surface">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium">
                          {m.iniciais}
                        </div>
                        <div>
                          <div className="font-medium text-text">{m.nome}</div>
                          <div className="text-xs text-muted">ana@meridiana.health</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-muted font-mono text-xs">{m.crm}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {m.esp.map(e => (
                          <span key={e} className="text-[10px] bg-surface px-2 py-0.5 rounded border border-border">{e}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge tone={m.role === "owner" ? "success" : m.role === "medico" ? "neutral" : "warm"}>
                        {ROLE_LABEL[m.role]}
                      </Badge>
                    </td>
                    <td className="py-3 text-right font-mono tnum text-text">{m.pacientes || "—"}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${m.status === "online" ? "bg-leaf" : "bg-muted/40"}`} />
                        <span className="text-xs text-muted capitalize">{m.status}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <Button variant="secondary" size="sm" onClick={demoAction("Abrindo permissões", "info")}>Gerenciar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="Convites pendentes" />
          <div className="text-sm text-muted py-4 text-center">Nenhum convite pendente.</div>
        </Card>
      </div>
    </AppShell>
  );
}
