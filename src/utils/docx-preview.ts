import {
  DOCX_PREVIEW_BLOCK_MARGIN,
  DOCX_PREVIEW_MIN_FIT_SCALE,
  DOCX_PREVIEW_RENDER_OPTIONS,
  DOCX_PREVIEW_SECTION_PADDING,
  DOCX_PREVIEW_WRAPPER_PADDING,
} from "@/constants/docx-preview";

type DocxPreviewModule = typeof import("docx-preview");

const SCALE_HOST_CLASS = "docx-preview-scale-host";

const TABLE_TAGS = new Set([
  "TABLE",
  "THEAD",
  "TBODY",
  "TFOOT",
  "TR",
  "TD",
  "TH",
  "COL",
  "COLGROUP",
]);

let docxPreviewModule: DocxPreviewModule | null = null;

async function loadDocxPreview() {
  if (!docxPreviewModule) {
    docxPreviewModule = await import("docx-preview");
  }
  return docxPreviewModule;
}

function ensureScaleHost(wrapper: HTMLElement) {
  const parent = wrapper.parentElement;
  if (parent?.classList.contains(SCALE_HOST_CLASS)) return parent;

  const host = document.createElement("div");
  host.className = SCALE_HOST_CLASS;
  wrapper.replaceWith(host);
  host.appendChild(wrapper);
  return host;
}

function isInsideTable(el: Element) {
  return el.closest("table") != null;
}

/** Constrain width without stripping Word paragraph / list indentation. */
function applyColumnWrapStyles(root: HTMLElement, columnWidth: number) {
  root.style.boxSizing = "border-box";
  root.style.marginLeft = "0";
  root.style.marginRight = "0";
  root.style.minWidth = "0";
  root.style.width = "auto";
  root.style.maxWidth = "none";

  root.querySelectorAll<HTMLElement>("*").forEach((el) => {
    el.style.boxSizing = "border-box";

    if (TABLE_TAGS.has(el.tagName) || isInsideTable(el)) {
      return;
    }

    el.style.maxWidth = "100%";
    el.style.overflowWrap = "anywhere";

    const widthPx = parseFloat(el.style.width);
    if (!Number.isNaN(widthPx) && widthPx > columnWidth) {
      el.style.width = "100%";
    }
  });

  root.querySelectorAll<HTMLElement>("section").forEach((el) => {
    el.style.setProperty("padding", DOCX_PREVIEW_SECTION_PADDING, "important");
    el.style.setProperty("margin", DOCX_PREVIEW_BLOCK_MARGIN, "important");
  });

  root.querySelectorAll<HTMLTableElement>("table").forEach((table) => {
    table.style.maxWidth = "100%";
    table.style.width = "auto";
    table.style.tableLayout = "auto";
  });
}

/**
 * Fit any DOCX preview to column 3: preserve layout, then scale down if too wide.
 */
export function fitDocxPreviewToColumn(container: HTMLElement) {
  container.scrollLeft = 0;
  container.scrollTop = 0;
  container.style.overflowX = "hidden";

  const wrapper = container.querySelector<HTMLElement>(".docx-preview-wrapper");
  if (!wrapper) return;

  const host = ensureScaleHost(wrapper);
  const columnWidth = container.clientWidth;
  if (columnWidth <= 0) return;

  wrapper.style.transform = "";
  wrapper.style.transformOrigin = "";
  wrapper.style.margin = "0";
  wrapper.style.padding = DOCX_PREVIEW_WRAPPER_PADDING;
  host.style.width = "100%";
  host.style.overflow = "hidden";

  applyColumnWrapStyles(wrapper, columnWidth);

  const contentWidth = wrapper.scrollWidth;
  const contentHeight = wrapper.offsetHeight;

  if (contentWidth > columnWidth) {
    const scale = Math.max(
      DOCX_PREVIEW_MIN_FIT_SCALE,
      columnWidth / contentWidth,
    );
    wrapper.style.transform = `scale(${scale})`;
    wrapper.style.transformOrigin = "top left";
    wrapper.style.width = `${contentWidth}px`;
    host.style.height = `${contentHeight * scale}px`;
  } else {
    wrapper.style.width = "100%";
    host.style.height = `${contentHeight}px`;
  }
}

/** Render a local DOCX into DOM nodes (client-only; uses docx-preview). */
export async function renderDocxFilePreview(
  file: File,
  bodyContainer: HTMLElement,
  styleContainer: HTMLElement,
) {
  const { renderAsync } = await loadDocxPreview();
  bodyContainer.replaceChildren();
  styleContainer.replaceChildren();

  const data = await file.arrayBuffer();
  await renderAsync(data, bodyContainer, styleContainer, DOCX_PREVIEW_RENDER_OPTIONS);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => fitDocxPreviewToColumn(bodyContainer));
  });
}
