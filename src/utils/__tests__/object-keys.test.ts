import { describe, expect, it } from "vitest";

import { objectKeys } from "@/utils/object-keys";

describe("objectKeys", () => {
  it("returns typed keys from an object map", () => {
    const variants = { a: "one", b: "two" } as const;
    expect(objectKeys(variants)).toEqual(["a", "b"]);
  });
});
