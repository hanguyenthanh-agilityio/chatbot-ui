import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DOCX_PREVIEW_MIN_FIT_SCALE,
  DOCX_PREVIEW_RENDER_OPTIONS,
  DOCX_PREVIEW_SECTION_PADDING,
} from "@/constants/docx-preview";
import {
  fitDocxPreviewToColumn,
  renderDocxFilePreview,
} from "@/utils/docx-preview";

const renderAsync = vi.fn();

vi.mock("docx-preview", () => ({
  renderAsync: (...args: unknown[]) => renderAsync(...args),
}));

function mountPreview(columnWidth: number, contentWidth: number) {
  const container = document.createElement("div");
  container.style.width = `${columnWidth}px`;
  Object.defineProperty(container, "clientWidth", {
    configurable: true,
    value: columnWidth,
  });
  document.body.appendChild(container);

  const wrapper = document.createElement("div");
  wrapper.className = "docx-preview-wrapper";
  const section = document.createElement("section");
  section.className = "docx-preview";
  const block = document.createElement("div");
  block.style.width = `${contentWidth}px`;
  block.style.height = "80px";
  block.textContent = "DOCX";
  section.appendChild(block);
  wrapper.appendChild(section);
  container.appendChild(wrapper);

  Object.defineProperty(wrapper, "scrollWidth", {
    configurable: true,
    value: contentWidth,
  });
  Object.defineProperty(wrapper, "offsetHeight", {
    configurable: true,
    value: 80,
  });

  return { container, wrapper, section };
}

describe("fitDocxPreviewToColumn", () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it("does not scale when content fits the column", () => {
    const { container, wrapper } = mountPreview(320, 280);

    fitDocxPreviewToColumn(container);

    expect(wrapper.style.transform).toBe("");
    const host = container.querySelector<HTMLElement>(".docx-preview-scale-host");
    expect(host?.style.height).toBe("80px");
  });

  it("scales down when content is wider than the column", () => {
    const { container, wrapper } = mountPreview(200, 500);

    fitDocxPreviewToColumn(container);

    const host = container.querySelector<HTMLElement>(".docx-preview-scale-host");
    expect(host).not.toBeNull();
    expect(wrapper.style.transform).toContain("scale");
    const scale = parseFloat(wrapper.style.transform.replace(/[^0-9.]/g, ""));
    expect(scale).toBeGreaterThan(0);
    expect(scale).toBeLessThanOrEqual(1);
  });

  it("never scales below DOCX_PREVIEW_MIN_FIT_SCALE", () => {
    const { container, wrapper } = mountPreview(100, 2000);

    fitDocxPreviewToColumn(container);

    const scale = parseFloat(wrapper.style.transform.match(/scale\(([^)]+)\)/)?.[1] ?? "1");
    expect(scale).toBe(DOCX_PREVIEW_MIN_FIT_SCALE);
  });

  it("applies compact section padding from constants", () => {
    const { container, section } = mountPreview(320, 280);

    fitDocxPreviewToColumn(container);

    expect(section.style.getPropertyValue("padding")).toBe(
      DOCX_PREVIEW_SECTION_PADDING,
    );
    expect(section.style.getPropertyValue("margin")).toContain("10px");
  });
});

describe("renderDocxFilePreview", () => {
  beforeEach(() => {
    renderAsync.mockReset();
    renderAsync.mockResolvedValue(undefined);
    vi.stubGlobal(
      "requestAnimationFrame",
      (cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders via docx-preview into body and style containers", async () => {
    const body = document.createElement("div");
    const style = document.createElement("div");
    const file = new File(["docx"], "notes.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    await renderDocxFilePreview(file, body, style);

    expect(renderAsync).toHaveBeenCalledWith(
      expect.any(ArrayBuffer),
      body,
      style,
      DOCX_PREVIEW_RENDER_OPTIONS,
    );
  });
});
