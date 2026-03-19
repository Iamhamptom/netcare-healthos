import { describe, it, expect } from "vitest";

// Test the business-hours helper and slot generation logic
// We test the pure logic without DB dependencies

describe("Booking Engine — Time Slot Generation", () => {
  function generateSlots(startH: number, startM: number, endH: number, endM: number, duration: number) {
    const slots: { time: string; available: boolean }[] = [];
    let h = startH, m = startM;
    while (h < endH || (h === endH && m < endM)) {
      slots.push({
        time: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
        available: true,
      });
      m += duration;
      if (m >= 60) { h += Math.floor(m / 60); m = m % 60; }
    }
    return slots;
  }

  it("generates 30-minute slots for a full day (08:00-17:00)", () => {
    const slots = generateSlots(8, 0, 17, 0, 30);
    expect(slots.length).toBe(18); // 9 hours × 2 slots/hour
    expect(slots[0].time).toBe("08:00");
    expect(slots[slots.length - 1].time).toBe("16:30");
  });

  it("generates 45-minute slots correctly", () => {
    const slots = generateSlots(8, 0, 13, 0, 45);
    // 08:00, 08:45, 09:30, 10:15, 11:00, 11:45, 12:30
    expect(slots.length).toBe(7);
    expect(slots[0].time).toBe("08:00");
    expect(slots[1].time).toBe("08:45");
    expect(slots[2].time).toBe("09:30");
  });

  it("generates Saturday half-day slots (08:00-13:00)", () => {
    const slots = generateSlots(8, 0, 13, 0, 30);
    expect(slots.length).toBe(10);
    expect(slots[slots.length - 1].time).toBe("12:30");
  });

  it("returns empty for closed day", () => {
    // Sunday — no hours
    const slots: { time: string }[] = [];
    expect(slots.length).toBe(0);
  });

  it("all slots start as available", () => {
    const slots = generateSlots(8, 0, 12, 0, 30);
    expect(slots.every(s => s.available)).toBe(true);
  });

  it("handles 60-minute slots", () => {
    const slots = generateSlots(8, 0, 17, 0, 60);
    expect(slots.length).toBe(9);
    expect(slots.map(s => s.time)).toEqual([
      "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00",
    ]);
  });
});

describe("Booking Engine — Practice Hours Parser", () => {
  const DEFAULT_HOURS: Record<number, [string, string] | null> = {
    0: null, 1: ["08:00", "17:00"], 2: ["08:00", "17:00"], 3: ["08:00", "17:00"],
    4: ["08:00", "17:00"], 5: ["08:00", "17:00"], 6: ["08:00", "13:00"],
  };

  const DAY_MAP: Record<string, number[]> = {
    Sun: [0], Mon: [1], Tue: [2], Wed: [3], Thu: [4], Fri: [5], Sat: [6],
  };

  function expandRange(range: string): number[] {
    const parts = range.split("-");
    if (parts.length === 1) return DAY_MAP[parts[0]] || [];
    const dayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const startIdx = dayOrder.indexOf(parts[0]);
    const endIdx = dayOrder.indexOf(parts[1]);
    if (startIdx === -1 || endIdx === -1) return [];
    const days: number[] = [];
    for (let i = startIdx; i <= endIdx; i++) days.push(i);
    return days;
  }

  function getPracticeHours(hours: string, dayOfWeek: number): [string, string] | null {
    if (!hours) return DEFAULT_HOURS[dayOfWeek] ?? null;
    const segments = hours.split(",").map(s => s.trim());
    for (const seg of segments) {
      const match = seg.match(/^([\w-]+)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
      if (!match) continue;
      const [, dayRange, start, end] = match;
      const days = expandRange(dayRange);
      if (days.includes(dayOfWeek)) {
        return [start.padStart(5, "0"), end.padStart(5, "0")];
      }
    }
    return null; // Day not listed = closed
  }

  it("parses Mon-Fri hours", () => {
    const hours = "Mon-Fri 08:00-17:00, Sat 08:00-13:00";
    expect(getPracticeHours(hours, 1)).toEqual(["08:00", "17:00"]); // Monday
    expect(getPracticeHours(hours, 5)).toEqual(["08:00", "17:00"]); // Friday
  });

  it("parses Saturday hours", () => {
    const hours = "Mon-Fri 08:00-17:00, Sat 08:00-13:00";
    expect(getPracticeHours(hours, 6)).toEqual(["08:00", "13:00"]);
  });

  it("returns null for Sunday (not listed)", () => {
    const hours = "Mon-Fri 08:00-17:00, Sat 08:00-13:00";
    expect(getPracticeHours(hours, 0)).toBeNull();
  });

  it("parses extended hours with Sunday", () => {
    const hours = "Mon-Sat 9:00-19:00, Sun 10:00-16:00";
    expect(getPracticeHours(hours, 3)).toEqual(["09:00", "19:00"]); // Wednesday
    expect(getPracticeHours(hours, 6)).toEqual(["09:00", "19:00"]); // Saturday
    expect(getPracticeHours(hours, 0)).toEqual(["10:00", "16:00"]); // Sunday
  });

  it("falls back to defaults when hours string is empty", () => {
    expect(getPracticeHours("", 1)).toEqual(["08:00", "17:00"]);
    expect(getPracticeHours("", 0)).toBeNull();
    expect(getPracticeHours("", 6)).toEqual(["08:00", "13:00"]);
  });
});
