"use client";

import { useState } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { Topbar } from "@/components/shell/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal, ModalField, ModalInput, ModalSelect } from "@/components/ui/Modal";
import { useToast } from "@/providers/ToastProvider";

interface Membro {
  id: string;
  iniciais: string;
  nome: string;
  crm: string;
  esp: string[];
  role: string;
  pacientes: number;
  status: string;
  email: string;
}

const INIT: Membro[] = [
  { id: "1", iniciais: "AB", nome: "Dra. Ana Beatriz Lima", crm: "123456/SP", esp: ["Dor", "Cuidados paliativos"], role: "owner", pacientes: 47, status: "online", email: "ana@meridiana.health" },
  { id: "2", iniciais: "JM", nome: "Dr. João Marques", crm: "234567/SP", esp: ["Neurologia", "Psiquiatria"], role: "medico", pacientes: 32, status: "online", email: "joao@meridiana.health" },
  { id: "3", iniciais: "MC", nome: "Dra. Mariana Castro", crm: "345678/SP", esp: ["Pediatria"], role: "medico", pacientes: 18, status: "offline", email: "mariana@meridiana.health" },
  { id: "4", iniciais: "RP", nome: "Dr. Rafael Prado", crm: "456789/RJ", esp: ["Oncologia"], role: "medico", pacientes: 24, status: "online", email: "rafael@meridiana.health" },
  { id: "5", iniciais: "LS", nome: "Luiza Santos", crm: "—", esp: ["Recepção"], role: "recepcao", pacientes: 0, status: "online", email: "luiza@meridiana.health" },
  { id: "6", iniciais: "FC", nome: "Fernanda Cavalcanti", crm: "—", esp: ["Financeiro"], role: "financeiro", pacientes: 0, status: "offline", email: "fernanda@meridiana.health" },
];

const ROLE_LABEL: Record<string, string> = { owner: "Owner", admin: "Admin", medico: "Médico", recepcao: "Recepção", financeiro: "Financeiro" };

