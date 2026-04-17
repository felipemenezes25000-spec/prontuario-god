"use client";

import { AppShell } from "@/components/shell/AppShell";
import { Topbar } from "@/components/shell/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ReceiptPreview } from "@/components/medical/ReceiptPreview";
import { useToast } from "@/providers/ToastProvider";

export default function ReceitaPreviewPage() {
  const toast = useToast();

  return (
    <AppShell>
      <Topbar
        subtitle="Documento pronto para imprimir, enviar por WhatsApp ou anexar ao prontuário"
      />

      <div className="px-8 py-8 grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Side */}
        <aside className="xl:col-span-3 space-y-4">
          <Card>
            <h2 className="text-base font-semibold text-text mb-1">Ações</h2>
            <p className="text-xs text-muted mb-4">Esta receita já está válida — assinada digitalmente ICP-Brasil A3.</p>
            <div className="space-y-2">
              <Button
                onClick={() => {
                  toast.show("Preparando para impressão…", "info");
                  setTimeout(() => window.print(), 200);
                }}
                className="w-full"
              >
                Imprimir / PDF
              </Button>
              <Button
                onClick={() => toast.show("Receita enviada via WhatsApp", "success")}
                variant="secondary"
                className="w-full"
              >
                Enviar via WhatsApp
              </Button>
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-text mb-3">Validação</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <Badge tone="success">✓</Badge>
                <span className="text-text">Assinatura ICP-Brasil A3</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="success">✓</Badge>
                <span className="text-text">ANVISA RDC 327/2019</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="success">✓</Badge>
                <span className="text-text">Sem interações críticas</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-[11px] text-muted mb-1">Verificação pública</div>
              <div className="text-[11px] font-mono text-primary break-all">
                verifica.meridiana.health/NR-SP-2026-138761
              </div>
            </div>
          </Card>
        </aside>

        {/* Document */}
        <div className="xl:col-span-9">
          <ReceiptPreview
            data={{
              tipo_receita: "B",
              notificacao_numero: "NR-SP-2026-138761",
              medico: {
                nome: "Dra. Ana Beatriz Lima",
                crm: "123456",
                uf: "SP",
                especialidade: "Médica da Dor",
              },
              paciente: { nome: "Maria Silva", cpf: "123.456.789-09" },
              produto: "CBD 200 (Verdemed) — Óleo sublingual 50mg/ml",
              posologia:
                "5mg sublingual a cada 12 horas por 3 dias. Após, escalonar para 10mg a cada 12 horas conforme tolerância. Dose máxima 40mg/dia. Aguardar 60 segundos antes de engolir para absorção sublingual ideal.",
              dose_alvo: "40 mg/dia",
              duracao: "30 dias",
              data: new Date().toLocaleString("pt-BR"),
            }}
          />
        </div>
      </div>
    </AppShell>
  );
}
