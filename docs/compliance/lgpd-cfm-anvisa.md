# Compliance — LGPD + CFM + ANVISA

> Mapeamento legal por módulo. Toda feature deve passar por checklist deste doc antes de release.

## LGPD (Lei 13.709/2018)

Dados de saúde são **sensíveis** (art. 5, II). Tratamento exige base legal específica do art. 11.

### Base legal por finalidade

| Finalidade | Base legal | Onde aparece |
|---|---|---|
| Tratamento clínico (prontuário, prescrição) | art. 11, II, **f** (tutela da saúde, em procedimento realizado por profissionais de saúde) | M1, M2, M3, M4, M5 |
| Pesquisa anonimizada (cohort, indústria-insights) | art. 11, II, **c** (estudos por órgão de pesquisa) + anonimização efetiva (art. 12) | M8, M14 |
| Marketplace (recomendação produto) | art. 11, I (consentimento explícito separado) | M7 |
| Comunicação marketing | art. 11, I (opt-in granular) | comunicação geral |
| Compartilhamento com associação | art. 11, I (consentimento explícito) | M7 (associações) |

### Requisitos não-negociáveis

- **DPO contratado** (terceirização aceita: Opice Blum no MVP).
- **Encarregado de tratamento** com contato público (rodapé site + `/dpo`).
- **RIPD** (Relatório de Impacto à Proteção de Dados Pessoais) por módulo — template em `docs/compliance/ripd-template.md` (a criar quando módulo entrar em release).
- **Audit trail imutável** de toda leitura/escrita de PHI (entidade `audit_event` no schema).
- **Criptografia** at-rest (AES-256, chave por paciente em KMS) e in-transit (TLS 1.3).
- **Direitos do titular** implementados via `/paciente/dados`:
  - Acesso (art. 18, II)
  - Correção (art. 18, III)
  - Anonimização/bloqueio/eliminação (art. 18, IV)
  - Portabilidade (art. 18, V) — exporta JSON + PDF
  - Revogação de consentimento (art. 18, IX) — granular por finalidade
  - Eliminação após revogação (art. 18, VI) — exceto retenção legal CFM 1821/2007 (20 anos prontuário)
- **Notificação de incidente** em ≤ 48h à ANPD se risco a titulares (procedimento em `docs/compliance/incident-response.md` — a criar).
- **Pen test trimestral** (escolher empresa: Tempest, Conviso, Tenchi).

### Residência de dados

- **Default: BR.** Magalu Cloud (sa-east-1 equivalente) para PHI.
- **Provedores externos de IA** (Gemini, OpenAI) só recebem dados após PII redaction. O envio é **transferência internacional autorizada por consentimento específico** registrado em `consentimento.finalidade = 'tratamento_clinico'` com aviso prévio.

## CFM — Resolução 2.324/22

> Atualiza a CFM 2.113/2014 sobre prescrição de canabidiol.

### Restrições aplicáveis

- **CBD para epilepsia refratária** em crianças/adolescentes — autorizado.
- Veda **cannabis in natura** para uso medicinal pelo CFM (importação por RDC 660 segue regras ANVISA).
- Veda **outros derivados que não CBD** pela via CFM.
- Apenas três especialidades autorizadas pelo CFM a prescrever CBD na via CFM:
  - Neurologia
  - Neurologia pediátrica
  - Psiquiatria

### Implicações em código

- **M3 (Receituário)**: ao prescrever CBD por CFM, sistema valida `medico.especialidade ∈ {neurologia, neurologia_pediatrica, psiquiatria}`.
- Caso médico de outra especialidade tente prescrever CBD pela via CFM, sistema oferece alternativa **via ANVISA RDC 660** (que não tem essa restrição — base legal diferente) e gera o ofício automaticamente.
- Cada prescrição registra a **base regulatória escolhida** (`base_regulatoria` em `prescricao`: `cfm_2324_22`, `anvisa_rdc_327_2019`, `anvisa_rdc_660_2022`, `magistral_rdc_67_2007`, `associacao_hc`).

### CFM 1.821/2007 — prontuário

- Retenção mínima do prontuário: **20 anos** após último atendimento.
- Implicação: `paciente.deleted_at` não dispara hard delete real até 20 anos pós-último evento.

### CFM 2.314/22 — telemedicina

- Permitida com consentimento informado.
- Prontuário deve registrar o uso de telemedicina (campo `tipo_atendimento` em `prontuario_evento`).
- Prescrição em telemedicina segue regras gerais (assinatura ICP-Brasil A3 obrigatória).

## ANVISA — RDCs vigentes (2026)

### RDC 327/2019 (atualizada por RDC 1.015/2026)

- Marco regulatório de fabricação e importação de produtos à base de cannabis (não-medicamentos).
- **Atualização 2026:**
  - Inclui fibromialgia e lúpus no rol de condições autorizadas com THC > 0,2%.
  - Libera vias dermatológica, sublingual, bucal, inalatória.
  - Apenas médicos e dentistas habilitados podem prescrever industrializados.

### RDC 660/2022 — Importação por pessoa física

- Cadastro online no [gov.br/anvisa](https://www.gov.br/anvisa/pt-br/assuntos/medicamentos/controlados/cannabis).
- Autorização válida **2 anos**.
- Documentos exigidos: receita médica + relatório clínico + identificação.

**Implicação em código (M3, M6):**
- `prescricao.pdf_oficio_660_url` gerado automaticamente pelo sistema com layout aprovado.
- `prescricao.validade_660_ate` = `criado_em + 2 anos`.
- Job recorrente em `apps/api/src/jobs/660-renewal-alert.ts` alerta médico+paciente **6 meses antes do vencimento**.
- Status do pedido tracked via scraping autorizado do gov.br.

### RDC 1.012/2026 — Cultivo para pesquisa
- Não impacta MVP. Relevante para parcerias com associações futuras.

### RDC 1.013/2026 — Cultivo de cannabis ≤ 0,3% THC
- Habilita futura cadeia nacional de produtos baseados em cânhamo industrial.
- Catálogo de produto deve carregar campo `cannabis_origem` (`importado`, `nacional_baixo_thc`, `magistral`).

### RDC 1.014/2026 — Sandbox regulatório
- Para associações com até 5 anos de operação. Habilita testar formulações inovadoras (adesivos, sublinguais não-padrão, nanopartículas).

### Tipos de receita por concentração de THC

| Concentração THC do produto | Receita | Validade | Restrição |
|---|---|---|---|
| ≤ 0,2% | **Tipo B** (azul) | uso contínuo | Nenhuma específica |
| > 0,2% | **Tipo A** (amarela) com Notificação de Receita | 30 dias | Restrito a casos graves/refratários |

Implementação: lookup automático em `produto_cannabis.thc_mg_ml` → calcula `% THC` por mL → escolhe receita.

## Checklist pré-release de feature

- [ ] Feature passou por threat model (STRIDE)?
- [ ] Toda escrita em PHI passa por `audit_event`?
- [ ] Toda chamada a LLM externo passa por `pii-redactor`?
- [ ] Consentimento granular requerido foi adicionado em `consentimento.finalidade`?
- [ ] Médico vê disclaimer de IA quando aplicável?
- [ ] Logs estruturados sem PHI (ID-only)?
- [ ] RIPD atualizado se nova finalidade de tratamento?
- [ ] DPO revisou e aprovou (sign-off em `docs/compliance/sign-offs/`)?
- [ ] Pen test de regressão agendado?
