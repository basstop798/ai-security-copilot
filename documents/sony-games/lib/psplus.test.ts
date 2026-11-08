import { describe, expect, it } from "vitest";
import { formatDA } from "./format";
import { lowestPrice, perMonth, savings } from "./psplus";
import { PS_PLUS_PLANS } from "./store";

const [essentiel, extra, deluxe] = PS_PLUS_PLANS;

describe("PS Plus pricing", () => {
  it("computes the 3-month saving against paying monthly", () => {
    expect(savings(essentiel, 3)).toBe(3 * 2400 - 5100);
    expect(savings(extra, 3)).toBe(3 * 3400 - 8200);
    expect(savings(deluxe, 3)).toBe(3 * 4000 - 9250);
  });

  it("shows no saving for 1 month or for an unknown price", () => {
    expect(savings(essentiel, 1)).toBeNull();
    expect(savings(essentiel, 12)).toBeNull();
    expect(perMonth(essentiel, 12)).toBeNull();
  });

  it("gives the monthly equivalent of a 3-month offer", () => {
    expect(perMonth(essentiel, 3)).toBe(1700);
  });

  it("finds the cheapest offer", () => {
    expect(lowestPrice()).toBe(2400);
  });
});

describe("formatDA", () => {
  it("groups thousands", () => {
    expect(formatDA(9250)).toBe("9 250 DA");
    expect(formatDA(400)).toBe("400 DA");
  });
});
