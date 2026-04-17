"use client";

import { AppShell } from "@/components/shell/AppShell";
import { Topbar } from "@/components/shell/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const AUDIT = [
  { ts: "16:42:18", seq: 1842, user: "Dra. Ana (medico)", action: "prescricao_signed", resource: "prescricao:mar-abr-024", ip: "187.54.33.12", hash: "0x7a9b...c21e" },
  { ts: "16:41:04", seq: 1841, user: "Dra. Ana (medico)", action: "paciente_read", resource: "paciente:maria-silva", ip: "187.54.33.12", hash: "0xa4f2...5bd8" },
  { ts: "16:38:55", seq: 1840, user: "Dra. Ana (medico)", action: "ai_call", resource: "feature:titulacao", ip: "187.54.33.12", hash: "0x8e12...9a47" },
  { ts: "16:35:22", seq: 1839, user: "sistema", action: "rdc660_submitted", resource: "prescricao:abr-017", ip: "gov.br-api", hash: "0x3f91...6b22" },
  { ts: "16:33:10", seq: 1838, user: "Dr. João (medico)", action: "prescricao_emitted", resource: "prescricao:abr-016", ip: "201.12.44.7", hash: "0xbd84...1e33" },
  { ts: "16:30:45", seq: 1837, user: "Dr. João (medico)", action: "telemed_finished", resource: "sessao:tel-321", ip: "201.12.44.7", hash: "0x5c76...2f14" },
  { ts: "16:28:00", seq: 1836, user: "Luiza (recepcao)", action: "paciente_created", resource: "paciente:novo-047", ip: "187.54.33.12", hash: "0xf2a1...9c55" },
  { ts: "16:20:33", seq: 1835, user: "paciente-maria", action: "consent_granted", resource: "consent:telemedicina", ip: "179.212.8.44", hash: "0x91be...7a08" },
  { ts: "16:15:12", seq: 1834, user: "Dra. Ana (medico)", action: "login", resource: "user:ana-beatriz", ip: "187.54.33.12", hash: "0x47cc...83d9" },
  { ts: "16:12:58", seq: 1833, user: "sistema", action: "anonymization_executed", resource: "cohort:fibromialgia", ip: "worker-01", hash: "0x2a57...4e61" },
];

const CONFORMIDADE = [
  { norma: "LGPD art. 11 (dados sensíveis)", status: "conforme", desc: "Consentimento granular por finalidade, criptografia at-rest, residência BR" },
  { norma: "CFM 1.821/2007 (prontuário)", status: "conforme", desc: "Soft-delete 20 anos · audit hash-chained · imutabilidade" },
  { norma: "CFM 2.324/22 (prescrição cannabis)", status: "conforme", desc: "Validação especialidade prescritor · alerta CID vs rota" },
  { norma: "ANVISA RDC 327 + 1015", status: "conforme", desc: "Receita Tipo A/B gerada conforme concentração · NR controlada" },
  { norma: "ANVISA RDC 660/2022", status: "conforme", desc: "Ofício pré-preenchido · tracking de validade 2 anos + alerta 6m antes" },
  { norma: "ICP-Brasil (MP 2.200-2)", status: "conforme", desc: "Assinatura PAdES-B-LT · validade jurídica plena" },
  { norma: "ISO 27001", status: "em_andamento", desc: "Audit inicial agendado Q3 2026" },
  { norma: "HDS (Hébergement Santé)", status: "nao_aplicavel", desc: "Padrão europeu · replicar quando expandir" },
];

