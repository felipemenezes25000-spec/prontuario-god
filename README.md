# Meridiana

> Prontuário inteligente vertical para cannabis medicinal no Brasil.
> IA em todas as camadas. Cheap-first. LGPD-by-design.

**Status:** beta — MVP 90d (M1-M5+M11) + camada produção (Prisma+Postgres, JWT+RBAC, CRUD pacientes, catálogo real, multi-clínica, adapters externos).

---

## ✦ O que é

Plataforma vertical para os ~5.000 médicos brasileiros que prescrevem cannabis e os ~873.000 pacientes ativos.

**Wedge:** Co-Pilot de Titulação — gratuito 12 meses para 1.000 médicos hand-picked.
**North star metric:** TTE (Time-to-Therapeutic-Effect) — comprimir de 60d para 14d.

Detalhes estratégicos: [`docs/architecture/00-blueprint.md`](docs/architecture/00-blueprint.md).

---

## ✦ Estrutura

```
meridiana/
├── apps/
│   ├── api/                   ← Fastify + Zod (M1-M5 + M11)
│   └── web/                   ← Next.js 15 + Tailwind v3 + Fraunces/Inter Tight/JetBrains Mono
├── packages/
│   ├── ai-router/             ← Gemini Flash Lite + GPT-4o-mini + budget guard + fallback + audit
│   └── pii-redactor/          ← Regex BR (CPF/RG/CNS/...) + Llama local fallback
├── docs/
│   ├── architecture/{00-blueprint, 01-data-model, 02-ai-routing-policy}.md
│   └── compliance/lgpd-cfm-anvisa.md
└── .env.example
```

## ✦ Setup

### A. Modo rápido — in-memory (demo, sem Postgres)

```bash
pnpm install
cp .env.example .env          # DB_MODE=memory é o default
pnpm dev:api                  # → http://localhost:3001
```

### B. Modo produção — Postgres real (Prisma)

```bash
# 1. Subir Postgres + Redis via Docker
docker compose up -d postgres redis

# 2. Configurar .env
cp .env.example .env
# Editar: DB_MODE=prisma

# 3. Aplicar migrations + seed
cd apps/api
pnpm db:migrate              # cria schema no Postgres
pnpm db:seed                 # popula clínica, 2 médicos, 3 pacientes, catálogo 40+ SKUs

# 4. Rodar
cd ../..
pnpm dev:api                 # → http://localhost:3001

# Ferramentas úteis
pnpm --filter @meridiana/api db:studio   # UI Prisma em :5555
```

### C. Web

```bash
pnpm --filter @meridiana/web dev  # → http://localhost:3002
```

### D. Integrações externas (ativar uma a uma)

Todos os adapters têm implementação **mock** (default) + **real** (requer credenciais).
Troque no `.env`:

| Var | mock | real |
|-----|-----|-----|
| `CFM_ADAPTER` | mock | cfm_portal_scraper (requer integração com portal CFM) |
| `ICP_BRASIL_ADAPTER` | mock | vidaas / soluti / birdid (contrato Valid/SoluteCert) |
| `WHATSAPP_ADAPTER` | mock | meta_cloud (WHATSAPP_PHONE_ID + WHATSAPP_ACCESS_TOKEN) |
| `LIVEKIT_ADAPTER` | mock | livekit_cloud (LIVEKIT_URL + API_KEY + API_SECRET) |
| `GOVBR_RDC660_ADAPTER` | mock | gov_sei_real (não há API oficial; semiautomático) |
| `BILLING_ADAPTER` | mock | stripe (STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET) |

## ✦ Demo end-to-end

```bash
cd apps/api
bash demo-flow.sh
```

Exercita os 6 módulos sequencialmente: titulação, prontuário+SOAP, receituário Tipo A/B+RDC 660, tracker logs, insight semanal IA, telemedicina, compliance audit + hash chain verify + regulação diff.

---

## ✦ Os 6 módulos do MVP

| # | Módulo | Endpoint | Modelo IA |
|---|---|---|---|
| **M1** | Co-Pilot de Titulação | `POST /co-pilot/titulacao` | Gemini 2.5 Flash Lite + RAG protocolos Delphi 2021 |
| **M2** | Prontuário Cannabis-Native | `POST /prontuario/:id/consulta` | GPT-4o-mini auto-SOAP + Whisper local (transcrição) |
| **M3** | Receituário ANVISA | `POST /receita` | Determinístico (CFM-safe) — gera Tipo A/B + Notificação + ofício RDC 660 |
| **M4** | Tracker Sintoma-First | `POST /tracker/log` + `GET /tracker/:id/insight` | Gemini Flash Lite (insights semanais) |
| **M5** | Telemedicina + Brief | `POST /telemedicina/session` + `GET .../brief` | GPT-4o-mini (brief pré-consulta) |
| **M11** | Compliance Engine | `GET /compliance/audit` + verify + `POST .../regulacao/diff` | GPT-4o-mini (diff regulatório) |

## ✦ Frontend — Pharmacopoeia 2.0

3 páginas polidas, dark mode editorial:

| Rota | O que é |
|---|---|
| `/` | Landing — hero com molécula CBD animada + sparklines de cohort + módulos + pricing |
| `/co-pilot/titulacao` | Wedge — formulário clínico → protocolo visualizado como escada ascendente CBD/THC + red flags |
| `/paciente/log` | Tracker mobile-first — sintoma-first, escala visual 1-10, dose/via, confirmação |

**Aesthetic:** Fraunces (display variable serif) + Inter Tight (body) + JetBrains Mono (clínico). Paleta: ink #0a1110 / cream #F4EFE6 / leaf #5BC07A / ochre #C89B5C / ember #D87A4A. Marginalia Tufte, escadinhas para titulação, sparklines reais, footnote-as-design.

