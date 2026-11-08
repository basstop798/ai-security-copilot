import { describe, expect, it } from "vitest";
import { MESSAGES, waLink } from "./whatsapp";

describe("waLink", () => {
  it("targets the store number without the plus sign", () => {
    expect(waLink()).toBe("https://wa.me/213557430743");
  });

  it("encodes accents, line breaks and parentheses into the text", () => {
    const url = new URL(waLink(MESSAGES.sell));
    expect(url.searchParams.get("text")).toBe(MESSAGES.sell);
    expect(url.search).not.toMatch(/[\n ]/);
  });

  it("names the plan, duration and price in a PS Plus order", () => {
    expect(MESSAGES.psPlus("Extra", "3 mois", 8200)).toContain(
      "PS Plus Extra 3 mois (8 200 DA)",
    );
    expect(MESSAGES.psPlus("Deluxe", "12 mois", null)).toContain("Quel est le prix ?");
  });
});
