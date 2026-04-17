# 01 — Data Model

> Entidades core do sistema. PostgreSQL 16 + pgvector. PHI cifrado at-rest com chave por paciente em KMS.

## Princípios

- **Audit trail imutável** para toda escrita em entidade marcada como `🔒 PHI` (hash-chained `audit_event`).
- **Soft delete por LGPD** — `deleted_at` + `deletion_reason`. Hard delete só após retenção legal (20 anos para prontuário CFM 1821/2007).
- **Multi-tenant por médico/clínica** com row-level security (Postgres RLS).
- **Embeddings em coluna separada** (vector(1536)) — nunca em tabela de PHI direto.
- **Consentimento granular** — toda finalidade de uso de dados (clínica, pesquisa, marketplace) tem flag separada com timestamp e revogabilidade.

## Entidades core

### `usuario` (autenticação base)
- `id` uuid pk
- `email` text unique
- `telefone` text
- `senha_hash` text (Argon2id)
- `papel` enum (`medico`, `paciente`, `admin`, `dpo`, `associacao_admin`)
- `criado_em` timestamptz
- `mfa_secret` text (cifrado)
- `ultimo_login_em` timestamptz

### `medico` 🔒
- `id` uuid pk
- `usuario_id` uuid fk
- `nome_completo` text 🔒
- `cpf` text 🔒 (cifrado, índice em hash)
- `crm_numero` text + `crm_uf` text (validado contra CFM)
- `especialidade` text[] (CFM 2.324 — `neurologia`, `psiquiatria`, `dor`, etc.)
- `rqe` text[]
- `clinica_id` uuid fk nullable
- `assinatura_icp_brasil_id` text
- `plano` enum (`solo`, `clinica`, `enterprise`, `free`)
- `consentimento_lgpd_em` timestamptz
- `criado_em` timestamptz

### `paciente` 🔒
- `id` uuid pk
- `usuario_id` uuid fk nullable (paciente pode existir sem login)
- `medico_responsavel_id` uuid fk
- `nome_completo` text 🔒
- `cpf` text 🔒
- `data_nascimento` date 🔒
- `sexo_biologico` enum
- `peso_kg` numeric
- `altura_cm` integer
- `endereco` jsonb 🔒
- `comorbidades` text[] (CID-10)
- `medicamentos_em_uso` jsonb (rxnorm/dcb_id, dose, frequencia)
- `alergias` text[]
- `consentimento_clinico_em` timestamptz
- `consentimento_pesquisa_em` timestamptz nullable
- `consentimento_marketplace_em` timestamptz nullable
- `via_acesso_preferida` enum (`industrializado`, `importacao_660`, `magistral`, `associacao`, `cultivo_hc`)
- `associacao_id` uuid fk nullable
- `habeas_corpus_doc_id` uuid fk nullable

### `prontuario` 🔒
- `id` uuid pk
- `paciente_id` uuid fk
- `criado_em` timestamptz
- `versao` integer (incrementa a cada update; histórico imutável em `prontuario_evento`)
- `anamnese_estruturada` jsonb (BPI, GAD-7, PHQ-9, escalas SF-36 etc.)
- `cid10_principal` text
- `cid10_secundarios` text[]
- `evidencia_indicacao` enum (`A`, `B`, `C`, `D`) — grau de evidência cannabis para CID
- `embedding_resumo` vector(1536) (gerado por text-embedding-3-small)

### `prontuario_evento` (append-only)
- `id` uuid pk
- `prontuario_id` uuid fk
- `tipo` enum (`consulta`, `tracker`, `prescricao`, `import_660`, `nota_voz`, `exame_anexado`)
- `payload` jsonb 🔒
- `audio_url` text nullable (S3 BR cifrado)
- `transcricao` text nullable 🔒
- `transcricao_modelo` text (`whisper-large-v3`)
- `criado_por_usuario_id` uuid fk
- `criado_em` timestamptz
- `hash_anterior` text (chain — anti-tampering)

### `produto_cannabis` (catálogo, sem PHI)
- `id` uuid pk
- `marca` text
- `nome_comercial` text
- `fabricante` text
- `via_administracao` enum (`oral`, `sublingual`, `inalada`, `dermatologica`, `bucal`)
- `forma_farmaceutica` enum (`oleo`, `capsula`, `flor`, `dermo`, `vape`)
- `cbd_mg_ml` numeric
- `thc_mg_ml` numeric
- `cbn_mg_ml` numeric nullable
- `terpenos` jsonb nullable
- `coa_url` text (Certificate of Analysis)
- `lote` text
- `validade` date
- `via_acesso` enum (mesmo da `paciente`)
- `registro_anvisa` text nullable
- `preco_medio_brl` numeric
- `descontinuado` boolean default false
- `embedding` vector(1536) (para recomendação)