---

## ✦ Princípios de IA

1. **Cheap-first** — Gemini 2.5 Flash Lite default (~R$ 0,002/chamada)
2. **PII nunca sai sem redação local** — `@meridiana/pii-redactor` (regex BR + Llama 3.1 8B local)
3. **Rule engine sobre IA** em decisões safety-critical (interações graves)
4. **Budget guard** — circuit breaker se custo/paciente/mês > R$ 3
5. **Cache agressivo** — system prompts cacheados (alvo ≥80% hit)
6. **Fallback automático** — Gemini ↓ OpenAI ↓ Mock (sem keys)
7. **Audit trail** — toda chamada IA loggada com hash de prompt/response

Detalhe: [`docs/architecture/02-ai-routing-policy.md`](docs/architecture/02-ai-routing-policy.md).

## ✦ Compliance

| Norma | Como o sistema cumpre |
|---|---|
| **ANVISA RDC 327/2019** + 1.012-1.015/2026 | M3 emite Tipo A/B baseado em concentração; rota inclui fibromialgia/lúpus |
| **ANVISA RDC 660/2022** | M3 gera ofício pré-preenchido com 2 anos de validade + alerta 6m antes |
| **CFM 2.324/22** | M1 + M3 validam especialidade do prescritor; sugere via ANVISA quando CFM restringe |
| **CFM 1.821/2007** | Soft delete por 20 anos; audit log imutável |
| **LGPD art. 11** | Consentimento granular por finalidade, criptografia at-rest, audit hash chain |

Detalhe: [`docs/compliance/lgpd-cfm-anvisa.md`](docs/compliance/lgpd-cfm-anvisa.md).

---

## ✦ API de produção — módulos adicionais

Além dos 6 módulos do MVP original, a API agora expõe:

| Endpoint | Descrição |
|---|---|
| `POST /auth/signup` | Cadastro médico (valida CRM via adapter CFM antes de criar) |
| `POST /auth/login` | Login → JWT access (15min) + refresh cookie httpOnly (7d) |
| `POST /auth/refresh` | Rotação de refresh token |
| `POST /auth/logout` | Revoga refresh atual |
| `GET /auth/me` | Info da sessão + MFA status |
| `GET/POST/PATCH/DELETE /pacientes` | CRUD + busca fuzzy + cursor pagination + soft-delete 20 anos CFM 1.821 |
| `GET/POST /clinicas` | Multi-tenant — cada user pertence a N clínicas via `ClinicMembership` |
| `POST /clinicas/:id/membros` | Convida médicos, recepção, financeiro (owner/admin only) |
| `GET /produtos` | Catálogo 40+ SKUs (Prati, Greencare, Aurora, Bedrocan, HempMeds…) — filtros por classe, ratio CBD:THC, preço, fabricante |
| `GET /produtos/_facets` | Agregações p/ UI (fabricantes + classes com count) |
| `GET/POST /exames` + `GET /pacientes/:id/exames/timeline` | Exames laboratoriais — função hepática/renal durante uso de CBD |

### Schema Prisma (30+ modelos)

- **IAM**: `User` + `RefreshToken` + `Consent` (LGPD art. 11 granular)
- **Multi-tenant**: `Clinic` + `ClinicMembership` (owner/admin/medico/recepcao/financeiro)
- **Clínicos**: `Paciente`, `Medico`, `Prontuario`, `ProntuarioEvento`, `ExameLaboratorial`
- **Cannabis-specific**: `Produto` (classe, status regulatório, mg/mL CBD/THC), `Prescricao` (tipo A/B, via regulatória, `status_660`, `validade_660_ate`), `AssinaturaDigital` (ICP-Brasil com PAdES)
- **Telemed**: `TelemedicinaSession` com tokens LiveKit
- **Billing**: `Subscription` + `Invoice` (Stripe/Pagar.me)
- **Mensageria**: `Mensagem` (WhatsApp template, SMS, email)
- **Audit**: `AuditEvent` hash-chained (tamper-evidence)
- **AI observability**: `AiCall` (budget guard, cache hits, PII redaction log)

Ver [`apps/api/prisma/schema.prisma`](apps/api/prisma/schema.prisma).

## ✦ Próximos passos

### Curto prazo (pode ser feito sem credenciais externas)
1. **Frontend consumindo API real** — trocar localStorage mock por `/auth/login` + Bearer token
2. **M6 Trilho 14d** (logística + tracking ANVISA via adapter gov.br)
3. **Migração de dados** — rota `/admin/import-memory-to-prisma` para puxar o seed rico legado
4. **Whisper self-hosted** via docker-compose (GPU ou CPU-only)

### Médio prazo (requer contratos/credenciais)
5. **ICP-Brasil real** — assinar contrato com Valid (VIDaaS) ou SoluteCert (BirdID)
6. **WhatsApp Business** — aprovação Meta + templates HSM submetidos
7. **LiveKit Cloud** ou self-host em DigitalOcean BR (LGPD data residency)
8. **CFM Portal Scraper** — com IP residencial + User-Agent identificado
9. **Stripe/Pagar.me** — price IDs reais no dashboard + webhook signing

### Longo prazo (time + $$$)
10. **App mobile paciente** (Expo + React Native) com push via FCM
11. **M7 Marketplace transparente** (8-12% take rate — depende de contrato com distribuidores)
12. **M8 Cohort & Evidence Lab** (k-anonymity + differential privacy)
13. **DPO dedicado** + **ISO 27001** + **HDS** (12+ meses de certificação)
14. **30-50 médicos prescritores ASBRACAM** em programa piloto gratuito
