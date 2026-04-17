"use client";

interface ReceiptData {
  tipo_receita: "A" | "B";
  notificacao_numero: string;
  medico: { nome: string; crm: string; uf: string; especialidade: string };
  paciente: { nome: string; cpf: string };
  produto: string;
  posologia: string;
  dose_alvo: string;
  duracao: string;
  data: string;
}

export function ReceiptPreview({ data }: { data: ReceiptData }) {
  const isTipoA = data.tipo_receita === "A";

  return (
    <div className="receipt-page relative w-full max-w-[760px] mx-auto bg-white text-slate-900 p-12 rounded-xl shadow-floating border border-slate-200 overflow-hidden">
      {/* Top stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ background: isTipoA ? "#f59e0b" : "#14b8a6" }}
      />

      {/* Header */}
      <header className="relative mb-8 pb-6 border-b border-slate-200 flex justify-between items-start">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500 mb-1">
            Farmacopeia digital
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Receita Especial</h1>
          <div className="text-sm text-slate-600 mt-1.5 flex items-center gap-2">
            <span>Tipo {data.tipo_receita}</span>
            <span className="text-slate-300">·</span>
            <span style={{ color: isTipoA ? "#b45309" : "#0d9488" }}>
              Notificação {isTipoA ? "Amarela" : "Azul"}
            </span>
            <span className="text-slate-300">·</span>
            <span>ANVISA RDC 327/2019</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[11px] tnum text-slate-500 mt-1">{data.notificacao_numero}</div>
        </div>
      </header>

      {/* Médico + Paciente */}
      <section className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-1.5">Médico prescritor</div>
          <div className="text-base font-semibold text-slate-900">{data.medico.nome}</div>
          <div className="text-sm text-slate-600 mt-0.5">
            CRM <span className="font-mono tnum">{data.medico.crm}/{data.medico.uf}</span>{" "}
            · <span className="capitalize">{data.medico.especialidade}</span>
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-1.5">Paciente</div>
          <div className="text-base font-semibold text-slate-900">{data.paciente.nome}</div>
          <div className="text-sm text-slate-600 mt-0.5">
            CPF <span className="font-mono tnum">{data.paciente.cpf}</span>
          </div>
        </div>
      </section>

      {/* Prescrição */}
      <section className="mb-8">
        <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">Prescrição</div>
        <div
          className="border-l-4 pl-4 py-3 rounded-r-lg"
          style={{ borderColor: isTipoA ? "#f59e0b" : "#14b8a6", background: isTipoA ? "#fffbeb" : "#f0fdfa" }}
        >
          <div className="text-lg font-semibold text-slate-900 mb-2">{data.produto}</div>
          <div className="text-slate-700 leading-relaxed text-sm">{data.posologia}</div>
        </div>

        <div className="grid grid-cols-2 gap-8 mt-5 text-sm">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-slate-500">Dose alvo</div>
            <div className="font-mono tnum text-base text-slate-900 mt-0.5">{data.dose_alvo}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-slate-500">Duração</div>
            <div className="font-mono tnum text-base text-slate-900 mt-0.5">{data.duracao}</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-6 border-t border-slate-200 flex items-end justify-between">
        <div className="text-[11px] text-slate-500 leading-tight max-w-xs">
          Assinatura digital ICP-Brasil A3 — gerada eletronicamente pela plataforma Meridiana.
          <br />
          Validade jurídica nos termos da MP 2.200-2/2001.
        </div>
        <div className="text-right">
          <div
            className="text-lg italic select-none font-semibold"
            style={{ color: isTipoA ? "#b45309" : "#0d9488" }}
          >
            ✓ {data.medico.nome.split(" ").slice(-1)[0]}
          </div>
          <div className="text-[11px] font-mono tnum text-slate-500 mt-1">{data.data}</div>
        </div>
      </footer>

      {/* Print styles */}
      <style jsx>{`
        @media print {
          .receipt-page {
            box-shadow: none !important;
            border: none !important;
            max-width: 100% !important;
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
}
