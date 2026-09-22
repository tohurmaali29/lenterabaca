import { describe, expect, it } from "vitest";

import { cn } from "@/lib/cn";

describe("cn", () => {
  it("menggabungkan className", () => {
    expect(cn("px-2", "text-ink-900")).toBe("px-2 text-ink-900");
  });

  it("utility yang belakangan menang saat konflik", () => {
    expect(cn("h-10", "h-12")).toBe("h-12");
  });

  it("mengabaikan nilai falsy", () => {
    expect(cn("px-2", false && "hidden", undefined, null)).toBe("px-2");
  });
});
