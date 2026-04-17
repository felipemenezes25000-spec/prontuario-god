# 🚀 Deploy Meridiana — Demo pública para a doutora testar

> **Objetivo:** uma URL pública, login que funciona, zero erros.
> **Tempo real de clique:** ~15 minutos se você nunca usou Railway+Vercel; ~5 se já usou.
> **Custo:** $0 no free tier inicial (Railway dá $5 de trial; Vercel hobby é grátis).

---

## Arquitetura do deploy

```
┌──────────────────┐         ┌────────────────────┐
│ Vercel (web)     │ ──────▶ │ Railway (api)      │
│ Next.js          │  HTTPS  │ Fastify + memória  │
│ meridiana.vercel │         │ meridiana-api.up   │
└──────────────────┘         └────────────────────┘
```

- **Modo demo**: `DB_MODE=memory` na API. Zero Postgres. Dados re-seedam no boot.
  A API guarda os dados da Dra. enquanto ela testa; se o container reiniciar, volta ao seed original.
- **Todos os adapters externos** rodam em `mock` (ICP-Brasil, CFM, WhatsApp, LiveKit, gov.br, Stripe).
  Nenhuma credencial externa necessária.

---

## Parte 1 — API no Railway (10 min)

### 1.1 Criar conta Railway

1. Acessar [https://railway.com](https://railway.com) → `Login with GitHub`
2. Autorizar acesso ao repositório do Meridiana
3. Se não tem o repo no GitHub: `cd "C:\Users\Felipe\Desktop\pronturario medico"` e:
   ```bash
   git add -A
   git commit -m "chore: preparar deploy inicial"
   gh repo create meridiana --private --source=. --push
   ```

### 1.2 Criar projeto Railway

1. Dashboard Railway → `New Project` → `Deploy from GitHub repo` → escolher `meridiana`
2. Railway vai detectar `railway.toml` automaticamente e começar o build
3. **Aguardar primeiro build** (~3 min). Vai falhar na healthcheck porque falta a var `PORT` ser exposta.

### 1.3 Configurar variáveis de ambiente

Na aba **Variables** do service, adicionar:

| Var | Valor | Obrigatório? |
|-----|-------|--------------|
| `NODE_ENV` | `production` | ✅ |
| `DB_MODE` | `memory` | ✅ |
| `JWT_SECRET` | rode `openssl rand -base64 48` local e cole aqui | ✅ |
| `LOG_LEVEL` | `info` | Opcional |
| `WEB_ORIGIN` | deixar em branco por agora — preencher depois com URL Vercel | Depois |
| `GEMINI_API_KEY` | sua chave Gemini (se tiver) | Opcional |
| `OPENAI_API_KEY` | sua chave OpenAI (se tiver) | Opcional |

Sem `GEMINI_API_KEY`/`OPENAI_API_KEY` a API usa `mock provider` — o produto ainda funciona visualmente, mas sugestões de IA serão stubs.

### 1.4 Gerar domínio público

1. Settings do service → `Networking` → `Generate Domain`
2. Railway vai te dar algo tipo `meridiana-production.up.railway.app`
3. **COPIA essa URL.** Vai ser `NEXT_PUBLIC_API_URL` na Vercel.

### 1.5 Validar

Abrir no navegador:
```
https://SUA-URL.up.railway.app/health
```
Deve retornar `{"ok":true}`. Se retornar `{"ok":true}`, API está **viva**.

Para ver o detalhe dos adapters:
```
https://SUA-URL.up.railway.app/healthz
```
Vai mostrar todos os módulos + status `mock` dos adapters. Se ver isso, **bom**.

---

## Parte 2 — Web no Vercel (5 min)

### 2.1 Criar conta Vercel

1. [https://vercel.com](https://vercel.com) → `Sign up with GitHub`
2. Dashboard → `Add New... → Project` → `Import Git Repository` → selecionar `meridiana`

### 2.2 Configurar o projeto (CRÍTICO: é monorepo)

Na tela de configuração do projeto:

| Campo | Valor |
|-------|-------|
| **Framework Preset** | Next.js (auto-detectado) |
| **Root Directory** | `apps/web` ← ⚠️ MUDE ISSO; default é `.` |
| **Build Command** | deixar default (`next build`) |
| **Output Directory** | deixar default (`.next`) |
| **Install Command** | `cd ../.. && pnpm install --frozen-lockfile` |
| **Node.js Version** | `22.x` |

### 2.3 Variáveis de ambiente

Na mesma tela, **antes** de fazer Deploy, expanda `Environment Variables`:

| Var | Valor |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | a URL Railway da parte 1.4 (SEM barra no final) |
| `ENABLE_EXPERIMENTAL_COREPACK` | `1` |

### 2.4 Deploy

Clicar `Deploy`. Vai demorar ~90s. Quando terminar, Vercel te dá uma URL tipo `meridiana.vercel.app`.

### 2.5 Liberar CORS

**Voltar no Railway** → Variables → atualizar:

| Var | Valor |
|-----|-------|
| `WEB_ORIGIN` | `https://meridiana.vercel.app` (a URL exata da Vercel) |

Railway vai redeploy automático em ~30s.

---

## Parte 3 — Compartilhar com a doutora

### Link para mandar
```
https://meridiana.vercel.app/entrar
```

### O que a Dra. vai fazer
1. Abrir o link
2. Ver um banner verde: "Está testando a demo? Clique em Entrar como Dra. Ana Beatriz"
3. Clicar no botão
4. Ir para o dashboard médico → paciente Maria Silva com prontuário rico
5. Testar:
   - `/medico/dashboard` — lista de pacientes
   - `/medico/prontuario/[id]` — prontuário completo com 5 consultas + 4 receitas + 29 tracker logs
   - `/medico/receita` — emissão de receita ANVISA
   - `/co-pilot/titulacao` — o **wedge** — Co-Pilot de titulação CBD/THC
   - `/paciente/log` — tracker sintoma-first (perspectiva paciente)

### Mensagem sugerida pra ela
> *"Amor, clica nesse link, depois no botão verde 'Entrar como Dra. Ana Beatriz'. Não precisa senha. Dá uma olhada no Co-Pilot e no Prontuário da Maria, me fala o que você acharia útil / estranho / faltando."*

---

## Troubleshooting

### ❌ Railway: build falha com "pnpm command not found"
Verifique se o Railway detectou a versão. Adicione variável `PACKAGE_MANAGER=pnpm`.

### ❌ Railway: build falha com "workspace not found"
O `--filter '@meridiana/api...'` no `railway.toml` é crítico. Se ainda assim falhar:
- Trocar builder para `DOCKERFILE` nas Settings (usa o `Dockerfile` já pronto na raiz).

### ❌ Vercel: build falha com "module not found: @meridiana/ai-router"
Problema típico: Root Directory não ficou como `apps/web` E Install Command precisa subir 2 níveis.
Verifique Step 2.2 — Install Command = `cd ../.. && pnpm install --frozen-lockfile`.

### ❌ Web abre mas botões não fazem nada (Network errors no DevTools)
CORS. Verifique:
- `WEB_ORIGIN` no Railway é **exatamente** a URL que aparece na barra do navegador da Vercel
- `NEXT_PUBLIC_API_URL` na Vercel é **exatamente** a URL do Railway, sem barra final
- Rebuilda a Vercel se mudou a env (env var muda exige redeploy)

### ❌ Railway mostra "Application failed to respond"
Healthcheck falhando. Check:
- Logs do Railway (aba Deployments)
- `curl https://SUA-URL.up.railway.app/health` deve retornar 200

### ❌ Healthcheck passa mas /healthz 500
Provavelmente JWT_SECRET não tem 32+ chars. Regenere:
```bash
openssl rand -base64 48
```

---

## Rollback

Se algo quebrar:
- **Railway:** aba `Deployments` → clicar deployment anterior → `Redeploy`
- **Vercel:** aba `Deployments` → clicar deployment anterior → `Promote to Production`

---

## Próximo nível (após a validação com a Dra.)

Quando quiser sair do modo demo:

1. Adicionar plugin **Postgres** no Railway (1 clique)
2. Mudar `DB_MODE=prisma` no Railway
3. Rodar migration via Railway CLI: `railway run pnpm --filter @meridiana/api db:deploy`
4. Rodar seed: `railway run pnpm --filter @meridiana/api db:seed`
5. Data agora persiste entre deploys — começa a valer a pena contratar o Dr. Real

---

**Dúvida comum**: "Posso só usar Vercel pra tudo?"

Não, porque:
- API é Fastify com conexões persistentes (Postgres + audit chain em memória)
- Vercel Functions são serverless ~10s max, resetam estado a cada invocação
- Para usar Vercel pra API, teríamos que reescrever Fastify → Route Handlers do Next.js (3-5 dias de refactor)

Railway + Vercel é o **padrão da indústria** para esse tipo de arquitetura.
