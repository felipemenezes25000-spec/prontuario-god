# 00 — Blueprint Estratégico

> Formalização do blueprint aprovado. Para evolução, abrir PR sobre este documento.

## Posicionamento

**"O único prontuário que transforma cada prescrição de cannabis em um experimento clínico mensurável — para o médico decidir com dados, não com fé."**

## Pilares

1. **Ciclo 14 dias** — comprimir prescrição→efeito de 60d (mercado) para 14d.
2. **Evidência na ponta** — médico vê eficácia de seus protocolos vs. cohort BR anonimizado.
3. **Economia unitária ruthless** — custo IA/paciente/mês ≤ R$ 2,50.

## ICPs

| ICP | Perfil | Por que paga |
|---|---|---|
| **A — Médico-âncora** | Neuro / psiq / dor com 5–40 pacientes cannabis ativos/mês, eixo SP/RJ/MG/RS/DF | Reduz tempo/paciente para 12min + relatórios de eficácia anti-CFM |
| **B — Paciente-pesquisador** | 35–65a, dor crônica/ansiedade/insônia/epilepsia, classe B/C+ | Tracking que prova eficácia + logística 14d + canal médico |
| **C — Associação (B2B v2)** | ABRACE, FACT (90k pacientes), APEPI | White-label de prontuário + tracking |

## Wedge

**Co-Pilot de Titulação Cannabis (M1)**, gratuito 12 meses para 1.000 médicos hand-picked.

Único gap GLOBAL não resolvido (nem Strainprint, Releaf, Arfinn, Cannect têm titulação guiada). Resolve as 3 maiores dores do médico de uma vez.

## 14 Módulos

| # | Módulo | Modelo IA | Prioridade |
|---|---|---|---|
| M1 | Co-Pilot de Titulação [WEDGE] | Gemini 2.5 Flash Lite + RAG | 🟢 MVP |
| M2 | Prontuário Cannabis-Native (SOAP) | GPT-4o-mini + Whisper local | 🟢 MVP |
| M3 | Receituário Digital ANVISA (A/B + RDC 660) | GPT-4o-mini (validação) | 🟢 MVP |
| M4 | Tracker Paciente (sintoma-first 1-10) | Gemini Flash Lite + XGBoost | 🟢 MVP v0.5 |
| M5 | Telemedicina Embedded (LiveKit) | GPT-4o-mini (brief) | 🟢 MVP |
| M11 | Compliance Engine (auto-audit) | GPT-4o-mini (diff DOU) | 🟢 MVP |
| M6 | Logística "Trilho 14d" | Gemini Flash vision (OCR) | 🟡 v2 |
| M7 | Marketplace Transparente | LightFM + GPT-4o-mini | 🟡 v2 |
| M8 | Cohort & Evidence Lab | Gemini Flash (insights) | 🟡 v2 |
| M9 | Outcome SMS/WhatsApp | GPT-4o-mini (parsing) | 🟡 v2 |
| M10 | API Pública + Powered by Meridiana | re-uso modelos | 🟡 v2 |
| M12 | PK Modeling (compartmental) | scipy + PyMC | 🔵 v3 |
| M13 | Cobertura/reembolso assistido | GPT-4o (texto crítico) | 🔵 v3 |
| M14 | Indústria-Insights (anonimizados) | Gemini Flash | 🔵 v3 |

## Top 5 Diferenciadores

1. **Co-Pilot de Titulação com PK + RAG clínico** — único globalmente
2. **Trilho 14d** com SLA visível e money-back vs opacidade Cannect (RA 5.5)
3. **Cohort Evidence Lab** PT-BR com filtros CFM-eligible
4. **PII redaction local** antes de qualquer LLM externo
5. **Compliance Engine auto-audit** ANVISA/CFM/LGPD

## Modelo de Negócio

| Receita | Pricing |
|---|---|
| Médico Solo | R$ 199/mês (free 12 meses para 1.000 primeiros) |
| Médico Clínica | R$ 149/médico/mês (mín 3) |
| Paciente Plus | R$ 19,90/mês |
| Marketplace | 8–12% take rate (transparente vs. Cannect 15–30%) |
| Logística assistida | R$ 30/importação |
| B2B API | R$ 8/paciente-ativo/mês ou R$ 800/seat/mês |

**Unit economics médico Solo:** ARPU R$ 280 / Custo R$ 35 / CAC R$ 600 / Payback 2,5m / LTV/CAC ~9x

## Roadmap

- **90d MVP** — M1, M2, M3, M5, M11 + M4 v0.5; 50 médicos alpha; NPS ≥ 40
- **180d PMF** — M6–M10 lançados; 500 médicos pagantes, 8k pacientes; TTE mediano ≤ 21d
- **365d Escala** — M12–M14 lançados; 1.500 médicos, 30k pacientes; **TTE mediano ≤ 14d** (north star); ARR R$ 18M

## North Star

**TTE (Time-to-Therapeutic-Effect)** — dias da prescrição até paciente reportar redução ≥30% no sintoma alvo.

## Riscos críticos

| Risco | Severidade | Mitigação |
|---|---|---|
| Vazamento PHI (LGPD) | 🔴 | PII local-first, audit imutável, pen test trimestral |
| Hallucination IA em decisão clínica | 🔴 | Rule engine sobre IA em safety-critical |
| Litígio CFM contra médico-cliente | 🔴 | M11 + audit trail + cobertura jurídica embutida |
| Mudança regulatória ANVISA/CFM | 🟡 | Conselho ex-ANVISA + lobby ABRACS |
| Adoção médico lenta (CAC alto) | 🟡 | Wedge gratuito 12m + ASBRACAM/SBEC + content science-led |