### `prescricao` 🔒
- `id` uuid pk
- `paciente_id` uuid fk
- `medico_id` uuid fk
- `produto_id` uuid fk
- `tipo_receita` enum (`B`, `A`) — derivado de `produto_cannabis.thc_mg_ml`
- `dose_inicial_mg_dia` numeric
- `protocolo_titulacao` enum (`routine`, `conservative`, `rapid`, `custom`)
- `posologia_texto` text 🔒
- `dose_alvo_mg_dia` numeric
- `duracao_dias` integer
- `notificacao_receita_numero` text (serializado)
- `assinatura_digital_id` text (ICP-Brasil)
- `pdf_receita_url` text 🔒
- `pdf_oficio_660_url` text nullable 🔒
- `status_660` enum (`nao_aplicavel`, `pendente`, `submetido`, `aprovado`, `negado`, `expirado`)
- `validade_660_ate` date nullable
- `criado_em` timestamptz

### `tracker_log` 🔒 (alimenta M4 → M8)
- `id` uuid pk
- `paciente_id` uuid fk
- `prescricao_id` uuid fk nullable
- `criado_em` timestamptz
- `dose_mg` numeric
- `via` enum (mesma de produto)
- `sintomas` jsonb (escala 1–10 por sintoma; ex: `{"dor_geral": 6, "sono": 4, "ansiedade": 3}`)
- `efeitos_colaterais` text[]
- `contexto` jsonb nullable (sono noite anterior, estresse, alimentação)
- `humor_score` integer 1–10 nullable
- `entrada_via` enum (`app`, `sms`, `whatsapp`, `voz`)
- `transcricao_voz` text nullable

### `outcome_attribution` (computed, ML-friendly)
- `id` uuid pk
- `paciente_id` uuid fk
- `janela_inicio` timestamptz
- `janela_fim` timestamptz
- `produto_id` uuid fk
- `sintoma_alvo` text
- `delta_pct` numeric (% melhora vs baseline)
- `confianca` numeric 0–1 (baixa se trocou de produto na janela)
- `tte_dias` integer (Time-to-Therapeutic-Effect)

### `cohort_snapshot` (M8, agregado)
- `id` uuid pk
- `criado_em` timestamptz
- `dimensao_demo` jsonb (idade_bin, sexo, comorbidade)
- `dimensao_clinica` jsonb (cid10, ratio_cbd_thc_bin, dose_bin)
- `n_pacientes` integer (≥5 por k-anonymity)
- `tte_mediana_dias` numeric
- `delta_mediana_pct` numeric
- `efeitos_colaterais_top` jsonb

### `audit_event` (imutável, hash chain)
- `id` uuid pk
- `entidade` text
- `entidade_id` uuid
- `acao` enum (`create`, `read`, `update`, `delete`, `export`, `consent_grant`, `consent_revoke`)
- `usuario_id` uuid fk
- `payload_hash` text (sha256)
- `payload_redacted` jsonb
- `criado_em` timestamptz
- `hash_anterior` text
- `hash_atual` text (hash chain — incompatível com tampering)

### `consentimento` (granular LGPD)
- `id` uuid pk
- `paciente_id` uuid fk
- `finalidade` enum (`tratamento_clinico`, `pesquisa_anonimizada`, `marketplace`, `comunicacao_marketing`, `compartilhar_associacao`, `industria_insights`)
- `concedido_em` timestamptz
- `revogado_em` timestamptz nullable
- `base_legal` enum (`art_11_II_a`, `art_11_II_d`, `art_11_II_f`, `consentimento_explicito`)
- `texto_apresentado` text (versão do termo na hora do consentimento)

### `regulacao_evento` (M11)
- `id` uuid pk
- `fonte` enum (`anvisa_dou`, `cfm_resolucao`, `stj_decisao`)
- `numero` text
- `publicado_em` date
- `texto_url` text
- `resumo_ia` text (gerado por GPT-4o-mini)
- `relevancia` enum (`critica`, `alta`, `media`, `baixa`)
- `modulos_afetados` text[] (ex: `["M3", "M11"]`)

## Tabelas vetoriais (RAG do M1)

### `kb_artigo`
- `id` uuid pk
- `titulo` text
- `pmid` text nullable (PubMed)
- `doi` text nullable
- `resumo` text
- `texto_completo_url` text
- `condicoes` text[] (CID-10)
- `nivel_evidencia` enum (`A`, `B`, `C`, `D`)
- `embedding` vector(1536)

### `kb_protocolo` (consenso Delphi 2021 + outros)
- `id` uuid pk
- `nome` enum (`routine`, `conservative`, `rapid`)
- `descricao` text
- `populacao_alvo` text[]
- `dose_inicial_cbd_mg` numeric
- `incremento_cbd_mg` numeric
- `intervalo_incremento_dias` integer
- `dose_maxima_cbd_mg` numeric
- `thc_inicial_mg` numeric
- `incremento_thc_mg` numeric
- `intervalo_thc_dias` integer
- `dose_maxima_thc_mg` numeric
- `embedding` vector(1536)

## Migrações

Pasta: `apps/api/migrations/` (Drizzle ou Prisma — decidir no setup do DB).
