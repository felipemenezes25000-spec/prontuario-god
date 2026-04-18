"use client";

import { useState } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { Topbar } from "@/components/shell/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const PRODUTOS = [
  { nome: "Canabidiol Prati 200mg/mL", fab: "Prati-Donaduzzi", rota: "Industrializado", cbd: 200, thc: 0, preco: 599, classe: "Isolado" },
  { nome: "Canabidiol Prati 50mg/mL", fab: "Prati-Donaduzzi", rota: "Industrializado", cbd: 50, thc: 0, preco: 299, classe: "Isolado" },
  { nome: "Cannab Prati Full 20mg/mL", fab: "Prati-Donaduzzi", rota: "Industrializado", cbd: 20, thc: 0.7, preco: 229, classe: "Full spectrum" },
  { nome: "Greencare CBD 50 mg/mL", fab: "Greencare", rota: "Autorizada", cbd: 50, thc: 1.5, preco: 459, classe: "Full spectrum" },
  { nome: "Greencare 1:1 THC/CBD", fab: "Greencare", rota: "Autorizada", cbd: 25, thc: 25, preco: 689, classe: "Rich THC" },
  { nome: "Greencare Pediátrico 100mg/mL", fab: "Greencare", rota: "Autorizada", cbd: 100, thc: 0, preco: 539, classe: "Isolado" },
  { nome: "Little Green Pharma Classic 10 (100:1)", fab: "Little Green Pharma", rota: "RDC 660", cbd: 100, thc: 1, preco: 579, classe: "Full spectrum" },
  { nome: "Little Green Pharma Balance (1:1)", fab: "Little Green Pharma", rota: "RDC 660", cbd: 25, thc: 25, preco: 799, classe: "Rich THC" },
  { nome: "Amplified Full Spectrum 20mg/mL", fab: "Amplified", rota: "RDC 660", cbd: 20, thc: 0.8, preco: 249, classe: "Full spectrum" },
  { nome: "Amplified CBD 50mg/mL", fab: "Amplified", rota: "RDC 660", cbd: 50, thc: 2, preco: 419, classe: "Full spectrum" },
  { nome: "Entourage 200mg/mL CBD", fab: "Entourage", rota: "RDC 660", cbd: 200, thc: 0, preco: 799, classe: "Isolado" },
  { nome: "Aurora Night 3:1 THC", fab: "Aurora Cannabis", rota: "RDC 660", cbd: 9, thc: 27, preco: 949, classe: "Rich THC" },
  { nome: "Aurora Sunset 1:1", fab: "Aurora Cannabis", rota: "RDC 660", cbd: 20, thc: 20, preco: 879, classe: "Rich THC" },
  { nome: "Aurora Morning 20:1 CBD", fab: "Aurora Cannabis", rota: "RDC 660", cbd: 40, thc: 2, preco: 639, classe: "Full spectrum" },
  { nome: "RSHO-X Label Alcohol-Free", fab: "HempMeds", rota: "RDC 660", cbd: 16.67, thc: 0, preco: 489, classe: "Isolado" },
  { nome: "RSHO Green Label 3oz", fab: "HempMeds", rota: "RDC 660", cbd: 17, thc: 0.5, preco: 1799, classe: "Full spectrum" },
  { nome: "Abrace Óleo Bella 20mg/mL", fab: "Abrace Esperança", rota: "Associação HC", cbd: 20, thc: 0.8, preco: 280, classe: "Full spectrum" },
  { nome: "Abrace Óleo Anita 100mg/mL", fab: "Abrace Esperança", rota: "Associação HC", cbd: 100, thc: 0, preco: 420, classe: "Isolado" },
  { nome: "Ease CBD 50 Full", fab: "Ease Labs", rota: "Autorizada", cbd: 50, thc: 1.8, preco: 389, classe: "Full spectrum" },
  { nome: "Ease 1:1 Balance", fab: "Ease Labs", rota: "Autorizada", cbd: 30, thc: 30, preco: 559, classe: "Rich THC" },
  { nome: "Althaea CBD 100 Isolado", fab: "Althaea", rota: "Autorizada", cbd: 100, thc: 0, preco: 449, classe: "Isolado" },
  { nome: "Althaea Full 30:1", fab: "Althaea", rota: "Autorizada", cbd: 30, thc: 1, preco: 289, classe: "Full spectrum" },
  { nome: "Bedrocan 22/1 (Flos)", fab: "Bedrocan", rota: "RDC 660", cbd: 10, thc: 220, preco: 849, classe: "Flor" },
  { nome: "Bedica 14/1 (Indica)", fab: "Bedrocan", rota: "RDC 660", cbd: 10, thc: 140, preco: 799, classe: "Flor" },
  { nome: "Sativex (Nabiximols)", fab: "GW Pharmaceuticals", rota: "RDC 660", cbd: 2.5, thc: 2.7, preco: 1899, classe: "Rich THC" },
  { nome: "Epidiolex 100mg/mL", fab: "Jazz Pharmaceuticals", rota: "RDC 660", cbd: 100, thc: 0, preco: 6999, classe: "Isolado" },
];

