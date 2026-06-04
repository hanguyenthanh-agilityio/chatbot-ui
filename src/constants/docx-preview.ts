/** Smallest scale when squeezing wide DOCX into column 3. */
export const DOCX_PREVIEW_MIN_FIT_SCALE = 0.3;

/** Compact padding inside the preview column (overrides docx-preview default ~96px). */
export const DOCX_PREVIEW_WRAPPER_PADDING = "4px 3px";
export const DOCX_PREVIEW_SECTION_PADDING = "10px 8px";
export const DOCX_PREVIEW_BLOCK_MARGIN = "0 0 10px";

/** Options passed to docx-preview `renderAsync` (browser-only). */
export const DOCX_PREVIEW_RENDER_OPTIONS = {
  className: "docx-preview",
  inWrapper: true,
  ignoreWidth: true,
  ignoreHeight: true,
  breakPages: false,
  renderHeaders: true,
  renderFooters: true,
  /** Improves tab stops / some paragraph alignment from Word. */
  experimental: true,
} as const;
