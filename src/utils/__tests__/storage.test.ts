import { afterEach, describe, expect, it, vi } from "vitest";
import { local, session } from "@/utils/storage";

describe.each([
  ["local", local, window.localStorage],
  ["session", session, window.sessionStorage],
] as const)("storage.%s", (_label, accessor, storage) => {
  afterEach(() => {
    storage.clear();
    vi.restoreAllMocks();
  });

  it("writes and reads a value", () => {
    accessor.write("theme", "dark");
    expect(accessor.read("theme")).toBe("dark");
  });

  it("returns null for a missing key", () => {
    expect(accessor.read("missing")).toBeNull();
  });

  it("removes a key when value is null", () => {
    accessor.write("draft", "hello");
    accessor.write("draft", null);
    expect(accessor.read("draft")).toBeNull();
  });

  it("returns null when getItem throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    expect(accessor.read("theme")).toBeNull();
  });

  it("ignores setItem failures", () => {
    vi.spyOn(storage, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });

    expect(() => accessor.write("theme", "dark")).not.toThrow();
  });

  it("ignores removeItem failures", () => {
    storage.setItem("theme", "dark");
    vi.spyOn(storage, "removeItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    expect(() => accessor.write("theme", null)).not.toThrow();
  });
});

describe("storage without window", () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    vi.stubGlobal("window", originalWindow);
  });

  it("read returns null and write is a no-op", () => {
    vi.stubGlobal("window", undefined);

    expect(local.read("any")).toBeNull();
    expect(() => local.write("any", "value")).not.toThrow();
    expect(() => session.write("any", null)).not.toThrow();
  });
});
