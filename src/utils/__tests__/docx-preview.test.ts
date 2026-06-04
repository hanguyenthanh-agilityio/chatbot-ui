import { describe, expect, it, vi } from "vitest";
import { convertDocxFileToHtml } from "@/utils/docx-preview";

const convertToHtml = vi.fn();

vi.mock("mammoth", () => ({
  convertToHtml: (...args: unknown[]) => convertToHtml(...args),
}));

describe("convertDocxFileToHtml", () => {
  it("converts a DOCX file to HTML via mammoth", async () => {
    convertToHtml.mockResolvedValue({ value: "<p>Hello</p>" });

    const file = new File(["docx"], "notes.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    await expect(convertDocxFileToHtml(file)).resolves.toBe("<p>Hello</p>");
    expect(convertToHtml).toHaveBeenCalledWith({
      arrayBuffer: expect.any(ArrayBuffer),
    });
  });
});
