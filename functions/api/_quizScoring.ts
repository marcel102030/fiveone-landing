// Lógica pura de pontuação do quiz — compartilhada entre o endpoint (quiz-store)
// e os testes. Sem dependências de runtime (Cloudflare/Supabase).

export type Dom = 'apostolo' | 'profeta' | 'evangelista' | 'pastor' | 'mestre';
export const DOMS: Dom[] = ['apostolo', 'profeta', 'evangelista', 'pastor', 'mestre'];

export interface ScoringAnswer {
  statementAId: number;
  statementBId: number;
  choice: 'a' | 'b' | 'both' | 'none';
}

// Mapa afirmação→dom por faixa de id (1-20 apóstolo, 21-40 profeta, ...).
// Fonte da verdade no servidor — impede resultado manipulado pelo cliente.
export function categoryForStatementId(id: number): Dom | null {
  if (id >= 1 && id <= 20) return 'apostolo';
  if (id >= 21 && id <= 40) return 'profeta';
  if (id >= 41 && id <= 60) return 'evangelista';
  if (id >= 61 && id <= 80) return 'pastor';
  if (id >= 81 && id <= 100) return 'mestre';
  return null;
}

// Recalcula pontuação a partir das respostas individuais (autoridade do servidor).
export function computeScoresFromAnswers(answers: ScoringAnswer[]) {
  const raw: Record<Dom, number> = { apostolo: 0, profeta: 0, evangelista: 0, pastor: 0, mestre: 0 };
  for (const a of answers) {
    const ca = categoryForStatementId(a.statementAId);
    const cb = categoryForStatementId(a.statementBId);
    if (a.choice === 'a') { if (ca) raw[ca] += 1; }
    else if (a.choice === 'b') { if (cb) raw[cb] += 1; }
    else if (a.choice === 'both') { if (ca) raw[ca] += 1; if (cb) raw[cb] += 1; }
    // 'none' → não pontua
  }
  const total = DOMS.reduce((s, k) => s + raw[k], 0);
  const pct: Record<string, number> = {};
  for (const k of DOMS) pct[k] = total > 0 ? Math.round((raw[k] / total) * 100) : 0;
  const maxRaw = Math.max(0, ...DOMS.map((k) => raw[k]));
  const ties = maxRaw > 0 ? DOMS.filter((k) => raw[k] === maxRaw) : [];
  const topDom = ties[0] ?? '';
  return { raw: raw as Record<string, number>, pct, total, topDom, ties: ties as string[] };
}