export default function EquipePage() {
  const toast = useToast();
  const [membros, setMembros] = useState<Membro[]>(INIT);
  const [convidarOpen, setConvidarOpen] = useState(false);
  const [gerenciar, setGerenciar] = useState<Membro | null>(null);

  function convidar(form: FormData) {
    const nome = String(form.get("nome") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    if (!nome || !email) return;
    const novo: Membro = {
      id: `m-${Date.now()}`,
      iniciais: nome.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase(),
      nome,
      crm: String(form.get("crm") ?? "—"),
      esp: [String(form.get("esp") ?? "Clínico")],
      role: String(form.get("role") ?? "medico"),
      pacientes: 0,
      status: "offline",
      email,
    };
    setMembros((a) => [...a, novo]);
    setConvidarOpen(false);
    toast.show(`Convite enviado para ${email}`, "success");
  }

  function removerMembro(m: Membro) {
    setMembros((a) => a.filter((x) => x.id !== m.id));
    setGerenciar(null);
    toast.show(`${m.nome} removido(a) da clínica`, "info");
  }

  return (
    <AppShell>
      <Topbar title="Equipe" subtitle="Meridiana Paulista · Plano Clínica (até 5 médicos)" />
      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 space-y-4 md:space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card><div className="text-xs text-muted uppercase tracking-wide mb-1">Total</div><div className="text-2xl md:text-3xl font-semibold text-text tnum">{membros.length}</div><div className="text-xs text-muted mt-1">membros ativos</div></Card>
          <Card><div className="text-xs text-muted uppercase tracking-wide mb-1">Médicos</div><div className="text-2xl md:text-3xl font-semibold text-text tnum">{membros.filter((e) => e.role === "medico" || e.role === "owner").length}</div><div className="text-xs text-muted mt-1">de 5 do plano</div></Card>
          <Card><div className="text-xs text-muted uppercase tracking-wide mb-1">Online agora</div><div className="text-2xl md:text-3xl font-semibold text-leaf tnum">{membros.filter((e) => e.status === "online").length}</div></Card>
          <Card><div className="text-xs text-muted uppercase tracking-wide mb-1">Pacientes</div><div className="text-2xl md:text-3xl font-semibold text-text tnum">{membros.reduce((a, e) => a + e.pacientes, 0)}</div></Card>
        </div>

        <Card>
          <CardHeader title="Membros da clínica" action={<Button size="sm" onClick={() => setConvidarOpen(true)}>+ Convidar</Button>} />

          {/* Desktop: tabela / Mobile: cards */}
          <div className="hidden md:block mt-4 overflow-x-auto">
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
                {membros.map((m) => (
                  <tr key={m.id} className="hover:bg-surface">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium shrink-0">{m.iniciais}</div>
                        <div className="min-w-0">
                          <div className="font-medium text-text truncate">{m.nome}</div>
                          <div className="text-xs text-muted truncate">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-muted font-mono text-xs">{m.crm}</td>
                    <td className="py-3"><div className="flex flex-wrap gap-1">{m.esp.map((e) => <span key={e} className="text-[10px] bg-surface px-2 py-0.5 rounded border border-border">{e}</span>)}</div></td>
                    <td className="py-3"><Badge tone={m.role === "owner" ? "success" : m.role === "medico" ? "neutral" : "warm"}>{ROLE_LABEL[m.role]}</Badge></td>
                    <td className="py-3 text-right font-mono tnum text-text">{m.pacientes || "—"}</td>
                    <td className="py-3"><div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${m.status === "online" ? "bg-leaf" : "bg-muted/40"}`} /><span className="text-xs text-muted capitalize">{m.status}</span></div></td>
                    <td className="py-3 text-right"><Button variant="secondary" size="sm" onClick={() => setGerenciar(m)}>Gerenciar</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden mt-4 space-y-3">
            {membros.map((m) => (
              <button key={m.id} onClick={() => setGerenciar(m)} className="w-full text-left border border-border rounded-lg p-3 hover:border-primary/40">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium shrink-0">{m.iniciais}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-text truncate">{m.nome}</div>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${m.status === "online" ? "bg-leaf" : "bg-muted/40"}`} />
                    </div>
                    <div className="text-xs text-muted">{m.crm === "—" ? ROLE_LABEL[m.role] : `CRM ${m.crm}`}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge tone={m.role === "owner" ? "success" : m.role === "medico" ? "neutral" : "warm"}>{ROLE_LABEL[m.role]}</Badge>
                      {m.pacientes > 0 && <span className="text-xs text-muted tnum">{m.pacientes} pacientes</span>}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Convites pendentes" />
          <div className="text-sm text-muted py-4 text-center">Nenhum convite pendente.</div>
        </Card>
      </div>

      <Modal open={convidarOpen} onClose={() => setConvidarOpen(false)} title="Convidar para a clínica" subtitle="Invite link chega por email com validade de 48h" size="lg">
        <form onSubmit={(e) => { e.preventDefault(); convidar(new FormData(e.currentTarget)); }} className="space-y-4">
          <ModalField label="Nome completo *"><ModalInput name="nome" required placeholder="Dr(a). Nome Sobrenome" /></ModalField>
          <ModalField label="Email *"><ModalInput name="email" type="email" required placeholder="medico@clinica.com" /></ModalField>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModalField label="Papel na clínica *">
              <ModalSelect name="role" defaultValue="medico" required>
                <option value="admin">Admin</option>
                <option value="medico">Médico(a)</option>
                <option value="recepcao">Recepção</option>
                <option value="financeiro">Financeiro</option>
              </ModalSelect>
            </ModalField>
            <ModalField label="Especialidade"><ModalInput name="esp" placeholder="Dor, Neurologia…" /></ModalField>
          </div>
          <ModalField label="CRM (se médico)" hint="Será validado via portal CFM automaticamente"><ModalInput name="crm" placeholder="123456/SP" /></ModalField>
          <label className="flex items-start gap-2 text-xs text-muted border border-primary/30 rounded-lg p-3 bg-primary/5">
            <input type="checkbox" required className="mt-0.5" />
            <span>Estou autorizado a convidar este profissional e declaro que ele aderirá às políticas LGPD/CFM da clínica.</span>
          </label>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setConvidarOpen(false)}>Cancelar</Button>
            <Button type="submit">Enviar convite</Button>
          </div>
        </form>
      </Modal>

      <Modal open={gerenciar !== null} onClose={() => setGerenciar(null)} title={gerenciar?.nome ?? ""} subtitle={gerenciar ? (gerenciar.crm === "—" ? ROLE_LABEL[gerenciar.role] : `CRM ${gerenciar.crm}`) : undefined} size="md"
        footer={gerenciar && gerenciar.role !== "owner" ? <>
          <Button variant="secondary" onClick={() => removerMembro(gerenciar)}>Remover da clínica</Button>
          <Button onClick={() => { toast.show("Permissões salvas", "success"); setGerenciar(null); }}>Salvar</Button>
        </> : <Button onClick={() => setGerenciar(null)}>Fechar</Button>}
      >
        {gerenciar && (
          <div className="space-y-4 text-sm">
            <div>
              <div className="text-xs text-muted uppercase mb-1">Email</div>
              <div className="text-text">{gerenciar.email}</div>
            </div>
            <div>
              <div className="text-xs text-muted uppercase mb-1">Especialidades</div>
              <div className="flex flex-wrap gap-1">{gerenciar.esp.map((e) => <span key={e} className="text-xs bg-surface px-2 py-1 rounded border border-border">{e}</span>)}</div>
            </div>
            <div>
              <div className="text-xs text-muted uppercase mb-2">Permissões</div>
              <div className="space-y-2">
                {[
                  { label: "Ver pacientes próprios", default: true },
                  { label: "Ver pacientes da clínica", default: gerenciar.role === "owner" || gerenciar.role === "admin" },
                  { label: "Emitir receita (ICP-Brasil)", default: ["owner", "medico"].includes(gerenciar.role) },
                  { label: "Solicitar exame", default: ["owner", "medico"].includes(gerenciar.role) },
                  { label: "Agendar consulta", default: true },
                  { label: "Ver financeiro", default: ["owner", "financeiro"].includes(gerenciar.role) },
                  { label: "Convidar membros", default: gerenciar.role === "owner" },
                  { label: "Exportar dados anonimizados", default: gerenciar.role === "owner" },
                ].map((p) => (
                  <label key={p.label} className="flex items-center justify-between text-sm">
                    <span className="text-text">{p.label}</span>
                    <input type="checkbox" defaultChecked={p.default} disabled={gerenciar.role === "owner"} />
                  </label>
                ))}
              </div>
            </div>
            {gerenciar.role === "owner" && (
              <div className="text-xs text-muted italic border-l-2 border-primary/30 pl-2">Owner tem todas as permissões — não é possível alterar.</div>
            )}
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
