"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { Topbar } from "@/components/shell/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal, ModalField, ModalInput, ModalSelect, ModalTextarea } from "@/components/ui/Modal";
import { useToast } from "@/providers/ToastProvider";
import { PACIENTE_DEMO_ID } from "@/lib/api";

interface Paciente {
  id: string;
  nome: string;
  idade: number;
  sexo: string;
  cid: string;
  cond: string;
  rota: string;
  ultima: string;
  risco: string;
  dose: number;
  status: string;
}

const INITIAL: Paciente[] = [
  { id: PACIENTE_DEMO_ID, nome: "Maria Silva", idade: 47, sexo: "F", cid: "M79.7", cond: "Fibromialgia", rota: "Industrializado", ultima: "hoje", risco: "ok", dose: 30, status: "ativo" },
  { id: "carlos", nome: "Carlos Augusto Pereira", idade: 60, sexo: "M", cid: "G20", cond: "Parkinson + tremor", rota: "RDC 660", ultima: "2d", risco: "atenção", dose: 45, status: "ativo" },
  { id: "lucia", nome: "Lucia Fernandes", idade: 13, sexo: "F", cid: "G40.4", cond: "Dravet (pediatria)", rota: "Industrializado", ultima: "ontem", risco: "ok", dose: 140, status: "ativo" },
  { id: "rosa", nome: "Rosa Albuquerque", idade: 38, sexo: "F", cid: "F41.1", cond: "Ansiedade generalizada", rota: "Industrializado", ultima: "3d", risco: "ok", dose: 18, status: "ativo" },
  { id: "pedro", nome: "Pedro Martins", idade: 52, sexo: "M", cid: "M54.5", cond: "Lombalgia crônica", rota: "Industrializado", ultima: "5d", risco: "ok", dose: 25, status: "ativo" },
  { id: "gabriela", nome: "Gabriela Torres", idade: 45, sexo: "F", cid: "C50.9", cond: "Câncer mama (paliativo)", rota: "RDC 660", ultima: "6h", risco: "alto", dose: 75, status: "ativo" },
  { id: "henrique", nome: "Henrique Dias", idade: 41, sexo: "M", cid: "G35", cond: "Esclerose múltipla", rota: "RDC 660", ultima: "1d", risco: "ok", dose: 40, status: "ativo" },
  { id: "beatriz", nome: "Beatriz Campos", idade: 34, sexo: "F", cid: "N80.9", cond: "Endometriose", rota: "Industrializado", ultima: "4d", risco: "ok", dose: 20, status: "ativo" },
  { id: "joao", nome: "João Ribeiro", idade: 67, sexo: "M", cid: "F32.1", cond: "Depressão refratária", rota: "Industrializado", ultima: "8d", risco: "atenção", dose: 30, status: "ativo" },
  { id: "carla", nome: "Carla Mendes", idade: 29, sexo: "F", cid: "F84.0", cond: "TEA adulto", rota: "RDC 660", ultima: "2d", risco: "ok", dose: 50, status: "ativo" },
  { id: "antonio", nome: "Antônio Ferreira", idade: 71, sexo: "M", cid: "G30", cond: "Alzheimer inicial", rota: "Industrializado", ultima: "4d", risco: "atenção", dose: 35, status: "ativo" },
  { id: "fernanda", nome: "Fernanda Costa", idade: 56, sexo: "F", cid: "M06.9", cond: "Artrite reumatoide", rota: "Industrializado", ultima: "3d", risco: "ok", dose: 28, status: "ativo" },
  { id: "rafael", nome: "Rafael Gomes", idade: 33, sexo: "M", cid: "G43.9", cond: "Enxaqueca refratária", rota: "Industrializado", ultima: "1d", risco: "ok", dose: 15, status: "ativo" },
  { id: "claudia", nome: "Cláudia Souza", idade: 49, sexo: "F", cid: "M79.7", cond: "Fibromialgia + sono", rota: "Industrializado", ultima: "7d", risco: "ok", dose: 22, status: "ativo" },
  { id: "marcelo", nome: "Marcelo Oliveira", idade: 58, sexo: "M", cid: "I25.1", cond: "Dor pós-IAM", rota: "RDC 660", ultima: "10d", risco: "atenção", dose: 50, status: "pausado" },
  { id: "julia", nome: "Júlia Barbosa", idade: 9, sexo: "F", cid: "F84.0", cond: "TEA infantil", rota: "RDC 660", ultima: "hoje", risco: "ok", dose: 30, status: "ativo" },
  { id: "sandra", nome: "Sandra Lima", idade: 44, sexo: "F", cid: "F33.2", cond: "Depressão grave recorrente", rota: "Industrializado", ultima: "2d", risco: "alto", dose: 40, status: "ativo" },
  { id: "alberto", nome: "Alberto Nunes", idade: 62, sexo: "M", cid: "R52.1", cond: "Dor crônica oncológica", rota: "RDC 660", ultima: "5h", risco: "alto", dose: 80, status: "ativo" },
];

