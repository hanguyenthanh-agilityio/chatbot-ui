import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useComposerAttachment } from "@/hooks/use-composer-attachment";
import { FILE_PREVIEW_KIND } from "@/types/file-attachment";

describe("useComposerAttachment", () => {
  it("stores attachment metadata without opening preview", () => {
    const { result } = renderHook(() => useComposerAttachment());

    act(() => {
      result.current.attachFile(
        new File(["x"], "policy.pdf", { type: "application/pdf" }),
      );
    });

    expect(result.current.attachedFile).toMatchObject({
      name: "policy.pdf",
      kind: FILE_PREVIEW_KIND.PDF,
    });

    act(() => {
      result.current.clearAttachment();
    });

    expect(result.current.attachedFile).toBeNull();
  });

  it("ignores unsupported file types", () => {
    const { result } = renderHook(() => useComposerAttachment());

    act(() => {
      result.current.attachFile(new File(["x"], "archive.zip"));
    });

    expect(result.current.attachedFile).toBeNull();
  });
});
