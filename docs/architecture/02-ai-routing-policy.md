# 02 — AI Routing Policy

> Como decidimos qual modelo chamar para cada tarefa. Cheap-first, escala só com motivo.

## Provedores configurados

| Provedor | Modelos usados | Por quê |
|---|---|---|
| **Google Gemini** | `gemini-2.5-flash-lite`, `gemini-2.5-flash` | Default — ratio custo/qualidade imbatível para tarefas estruturadas |
| **OpenAI** | `gpt-4o-mini`, `gpt-4o`, `text-embedding-3-small` | Cache hit excelente, embeddings padrão de mercado |
| **Local (Ollama)** | `llama3.1:8b` | PII redaction — nunca pode sair da rede |
| **Self-hosted GPU** | `whisper-large-v3` | Transcrição — 12x mais barato que OpenAI Whisper API |

## Matriz tarefa × modelo

| Tarefa | Módulo | Modelo | Custo aprox | Critério |
|---|---|---|---|---|
| Recomendação de titulação | M1 | `gemini-2.5-flash-lite` + RAG (kb_protocolo + kb_artigo) | R$ 0,002 | Tarefa estruturada, latência baixa |
| Validação interação grave | M1 | **Rule engine + DrugBank** (não-IA) | R$ 0,000 | Safety-critical NUNCA decide via LLM |
| Estruturação SOAP do transcript | M2 | `gpt-4o-mini` + prompt cache (≥85% hit) | R$ 0,008 | Texto longo cacheável |
| Transcrição áudio consulta | M2/M5 | `whisper-large-v3` self-hosted | R$ 0,15/40min | OpenAI seria R$ 1,80 |
| PII redaction (todas chamadas externas) | global | `llama3.1:8b` (Ollama) + regex BR | R$ 0,001 amortizado | Privacidade absoluta |
| Insights paciente semanal | M4 | `gemini-2.5-flash-lite` | R$ 0,003/sem | Volume alto |
| Side-effect detection | M4 | XGBoost local | R$ 0,000 | Inferência grátis |
| Pré-consulta brief | M5 | `gpt-4o-mini` | R$ 0,01 | Sumarização |
| OCR docs logísticos | M6 | `gemini-2.5-flash` (multimodal) | R$ 0,005 | Vision barato |
| Predição de atraso logístico | M6 | regressão local | R$ 0,000 | Inferência grátis |
| Recomendação produto | M7 | LightFM (collaborative filtering) | R$ 0,000 | Local |
| Tradução bula → leigo | M7 | `gpt-4o-mini` + cache pesado por SKU | R$ 0,002 | Cache amortiza |
| Insights cohort narrativos | M8 | `gemini-2.5-flash` | R$ 0,01/sem | Análise média |
| Cohort matching demográfico | M8 | k-NN sobre embeddings local | R$ 0,000 | Local |
| Parsing SMS/WhatsApp livre | M9 | `gpt-4o-mini` | R$ 0,003 | Robusto a ruído |
| Diff regulatório DOU | M11 | `gpt-4o-mini` | R$ 0,001 | Classificação |
| Petição jurídica reembolso | M13 | `gpt-4o` | R$ 0,30 | Texto crítico |
| Embeddings RAG | M1, M2, M7 | `text-embedding-3-small` | R$ 0,00002/1K tok | Padrão mercado |

## Princípios

### 1. Cheap-first, justify upgrades

Todo `aiRouter.invoke({ task })` resolve para o modelo MAIS BARATO da tabela acima. Para escalar (ex: usar `gpt-4o` em vez de `gpt-4o-mini`), o caller passa `tier: "premium"` com justificativa registrada no log.

### 2. Pipeline em camadas

```
Input
  ↓
Rule engine (determinístico)        ← interactions críticas, validação CFM
  ↓ (se ambíguo)
Modelo barato (Gemini Flash Lite)   ← recomendação inicial
  ↓ (se confidence < 0.7)
Modelo médio (Gemini Flash)         ← análise mais profunda
  ↓ (se confidence < 0.85 + crítico)
Modelo premium (GPT-4o)             ← último recurso, com aviso
```

### 3. PII NUNCA sai sem redaction

**Pipeline obrigatório** para toda chamada a provedor externo:

```
Texto cru (PHI) → pii-redactor → Texto redacted → LLM → Resposta com placeholders
                                                            ↓
                                            Re-hidratação local com mapping table
                                                            ↓
                                                      Texto final ao usuário
```

`@meridiana/pii-redactor` faz isso em duas passadas:
1. **Regex BR** — CPF, RG, CNS, telefone, CEP, email, datas-de-nascimento
2. **Llama 3.1 8B local** (Ollama) — nomes de pessoas/lugares, contexto sensível que regex não pega

### 4. Cache agressivo

- **System prompts** vão em cache (Gemini Context Caching, OpenAI Prompt Caching).
- Alvo: ≥80% cache hit por endpoint após semana 2.
- Métrica monitorada via Langfuse.

### 5. Budget guard

```typescript
// config: AI_BUDGET_BRL_PER_PATIENT_MONTH=2.50
// hard stop: AI_BUDGET_HARD_STOP_BRL_PER_PATIENT_MONTH=3.00

if (custoAcumuladoPaciente >= HARD_STOP) {
  // desliga features não-críticas (M4 insights, M9 parsing, M8 cohort narrative)
  // mantém M1/M2/M3 (clínicas core)
  alertaDPO();
}
```

### 6. Audit trail de toda chamada IA

Cada `aiRouter.invoke()` registra em `audit_event`:
- modelo escolhido
- tarefa
- confidence
- custo estimado em BRL
- latência
- hash do prompt (não o prompt — privacidade)
- hash da resposta
- usuário que disparou (médico/paciente/sistema)

### 7. Hallucination disclaimer obrigatório

Toda saída de IA exposta ao médico/paciente carrega header:
> *"Sugestão gerada por IA. A decisão clínica final é do médico responsável. [Modelo: X | Confiança: Y%]"*

Override do médico (aceitar/recusar/editar) é logado em `audit_event` para auditoria CFM.

## Custo modelado por paciente/mês ativo

| Tarefa | Volume mensal | Custo unitário | Subtotal |
|---|---|---|---|
| Auto-SOAP (1 consulta) | 1 | R$ 0,008 | R$ 0,008 |
| Transcrição (40min) | 1 | R$ 0,15 | R$ 0,150 |
| Insights tracker (4 sem) | 4 | R$ 0,003 | R$ 0,012 |
| SMS parsing | 4 | R$ 0,003 | R$ 0,012 |
| Pré-consulta brief | 1 | R$ 0,010 | R$ 0,010 |
| PII redaction | n/a | R$ 0,005 amort. | R$ 0,005 |
| Cohort/marketplace reco | 1 | R$ 0,020 | R$ 0,020 |
| **Total IA pura** | | | **R$ 0,217** |
| Overhead infra (GPU amortizado) | | | R$ 0,580 |
| **Total geral** | | | **R$ 0,80** |

Bem dentro do alvo R$ 2,50.

## Failovers

- Gemini API down → cai para `gpt-4o-mini` (rota declarada `gemini-2.5-flash-lite → gpt-4o-mini`)
- OpenAI API down → cai para `gemini-2.5-flash`
- Ollama local down → bloqueia chamada externa (não permite vazamento PHI), retorna erro estruturado para retry
- Whisper self-hosted down → fila no BullMQ + retry exponencial; após 3 tentativas, alerta ops
