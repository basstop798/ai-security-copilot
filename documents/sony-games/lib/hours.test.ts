import { describe, expect, it } from "vitest";
import { algiersClock, getOpenStatus } from "./hours";

// Times are written in UTC; Algiers is UTC+1.
// 2026-11-09 is a Monday, 2026-11-12 a Thursday, 2026-11-13 a Friday.
const at = (iso: string) => new Date(iso);

describe("algiersClock", () => {
  it("shifts UTC to Algiers time, including across midnight", () => {
    expect(algiersClock(at("2026-11-09T09:00:00Z"))).toEqual({ day: 1, minutes: 600 });
    // 23:30 UTC Thursday is already 00:30 Friday in Algiers.
    expect(algiersClock(at("2026-11-12T23:30:00Z"))).toEqual({ day: 5, minutes: 30 });
  });
});

describe("getOpenStatus", () => {
  it("is open on a weekday morning", () => {
    expect(getOpenStatus(at("2026-11-09T09:00:00Z"))).toEqual({
      open: true,
      label: "Ouvert",
      detail: "ferme à 23:30",
    });
  });

  it("opens at 09:30 exactly and closes at 23:30 exactly", () => {
    expect(getOpenStatus(at("2026-11-09T08:29:00Z")).open).toBe(false);
    expect(getOpenStatus(at("2026-11-09T08:30:00Z")).open).toBe(true);
    expect(getOpenStatus(at("2026-11-09T22:29:00Z")).open).toBe(true);
    expect(getOpenStatus(at("2026-11-09T22:30:00Z")).open).toBe(false);
  });

  it("stays closed on Friday morning and opens at 16:00", () => {
    expect(getOpenStatus(at("2026-11-13T10:00:00Z"))).toEqual({
      open: false,
      label: "Fermé",
      detail: "ouvre aujourd'hui à 16:00",
    });
    expect(getOpenStatus(at("2026-11-13T15:00:00Z")).open).toBe(true);
  });

  it("announces Friday's late opening after closing on Thursday", () => {
    expect(getOpenStatus(at("2026-11-12T22:45:00Z")).detail).toBe(
      "ouvre demain à 16:00",
    );
  });

  it("announces the regular opening after closing on Friday", () => {
    expect(getOpenStatus(at("2026-11-13T22:45:00Z")).detail).toBe(
      "ouvre demain à 09:30",
    );
  });
});
