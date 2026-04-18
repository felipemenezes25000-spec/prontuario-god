"use client";

import { AppShell } from "@/components/shell/AppShell";
import { Topbar } from "@/components/shell/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { demoAction } from "@/lib/demo-actions";

const INTEGRACOES = [
  { nome: "ICP-Brasil (Valid VIDaaS)", status: "conectado", desc: "Assinatura digital A3 cloud", cor: "leaf" },
  { nome: "WhatsApp Business API (Meta)", status: "conectado", desc: "Templates aprovados: 4 / 6", cor: "leaf" },
  { nome: "LiveKit (telemedicina)", status: "conectado", desc: "Self-host · DigitalOcean BR", cor: "leaf" },
  { nome: "Gov.br / SEI (RDC 660)", status: "pendente", desc: "Assinar contrato API dados públicos", cor: "ochre" },
  { nome: "CFM — validação CRM", status: "conectado", desc: "Re-verificação mensal · 6 médicos ativos", cor: "leaf" },
  { nome: "Gemini API (Google)", status: "conectado", desc: "gemini-2.5-flash-lite · budget R$ 312 / R$ 1.000", cor: "leaf" },
  { nome: "Stripe (billing)", status: "conectado", desc: "Plano Clínica · PIX recorrente", cor: "leaf" },
  { nome: "Ollama (PII local)", status: "conectado", desc: "llama3.1:8b · redação fallback", cor: "leaf" },
  { nome: "Fleury / DASA / Pardini (exames)", status: "stub", desc: "Integração automática via PDF-OCR", cor: "sky" },
];

export default function ConfiguracoesPage() {
  return (
    <AppShell>
      <Topbar title="Configurações" subtitle="Perfil, clínica, integrações, preferências" />
      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <Card>
            <CardHeader title="Perfil médico" />
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <div className="text-xs text-muted uppercase">Nome</div>
                <div className="text-text font-medium">Dra. Ana Beatriz Lima</div>
              </div>
              <div>
                <div className="text-xs text-muted uppercase">CRM</div>
                <div className="text-text font-mono">CRM 123456/SP <Badge tone="success">ativo</Badge></div>
                <div className="text-[10px] text-muted mt-1">Validado via portal CFM em 15/abr/2026</div>
              </div>
              <div>
                <div className="text-xs text-muted uppercase">RQE / Especialidade</div>
                <div className="text-text">Medicina da Dor · Cuidados paliativos</div>
              </div>
              <div>
                <div className="text-xs text-muted uppercase">Certificado ICP-Brasil</div>
                <div className="text-text text-xs font-mono">VIDaaS A3 · válido até 31/12/2028</div>
              </div>
            </div>
            <Button variant="secondary" size="sm" className="mt-4" onClick={demoAction("Abrindo edição de perfil", "info")}>Editar perfil</Button>
          </Card>

          <Card>
            <CardHeader title="Clínica" />
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <div className="text-xs text-muted uppercase">Razão social</div>
                <div className="text-text">Meridiana Cannabis Medicinal LTDA</div>
              </div>
              <div>
                <div className="text-xs text-muted uppercase">CNPJ</div>
                <div className="text-text font-mono">12.345.678/0001-90</div>
              </div>
              <div>
                <div className="text-xs text-muted uppercase">CNES</div>
                <div className="text-text font-mono">1234567</div>
              </div>
              <div>
                <div className="text-xs text-muted uppercase">Endereço</div>
                <div className="text-text text-xs">Av. Paulista 1000 · São Paulo/SP</div>
              </div>
            </div>
            <Button variant="secondary" size="sm" className="mt-4" onClick={demoAction("Abrindo dados da clínica", "info")}>Dados da clínica</Button>
          </Card>

          <Card>
            <CardHeader title="Segurança" />
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-text font-medium">MFA (TOTP)</div>
                  <div className="text-xs text-muted">Autenticador ativo</div>
                </div>
                <Badge tone="success">ativo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-text font-medium">Sessões ativas</div>
                  <div className="text-xs text-muted">2 dispositivos</div>
                </div>
                <Button variant="secondary" size="sm" onClick={demoAction("Listando sessões ativas", "info")}>Gerenciar</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-text font-medium">Senha</div>
                  <div className="text-xs text-muted">alterada em 2/abr</div>
                </div>
                <Button variant="secondary" size="sm" onClick={demoAction("Abrindo troca de senha", "info")}>Alterar</Button>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader title="Integrações" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {INTEGRACOES.map(i => (
              <div key={i.nome} className="border border-border rounded-lg p-4 flex items-center gap-4">
                <div className={`w-2 h-10 rounded-full bg-${i.cor}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text">{i.nome}</div>
                  <div className="text-xs text-muted">{i.desc}</div>
                </div>
                <Badge tone={i.status === "conectado" ? "success" : i.status === "pendente" ? "warm" : "neutral"}>
                  {i.status}
                </Badge>
                <Button variant="secondary" size="sm" onClick={demoAction("Abrindo configuração da integração", "info")}>Config</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Preferências de notificação" />
          <div className="mt-3 divide-y divide-border">
            {[
              { label: "Alertas clínicos (transaminases, efeitos adversos)", push: true, email: true, wa: true },
              { label: "Mensagens de pacientes", push: true, email: false, wa: true },
              { label: "RDC 660 vencendo", push: true, email: true, wa: false },
              { label: "Faturas e billing", push: false, email: true, wa: false },
              { label: "Compliance / auditoria", push: false, email: true, wa: false },
              { label: "Atualizações do sistema", push: true, email: false, wa: false },
            ].map((p, i) => (
              <div key={i} className="py-3 flex items-center justify-between text-sm">
                <div className="text-text">{p.label}</div>
                <div className="flex gap-4 text-xs">
                  <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked={p.push} /> Push</label>
                  <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked={p.email} /> Email</label>
                  <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked={p.wa} /> WhatsApp</label>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
