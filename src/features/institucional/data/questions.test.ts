import { describe, it, expect } from "vitest";
import { buildCounterbalancedComparisons, statements } from "./questions";
import { CategoryEnum } from "../types/quiz";

const CATS = Object.values(CategoryEnum);

describe("banco de itens", () => {
  it("tem 20 afirmações por dom (100 no total)", () => {
    CATS.forEach((c) => expect(statements[c].length).toBe(20));
    const total = CATS.reduce((s, c) => s + statements[c].length, 0);
    expect(total).toBe(100);
  });

  it("ids são únicos", () => {
    const ids = CATS.flatMap((c) => statements[c].map((s) => s.id));
    expect(new Set(ids).size).toBe(100);
  });
});

describe("buildCounterbalancedComparisons (contrabalanceamento)", () => {
  it("gera 50 comparações (perPair=5)", () => {
    expect(buildCounterbalancedComparisons().length).toBe(50);
  });

  it("cada afirmação é usada exatamente uma vez", () => {
    const ids = buildCounterbalancedComparisons().flatMap((c) => [c.statement1.id, c.statement2.id]);
    expect(ids.length).toBe(100);
    expect(new Set(ids).size).toBe(100);
  });

  it("as duas afirmações de cada par são de dons diferentes", () => {
    buildCounterbalancedComparisons().forEach((c) =>
      expect(c.statement1.category).not.toBe(c.statement2.category),
    );
  });

  it("cada par de dons aparece exatamente 5 vezes (10 pares)", () => {
    const count: Record<string, number> = {};
    buildCounterbalancedComparisons().forEach((c) => {
      const key = [c.statement1.category, c.statement2.category].sort().join("|");
      count[key] = (count[key] || 0) + 1;
    });
    expect(Object.keys(count).length).toBe(10);
    Object.values(count).forEach((n) => expect(n).toBe(5));
  });

  it("cada dom aparece em exatamente 20 comparações", () => {
    const count: Record<string, number> = {};
    buildCounterbalancedComparisons().forEach((c) => {
      count[c.statement1.category] = (count[c.statement1.category] || 0) + 1;
      count[c.statement2.category] = (count[c.statement2.category] || 0) + 1;
    });
    CATS.forEach((c) => expect(count[c]).toBe(20));
  });

  it("randomiza a posição (statement1 varia de categoria entre execuções)", () => {
    const firstCats = new Set<string>();
    for (let i = 0; i < 25; i++) {
      firstCats.add(buildCounterbalancedComparisons()[0].statement1.category);
    }
    expect(firstCats.size).toBeGreaterThan(1);
  });
});
