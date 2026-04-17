/**
 * Smoke tests do redactor. Rode com: pnpm --filter @meridiana/pii-redactor test
 * Requer Node 22+ com --experimental-strip-types.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { PiiRedactor } from "./index.ts";
import { validaCpf } from "./regex-br.ts";

test("redige CPF válido com formato e sem formato", async () => {
  const r = new PiiRedactor();
  const out = await r.redact(
    "Paciente CPF 123.456.789-09 e secundário 11122233396 deve sumir.",
  );
  assert.match(out.redacted, /\[CPF_001\]/);
  assert.match(out.redacted, /\[CPF_002\]/);
});

test("não falsifica CPF inválido", async () => {
  const r = new PiiRedactor();
  const out = await r.redact("Não-CPF: 111.111.111-11 nem 12345678900.");
  // 111.111.111-11 falha validação → não redige
  // 12345678900 falha validação → não redige
  assert.equal(out.stats.CPF ?? 0, 0);
});

test("redige email, telefone, CEP, data", async () => {
  const r = new PiiRedactor();
  const out = await r.redact(
    "Email: foo@bar.com, fone (11) 91234-5678, CEP 04567-890, nasc 12/03/1980.",
  );
  assert.match(out.redacted, /\[EMAIL_001\]/);
  assert.match(out.redacted, /\[TELEFONE_001\]/);
  assert.match(out.redacted, /\[CEP_001\]/);
  assert.match(out.redacted, /\[DATA_NASC_001\]/);
});

test("rehydrate restaura valores originais", async () => {
  const r = new PiiRedactor();
  const text = "Paciente CPF 123.456.789-09, fone (11) 91234-5678.";
  const { redacted, mapping } = await r.redact(text);
  const back = r.rehydrate(redacted, mapping);
  assert.equal(back, text);
});

test("dedupica mesmo valor em múltiplas ocorrências", async () => {
  const r = new PiiRedactor();
  const out = await r.redact("CPF 123.456.789-09 aparece duas vezes: 123.456.789-09.");
  // Mesmo CPF deve gerar mesmo placeholder
  const matches = out.redacted.match(/\[CPF_001\]/g) ?? [];
  assert.equal(matches.length, 2);
  assert.equal(out.stats.CPF, 2);
});

test("validaCpf básico", () => {
  assert.equal(validaCpf("123.456.789-09"), true);
  assert.equal(validaCpf("12345678909"), true);
  assert.equal(validaCpf("111.111.111-11"), false);
  assert.equal(validaCpf("12345678900"), false);
  assert.equal(validaCpf("abc"), false);
});
