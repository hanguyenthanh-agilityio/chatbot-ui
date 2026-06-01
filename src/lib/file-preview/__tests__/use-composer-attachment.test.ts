import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FILE_PREVIEW_KIND } from "@/lib/file-preview";
import { useComposerAttachment } from "@/lib/file-preview/use-composer-attachment";

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
});