export default function CompliancePage() {
  return (
    <AppShell>
      <Topbar title="Compliance · LGPD · Auditoria" subtitle="Hash-chain · 1.842 eventos · integridade OK" />
      <div className="px-6 lg:px-10 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Eventos audit</div>
            <div className="text-3xl font-semibold text-text tnum">1.842</div>
            <div className="text-xs text-muted mt-1">últimos 30d</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Hash chain</div>
            <div className="text-3xl font-semibold text-leaf tnum">OK</div>
            <div className="text-xs text-muted mt-1">tamper-evident</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Consentimentos ativos</div>
            <div className="text-3xl font-semibold text-text tnum">196</div>
            <div className="text-xs text-muted mt-1">pacientes · 3 finalidades</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">DPO</div>
            <div className="text-sm text-text font-medium mt-1">dpo@meridiana.health</div>
            <div className="text-xs text-muted mt-1">resp. em 24h</div>
          </Card>
        </div>

        <Card>
          <CardHeader
            title="Conformidade regulatória"
            action={<Button variant="secondary" size="sm">Baixar certificado</Button>}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {CONFORMIDADE.map((c, i) => (
              <div key={i} className="border border-border rounded-lg p-3 flex gap-3">
                <div className="shrink-0 mt-0.5">
                  {c.status === "conforme" ? <span className="text-leaf">✓</span>
                    : c.status === "em_andamento" ? <span className="text-ochre">○</span>
                    : <span className="text-muted">—</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text">{c.norma}</div>
                  <div className="text-xs text-muted">{c.desc}</div>
                </div>
                <Badge tone={c.status === "conforme" ? "success" : c.status === "em_andamento" ? "warm" : "neutral"}>
                  {c.status === "conforme" ? "conforme" : c.status === "em_andamento" ? "em curso" : "n/a"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Audit log — últimas 10 ações"
            action={<Button variant="secondary" size="sm">Verificar integridade chain</Button>}
          />
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="uppercase tracking-wide text-muted border-b border-border">
                  <th className="text-left py-2 font-medium">Timestamp</th>
                  <th className="text-right py-2 font-medium">Seq</th>
                  <th className="text-left py-2 font-medium">User</th>
                  <th className="text-left py-2 font-medium">Action</th>
                  <th className="text-left py-2 font-medium">Resource</th>
                  <th className="text-left py-2 font-medium">IP</th>
                  <th className="text-left py-2 font-medium">Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono tnum">
                {AUDIT.map((a, i) => (
                  <tr key={i} className="hover:bg-surface">
                    <td className="py-2 text-muted">{a.ts}</td>
                    <td className="py-2 text-right">{a.seq}</td>
                    <td className="py-2 text-text">{a.user}</td>
                    <td className="py-2 text-primary">{a.action}</td>
                    <td className="py-2 text-muted">{a.resource}</td>
                    <td className="py-2 text-muted">{a.ip}</td>
                    <td className="py-2 text-muted">{a.hash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-[10px] text-muted leading-relaxed border-l-2 border-primary/30 pl-2">
            Cada evento carrega SHA-256 do evento anterior. Alterar um campo quebra a cadeia e dispara alerta automático ao DPO.
            Em caso de invasão de DB, um admin mal-intencionado que apague uma linha é detectado — a continuidade da cadeia prova tamper-evidence.
          </div>
        </Card>

        <Card>
          <CardHeader title="Direitos do titular (LGPD arts. 17-22)" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            {[
              { label: "Confirmação", icon: "✓" },
              { label: "Acesso", icon: "👁" },
              { label: "Correção", icon: "✎" },
              { label: "Anonimização", icon: "⊗" },
              { label: "Portabilidade", icon: "→" },
              { label: "Eliminação*", icon: "🗑" },
              { label: "Informação", icon: "i" },
              { label: "Revogar consent.", icon: "✕" },
            ].map(d => (
              <button key={d.label} className="border border-border rounded-lg p-3 text-center hover:border-primary/40">
                <div className="text-2xl">{d.icon}</div>
                <div className="text-xs text-text mt-1">{d.label}</div>
              </button>
            ))}
          </div>
          <div className="text-[10px] text-muted mt-3">* Sujeito a retenção CFM 1.821 — 20 anos após última consulta, mesmo após pedido de eliminação.</div>
        </Card>
      </div>
    </AppShell>
  );
}
