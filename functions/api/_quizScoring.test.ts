import { describe, it, expect } from "vitest";
import { categoryForStatementId, computeScoresFromAnswers } from "./_quizScoring";

describe("categoryForStatementId", () => {
  it("mapeia faixas de id para dons", () => {
    expect(categoryForStatementId(1)).toBe("apostolo");
    expect(categoryForStatementId(20)).toBe("apostolo");
    expect(categoryForStatementId(21)).toBe("profeta");
    expect(categoryForStatementId(40)).toBe("profeta");
    expect(categoryForStatementId(41)).toBe("evangelista");
    expect(categoryForStatementId(60)).toBe("evangelista");
    expect(categoryForStatementId(61)).toBe("pastor");
    expect(categoryForStatementId(80)).toBe("pastor");
    expect(categoryForStatementId(81)).toBe("mestre");
    expect(categoryForStatementId(100)).toBe("mestre");
  });

  it("retorna null fora do intervalo", () => {
    expect(categoryForStatementId(0)).toBeNull();
    expect(categoryForStatementId(101)).toBeNull();
    expect(categoryForStatementId(-5)).toBeNull();
  });
});

describe("computeScoresFromAnswers", () => {
  it("'a' pontua o dom da afirmação A; 'b' o da B", () => {
    const r = computeScoresFromAnswers([
      { statementAId: 1, statementBId: 21, choice: "a" }, // apostolo
      { statementAId: 2, statementBId: 41, choice: "b" }, // evangelista
    ]);
    expect(r.raw.apostolo).toBe(1);
    expect(r.raw.evangelista).toBe(1);
    expect(r.total).toBe(2);
  });

  it("'both' pontua os dois; 'none' não pontua", () => {
    const r = computeScoresFromAnswers([
      { statementAId: 1, statementBId: 21, choice: "both" }, // apostolo + profeta
      { statementAId: 2, statementBId: 42, choice: "none" }, // nada
    ]);
    expect(r.raw.apostolo).toBe(1);
    expect(r.raw.profeta).toBe(1);
    expect(r.total).toBe(2);
  });

  it("normaliza percentuais e define topDom", () => {
    const answers = [
      { statementAId: 1, statementBId: 21, choice: "a" as const },
      { statementAId: 3, statementBId: 22, choice: "a" as const },
      { statementAId: 5, statementBId: 23, choice: "a" as const }, // apostolo x3
      { statementAId: 6, statementBId: 41, choice: "b" as const }, // evangelista x1
    ];
    const r = computeScoresFromAnswers(answers);
    expect(r.raw.apostolo).toBe(3);
    expect(r.raw.evangelista).toBe(1);
    expect(r.total).toBe(4);
    expect(r.pct.apostolo).toBe(75);
    expect(r.pct.evangelista).toBe(25);
    expect(r.topDom).toBe("apostolo");
    expect(r.ties).toEqual(["apostolo"]);
  });

  it("detecta empate no topo", () => {
    const r = computeScoresFromAnswers([
      { statementAId: 1, statementBId: 41, choice: "a" }, // apostolo
      { statementAId: 22, statementBId: 42, choice: "a" }, // profeta
    ]);
    expect([...r.ties].sort()).toEqual(["apostolo", "profeta"]);
  });

  it("sem respostas: total 0, pct 0, sem topDom", () => {
    const r = computeScoresFromAnswers([]);
    expect(r.total).toBe(0);
    expect(r.pct.apostolo).toBe(0);
    expect(r.topDom).toBe("");
    expect(r.ties).toEqual([]);
  });
});
