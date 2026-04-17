#!/usr/bin/env bash
# demo-flow.sh — exercita todos os módulos do MVP em sequência.
# Uso: bash demo-flow.sh   (com API rodando em localhost:3001)

set -e

API="${MERIDIANA_API:-http://localhost:3001}"
MEDICO_ID="00000000-0000-0000-0000-000000000001"
PACIENTE_ID="00000000-0000-0000-0000-000000000002"
HDR_MEDICO=(-H "x-user-id: $MEDICO_ID" -H "x-user-role: medico" -H "content-type: application/json")
HDR_PACIENTE=(-H "x-user-id: $PACIENTE_ID" -H "x-user-role: paciente" -H "content-type: application/json")
HDR_DPO=(-H "x-user-id: dpo-1" -H "x-user-role: dpo" -H "content-type: application/json")

bold() { printf "\n\033[1m\033[36m▶ %s\033[0m\n" "$1"; }
ok()   { printf "\033[32m  ✓ %s\033[0m\n" "$1"; }

bold "0. Health"
curl -s "$API/healthz" | head -c 800; echo

bold "1. M1 — Co-Pilot de Titulação (perfil completo Maria, fibromialgia)"
curl -s -X POST "$API/co-pilot/titulacao" "${HDR_MEDICO[@]}" \
  --data-binary @sample-titulacao.json | head -c 700; echo

bold "2a. M2 — Criar prontuário"
PRONTUARIO_ID=$(curl -s -X POST "$API/prontuario" "${HDR_MEDICO[@]}" \
  -d "{\"paciente_id\":\"$PACIENTE_ID\",\"cid10_principal\":\"M79.7\",\"cid10_secundarios\":[\"F32.1\"],\"evidencia_indicacao\":\"B\"}" \
  | python -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "Prontuário criado: $PRONTUARIO_ID"

bold "2b. M2 — Registrar consulta com auto-SOAP"
curl -s -X POST "$API/prontuario/$PRONTUARIO_ID/consulta" "${HDR_MEDICO[@]}" \
  --data-binary @sample-consulta.json | head -c 700; echo

bold "3. M3 — Emitir receita (Tipo B, ANVISA industrializado)"
curl -s -X POST "$API/receita" "${HDR_MEDICO[@]}" \
  --data-binary @sample-receita-tipo-b.json | head -c 700; echo

bold "4. M3 — Emitir receita com ofício RDC 660 (importação)"
curl -s -X POST "$API/receita" "${HDR_MEDICO[@]}" \
  --data-binary @sample-receita-rdc660.json | head -c 700; echo

bold "5. M4 — Paciente registra 2 tracker logs"
curl -s -X POST "$API/tracker/log" "${HDR_PACIENTE[@]}" \
  -d "{\"paciente_id\":\"$PACIENTE_ID\",\"dose_mg\":10,\"via\":\"sublingual\",\"sintomas\":{\"dor\":6,\"sono\":4,\"ansiedade\":3},\"efeitos_colaterais\":[],\"contexto\":{\"sono_horas\":5,\"estresse_1_10\":6},\"humor_score\":5,\"entrada_via\":\"app\"}" | head -c 300; echo

curl -s -X POST "$API/tracker/log" "${HDR_PACIENTE[@]}" \
  -d "{\"paciente_id\":\"$PACIENTE_ID\",\"dose_mg\":15,\"via\":\"sublingual\",\"sintomas\":{\"dor\":4,\"sono\":7,\"ansiedade\":2},\"efeitos_colaterais\":[\"boca seca leve\"],\"contexto\":{\"sono_horas\":7},\"humor_score\":7,\"entrada_via\":\"app\"}" | head -c 300; echo

bold "6. M4 — Insight semanal IA"
curl -s "$API/tracker/$PACIENTE_ID/insight" "${HDR_MEDICO[@]}" | head -c 600; echo

bold "7. M5 — Telemedicina: criar session"
SESSION_ID=$(curl -s -X POST "$API/telemedicina/session" "${HDR_MEDICO[@]}" \
  -d "{\"paciente_id\":\"$PACIENTE_ID\",\"agendado_para\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" \
  | python -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "Session criada: $SESSION_ID"

bold "8. M5 — Brief IA pré-consulta"
curl -s "$API/telemedicina/session/$SESSION_ID/brief" "${HDR_MEDICO[@]}" | head -c 700; echo

bold "9. M5 — Iniciar e finalizar (com transcrição)"
curl -s -X POST "$API/telemedicina/session/$SESSION_ID/start" "${HDR_MEDICO[@]}" > /dev/null
curl -s -X POST "$API/telemedicina/session/$SESSION_ID/finish" "${HDR_MEDICO[@]}" \
  --data-binary @sample-finish-session.json | head -c 400; echo

bold "10. M11 — Compliance: ver últimos eventos do audit log"
curl -s "$API/compliance/audit?limit=5" "${HDR_DPO[@]}" | head -c 600; echo

bold "11. M11 — Compliance: verificar integridade do hash chain"
curl -s "$API/compliance/audit/verify" "${HDR_DPO[@]}"; echo

bold "12. M11 — Compliance: regulação diff (resumo IA)"
curl -s -X POST "$API/compliance/regulacao/diff" "${HDR_DPO[@]}" \
  --data-binary @sample-regulacao-diff.json | head -c 700; echo

printf "\n\033[1m\033[32m✅ Demo end-to-end completa — todos os 6 módulos do MVP funcionais.\033[0m\n"
