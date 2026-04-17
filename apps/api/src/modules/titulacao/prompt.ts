import { PROTOCOLOS, type NomeProtocolo } from "./protocolos.js";
import type { InteracaoFlag } from "./interacoes.js";
import type { TitulacaoInput } from "./schema.js";

/**
 * Constrói o user prompt do M1. Inclui:
 * - perfil do paciente (sem PII — passa pelo redactor depois)
 * - protocolo escolhido pelo rule engine (com detalhes do consenso)
 * - flags de interação (rule engine — autoridade)
 * - pedido de personalização específica
 */
export function construirPrompt(
  input: TitulacaoInput,
  protocolo: NomeProtocolo,
  flags: InteracaoFlag[],
): string {
  const proto = PROTOCOLOS[protocolo];

  return `## CASO CLÍNICO

**Indicação:** ${input.indicacao}${
    input.indicacao_outra_descricao ? ` — ${input.indicacao_outra_descricao}` : ""
  }
**Idade:** ${input.idade} anos
**Peso:** ${input.peso_kg} kg
${input.sexo_biologico ? `**Sexo biológico:** ${input.sexo_biologico}\n` : ""}
**Comorbidades:** ${input.comorbidades.length ? input.comorbidades.join("; ") : "nenhuma reportada"}
**Medicamentos em uso:** ${
    input.medicamentos_em_uso.length ? input.medicamentos_em_uso.join("; ") : "nenhum"
  }
**Tentativas terapêuticas prévias:** ${
    input.tentativas_previas.length ? input.tentativas_previas.join("; ") : "naïve"
  }
**Alergias:** ${input.alergias.length ? input.alergias.join("; ") : "nenhuma"}
${
  input.especialidade_prescritor
    ? `**Especialidade do prescritor:** ${input.especialidade_prescritor}`
    : ""
}

## PROTOCOLO PRÉ-SELECIONADO PELO RULE ENGINE

**${proto.nome.toUpperCase()}** — ${proto.descricao}
- População alvo: ${proto.populacao_alvo.join(", ")}
- CBD: dose inicial **${proto.cbd.dose_inicial_mg}mg ${proto.cbd.frequencia_diaria}x/dia**, incremento ${proto.cbd.incremento_mg}mg a cada ${proto.cbd.intervalo_incremento_dias[0]}-${proto.cbd.intervalo_incremento_dias[1]} dias, máximo ${proto.cbd.dose_maxima_mg_dia}mg/dia
- THC: dose inicial **${proto.thc.dose_inicial_mg}mg**, incremento ${proto.thc.incremento_mg}mg a cada ${proto.thc.intervalo_incremento_dias[0]}-${proto.thc.intervalo_incremento_dias[1]} dias, máximo ${proto.thc.dose_maxima_mg_dia}mg/dia. Iniciar: ${proto.thc.iniciar_apos}
- Evidência: ${proto.evidencia_nivel}. Fonte: ${proto.fonte}

## INTERAÇÕES IDENTIFICADAS PELO RULE ENGINE (autoritativo)

${
  flags.length === 0
    ? "Nenhuma interação medicamentosa relevante identificada."
    : flags
        .map(
          (f) =>
            `- **${f.medicamento}** [${f.severidade.toUpperCase()}] — ${f.mecanismo} → ${f.recomendacao}`,
        )
        .join("\n")
}

## SUA TAREFA

Personalize o protocolo acima para este caso específico. Devolva JSON conforme schema com:

1. **protocolo_recomendado** — confirme o pré-selecionado OU justifique mudança
2. **produto_sugerido** — tipo (CBD-iso / CBD-pred / 1:1 / THC-pred), via, e razão clínica
3. **dose_inicial** — valores numéricos personalizados (ajuste por peso/idade se relevante)
4. **ramp_up** — array com 4-6 marcos (dia X → dose Y → observação clínica), sequencial
5. **alerta_compliance** — receita_tipo (A ou B), via_regulatoria (RDC 660 se importação fizer sentido), observacao_cfm
6. **evidencia** — nível (A-D) e 1-3 referências
7. **proximos_passos** — array com 3-5 ações para o médico (ex: "agendar retorno em 14 dias", "solicitar TGO/TGP basal")
8. **disclaimer** — deixe vazio, será preenchido pelo sistema

Preserve placeholders [TIPO_NNN] se aparecerem — são PII redigida. NÃO tente reconstituí-los.`;
}