export default function CatalogoPage() {
  const [busca, setBusca] = useState("");
  const [classe, setClasse] = useState("todos");

  const filtrados = PRODUTOS.filter(p => {
    const mBusca = busca === "" || p.nome.toLowerCase().includes(busca.toLowerCase()) || p.fab.toLowerCase().includes(busca.toLowerCase());
    const mClasse = classe === "todos" || p.classe === classe;
    return mBusca && mClasse;
  });

  const totalValor = filtrados.reduce((a, p) => a + p.preco, 0);

  return (
    <AppShell>
      <Topbar title="Catálogo de produtos" subtitle={`${PRODUTOS.length} SKUs · Verdemed, Prati, Aurora, Bedrocan…`} />
      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 space-y-4 md:space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Produtos ativos</div>
            <div className="text-2xl md:text-3xl font-semibold text-text tnum">{PRODUTOS.length}</div>
            <div className="text-xs text-muted mt-1">26 fabricantes BR+global</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Industrializados BR</div>
            <div className="text-2xl md:text-3xl font-semibold text-leaf tnum">{PRODUTOS.filter(p => p.rota === "Industrializado" || p.rota === "Autorizada").length}</div>
            <div className="text-xs text-muted mt-1">não requer RDC 660</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Importação RDC 660</div>
            <div className="text-2xl md:text-3xl font-semibold text-ochre tnum">{PRODUTOS.filter(p => p.rota === "RDC 660").length}</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Preço médio</div>
            <div className="text-2xl md:text-3xl font-semibold text-text tnum">R$ {Math.round(totalValor / filtrados.length || 0)}</div>
            <div className="text-xs text-muted mt-1">30mL ou unidade</div>
          </Card>
        </div>

        <Card>
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center mb-4">
            <input
              type="text"
              placeholder="Buscar produto ou fabricante…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="flex-1 bg-surface border border-border focus:border-primary outline-none px-3 py-2 rounded-lg text-sm text-text"
            />
            <div className="flex gap-2 flex-wrap">
              {["todos", "Isolado", "Full spectrum", "Rich THC", "Flor"].map(c => (
                <button key={c} onClick={() => setClasse(c)} className={`text-xs px-3 py-2 rounded-lg border ${classe === c ? "border-primary text-primary bg-primary/10" : "border-border text-muted"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto -mx-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted border-b border-border">
                  <th className="text-left py-2 px-4 font-medium">Produto</th>
                  <th className="text-left py-2 font-medium">Fabricante</th>
                  <th className="text-right py-2 font-medium">CBD (mg/mL)</th>
                  <th className="text-right py-2 font-medium">THC (mg/mL)</th>
                  <th className="text-left py-2 font-medium">Classe</th>
                  <th className="text-left py-2 font-medium">Rota</th>
                  <th className="text-right py-2 px-4 font-medium">Preço</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtrados.map((p, i) => (
                  <tr key={i} className="hover:bg-surface">
                    <td className="py-3 px-4 text-text font-medium">{p.nome}</td>
                    <td className="py-3 text-muted">{p.fab}</td>
                    <td className="py-3 text-right font-mono tnum text-leaf">{p.cbd}</td>
                    <td className="py-3 text-right font-mono tnum text-ember">{p.thc}</td>
                    <td className="py-3">
                      <Badge tone="neutral">{p.classe}</Badge>
                    </td>
                    <td className="py-3">
                      <Badge tone={p.rota === "RDC 660" ? "warm" : p.rota === "Associação HC" ? "neutral" : "success"}>
                        {p.rota}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tnum text-text">R$ {p.preco.toLocaleString("pt-BR")}</td>
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