export default function PacientesPage() {
  const toast = useToast();
  const [pacientes, setPacientes] = useState<Paciente[]>(INITIAL);
  const [busca, setBusca] = useState("");
  const [filtroRota, setFiltroRota] = useState<string>("todos");
  const [novoOpen, setNovoOpen] = useState(false);
  const [abrirPaciente, setAbrirPaciente] = useState<Paciente | null>(null);

  const filtrados = pacientes.filter((p) => {
    const matchBusca = busca === "" ||
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.cid.toLowerCase().includes(busca.toLowerCase()) ||
      p.cond.toLowerCase().includes(busca.toLowerCase());
    const matchRota = filtroRota === "todos" ||
      (filtroRota === "industrial" && p.rota === "Industrializado") ||
      (filtroRota === "660" && p.rota === "RDC 660");
    return matchBusca && matchRota;
  });

  function criarPaciente(form: FormData) {
    const nome = String(form.get("nome") ?? "").trim();
    if (!nome) return;
    const novo: Paciente = {
      id: `p-${Date.now()}`,
      nome,
      idade: Number(form.get("idade") ?? 30),
      sexo: String(form.get("sexo") ?? "F"),
      cid: String(form.get("cid") ?? "—"),
      cond: String(form.get("cond") ?? ""),
      rota: String(form.get("rota") ?? "Industrializado"),
      ultima: "—",
      risco: "ok",
      dose: 0,
      status: "ativo",
    };
    setPacientes((arr) => [novo, ...arr]);
    setNovoOpen(false);
    toast.show(`✓ ${nome} cadastrado(a). Consentimento LGPD registrado.`, "success");
  }

  return (
    <AppShell>
      <Topbar
        title="Pacientes"
        subtitle={`${pacientes.length} pacientes ativos · ${pacientes.filter((p) => p.risco === "alto").length} em risco`}
      />

      <div className="px-6 lg:px-10 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><div className="text-xs text-muted uppercase tracking-wide mb-1">Total ativo</div><div className="text-3xl font-semibold text-text tnum">{pacientes.filter((p) => p.status === "ativo").length}</div></Card>
          <Card><div className="text-xs text-muted uppercase tracking-wide mb-1">Em titulação</div><div className="text-3xl font-semibold text-primary tnum">7</div><div className="text-xs text-muted mt-1">semana atual</div></Card>
          <Card><div className="text-xs text-muted uppercase tracking-wide mb-1">RDC 660 ativo</div><div className="text-3xl font-semibold text-ochre tnum">{pacientes.filter((p) => p.rota === "RDC 660").length}</div><div className="text-xs text-muted mt-1">3 vencendo &lt;30d</div></Card>
          <Card><div className="text-xs text-muted uppercase tracking-wide mb-1">Em risco</div><div className="text-3xl font-semibold text-ember tnum">{pacientes.filter((p) => p.risco === "alto").length}</div><div className="text-xs text-muted mt-1">prioridade</div></Card>
        </div>

        <Card>
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center mb-4">
            <input
              type="text"
              placeholder="Buscar por nome, CID, condição…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="flex-1 bg-surface border border-border focus:border-primary outline-none px-3 py-2 rounded-lg text-sm text-text"
            />
            <div className="flex gap-2">
              {[{ id: "todos", label: "Todos" }, { id: "industrial", label: "Industrializado" }, { id: "660", label: "RDC 660" }].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFiltroRota(f.id)}
                  className={`text-xs px-3 py-2 rounded-lg border ${filtroRota === f.id ? "border-primary text-primary bg-primary/10" : "border-border text-muted hover:text-text"}`}
                >{f.label}</button>
              ))}
              <Button size="sm" onClick={() => setNovoOpen(true)}>+ Novo paciente</Button>
            </div>
          </div>

          <div className="overflow-x-auto -mx-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted border-b border-border">
                  <th className="text-left py-2 px-4 font-medium">Paciente</th>
                  <th className="text-left py-2 font-medium">Condição · CID</th>
                  <th className="text-left py-2 font-medium">Rota</th>
                  <th className="text-right py-2 font-medium">Dose (mg/d)</th>
                  <th className="text-left py-2 font-medium">Último log</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-right py-2 px-4 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtrados.map((p) => (
                  <tr key={p.id} className="hover:bg-surface">
                    <td className="py-3 px-4">
                      <div className="font-medium text-text">{p.nome}</div>
                      <div className="text-xs text-muted">{p.idade}a · {p.sexo}</div>
                    </td>
                    <td className="py-3"><div className="text-text">{p.cond}</div><div className="text-xs text-muted font-mono">{p.cid}</div></td>
                    <td className="py-3"><Badge tone={p.rota === "RDC 660" ? "warm" : "neutral"}>{p.rota}</Badge></td>
                    <td className="py-3 text-right font-mono tnum text-text">{p.dose || "—"}</td>
                    <td className="py-3 text-muted">{p.ultima}</td>
                    <td className="py-3">
                      {p.risco === "alto" ? <Badge tone="danger">alto risco</Badge>
                        : p.risco === "atenção" ? <Badge tone="warm">atenção</Badge>
                        : p.status === "pausado" ? <Badge tone="neutral">pausado</Badge>
                        : <Badge tone="success">ok</Badge>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="secondary" size="sm" onClick={() => setAbrirPaciente(p)}>Abrir</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtrados.length === 0 && (
            <div className="text-center py-12 text-muted text-sm">Nenhum paciente encontrado com os filtros atuais.</div>
          )}
        </Card>
      </div>

      {/* Modal: Novo paciente */}
      <Modal
        open={novoOpen}
        onClose={() => setNovoOpen(false)}
        title="Novo paciente"
        subtitle="Cadastro inicial — consentimento LGPD art.11 obrigatório"
        size="lg"
      >
        <form
          onSubmit={(e) => { e.preventDefault(); criarPaciente(new FormData(e.currentTarget)); }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <ModalField label="Nome completo *"><ModalInput name="nome" required placeholder="Ex: Ana Beatriz Costa" /></ModalField>
            <ModalField label="CPF"><ModalInput name="cpf" placeholder="000.000.000-00" /></ModalField>
            <ModalField label="Data de nascimento"><ModalInput name="nasc" type="date" /></ModalField>
            <ModalField label="Idade"><ModalInput name="idade" type="number" min={0} max={120} defaultValue={40} /></ModalField>
            <ModalField label="Sexo biológico">
              <ModalSelect name="sexo" defaultValue="F">
                <option value="F">Feminino</option>
                <option value="M">Masculino</option>
                <option value="I">Intersexo</option>
              </ModalSelect>
            </ModalField>
            <ModalField label="Peso (kg)"><ModalInput name="peso" type="number" min={0} placeholder="68" /></ModalField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ModalField label="Condição principal"><ModalInput name="cond" placeholder="Fibromialgia, Parkinson…" /></ModalField>
            <ModalField label="CID-10"><ModalInput name="cid" placeholder="M79.7" /></ModalField>
          </div>

          <ModalField label="Rota regulatória preferida">
            <ModalSelect name="rota" defaultValue="Industrializado">
              <option>Industrializado</option>
              <option>RDC 660</option>
              <option>Magistral</option>
              <option>Associação HC</option>
            </ModalSelect>
          </ModalField>

          <ModalField label="Observações clínicas iniciais">
            <ModalTextarea name="obs" rows={3} placeholder="Medicamentos em uso, alergias, tentativas anteriores…" />
          </ModalField>

          <label className="flex items-start gap-2 text-xs text-muted p-3 border border-primary/30 rounded-lg bg-primary/5">
            <input type="checkbox" required className="mt-0.5" />
            <span>
              O paciente ou responsável legal <strong className="text-text">consentiu</strong> com o tratamento de dados sensíveis de saúde conforme LGPD art.11. Cópia digital assinada em arquivo.
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setNovoOpen(false)}>Cancelar</Button>
            <Button type="submit">Cadastrar paciente</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Detalhe do paciente (quando não é Maria) */}
      <Modal
        open={abrirPaciente !== null}
        onClose={() => setAbrirPaciente(null)}
        title={abrirPaciente?.nome ?? ""}
        subtitle={abrirPaciente ? `${abrirPaciente.idade}a · ${abrirPaciente.sexo} · CID ${abrirPaciente.cid}` : undefined}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => { toast.show("WhatsApp aberto com paciente", "info"); setAbrirPaciente(null); }}>Mensagem</Button>
            {abrirPaciente?.id === PACIENTE_DEMO_ID ? (
              <Link href={`/medico/prontuario/${abrirPaciente.id}`}>
                <Button>Ver prontuário completo</Button>
              </Link>
            ) : (
              <Button onClick={() => { toast.show(`Prontuário de ${abrirPaciente?.nome} em carregamento…`, "info"); setAbrirPaciente(null); }}>
                Ver prontuário completo
              </Button>
            )}
          </>
        }
      >
        {abrirPaciente && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><div className="text-xs text-muted uppercase">Condição</div><div className="text-text font-medium">{abrirPaciente.cond}</div></div>
              <div><div className="text-xs text-muted uppercase">Rota regulatória</div><div className="text-text"><Badge tone={abrirPaciente.rota === "RDC 660" ? "warm" : "neutral"}>{abrirPaciente.rota}</Badge></div></div>
              <div><div className="text-xs text-muted uppercase">Dose atual (mg/d)</div><div className="text-text font-mono tnum">{abrirPaciente.dose || "—"}</div></div>
              <div><div className="text-xs text-muted uppercase">Último tracker log</div><div className="text-text">{abrirPaciente.ultima}</div></div>
              <div><div className="text-xs text-muted uppercase">Status</div>
                <div>{abrirPaciente.risco === "alto" ? <Badge tone="danger">alto risco</Badge>
                  : abrirPaciente.risco === "atenção" ? <Badge tone="warm">atenção</Badge>
                  : <Badge tone="success">ok</Badge>}</div>
              </div>
              <div><div className="text-xs text-muted uppercase">Consentimento LGPD</div><Badge tone="success">ativo</Badge></div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="text-xs text-muted uppercase mb-2">Ações rápidas</div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => { toast.show("Abrindo Co-Pilot Titulação para este paciente…", "info"); setAbrirPaciente(null); }}>✨ Co-Pilot</Button>
                <Button variant="secondary" size="sm" onClick={() => { toast.show("Telemed agendada", "success"); setAbrirPaciente(null); }}>🎥 Agendar telemed</Button>
                <Button variant="secondary" size="sm" onClick={() => { toast.show("Receita enviada para assinatura ICP-Brasil", "success"); setAbrirPaciente(null); }}>📄 Emitir receita</Button>
                <Button variant="secondary" size="sm" onClick={() => { toast.show("Exame solicitado — paciente notificado via WhatsApp", "success"); setAbrirPaciente(null); }}>🧪 Solicitar exame</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
