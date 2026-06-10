import {
  cleanup,
  createEvent,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FormEvent } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ChatComposer,
  type ChatComposerProps,
} from "@/components/chat/composer";
import { CHAT_COMPOSER_COPY, QUICK_ACTIONS_BY_ROLE } from "@/constants/chat";
import {
  mockChatComposerProps,
  MOCK_COMPOSER_TOOLTIP,
} from "@/mocks/chat-composer";
import { MOCK_COMPOSER_ATTACHMENT } from "@/mocks/file-attachment";
import { FILE_PREVIEW_COPY } from "@/constants/file-attachment";

const { ariaLabel, defaultHelperText, sendButtonLabel } = CHAT_COMPOSER_COPY;

const readyToSend = {
  isProviderReady: true,
  canSend: true,
} as const satisfies Partial<ChatComposerProps>;

const notReadyWithTooltip = {
  isProviderReady: false,
  inputTooltip: MOCK_COMPOSER_TOOLTIP,
} as const satisfies Partial<ChatComposerProps>;

function renderComposer(overrides: Partial<ChatComposerProps> = {}) {
  return render(<ChatComposer {...mockChatComposerProps(overrides)} />);
}

function getTextarea() {
  return screen.getByRole("textbox", { name: ariaLabel });
}

function getSendButton() {
  return screen.getByRole("button", { name: sendButtonLabel });
}

function getInputRow() {
  const row = getTextarea().parentElement;
  if (!row) throw new Error("input row not found");
  return row;
}

function getTooltipWrapper() {
  const wrapper = getTextarea().closest("form")?.parentElement;
  if (!wrapper) throw new Error("tooltip wrapper not found");
  return wrapper;
}

function mockSubmitHandler() {
  return vi.fn((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  });
}

function expectTooltipHidden() {
  expect(screen.queryByText(MOCK_COMPOSER_TOOLTIP)).not.toBeInTheDocument();
}

function expectTooltipVisible() {
  expect(screen.getByText(MOCK_COMPOSER_TOOLTIP)).toBeInTheDocument();
}

describe("ChatComposer", () => {
  afterEach(cleanup);

  describe("snapshots", () => {
    it.each([
      ["default", {}],
      ["ready", { input: "Hello", canSend: true }],
      ["loading", { input: "Hello", canSend: true, isLoading: true }],
      ["provider-not-ready", notReadyWithTooltip],
      [
        "with-error",
        {
          errorMessage: "Network error",
          canSend: false,
          isProviderReady: true,
        },
      ],
      ["custom-helper", { helperText: "Custom helper copy", canSend: false }],
      [
        "with-file-attachment",
        {
          attachmentMenu: { onFileSelected: () => {} },
          attachedFile: MOCK_COMPOSER_ATTACHMENT,
          onRemoveAttachedFile: () => {},
          ...readyToSend,
        },
      ],
    ] as const)("matches snapshot (%s)", (_name, overrides) => {
      const { container } = renderComposer(overrides);
      expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
    });
  });

  describe("input and submit", () => {
    it("calls onInputChange when typing", async () => {
      const user = userEvent.setup();
      const onInputChange = vi.fn();
      renderComposer({ onInputChange, ...readyToSend });
      await user.type(getTextarea(), "Hi");
      expect(onInputChange).toHaveBeenCalled();
    });

    it("calls onSubmitAction when the form is submitted", async () => {
      const user = userEvent.setup();
      const onSubmitAction = mockSubmitHandler();
      renderComposer({
        input: "Send this",
        onSubmitAction,
        ...readyToSend,
      });
      await user.click(getSendButton());
      expect(onSubmitAction).toHaveBeenCalledTimes(1);
    });

    it("submits on Enter when canSend is true", async () => {
      const user = userEvent.setup();
      const onSubmitAction = mockSubmitHandler();
      renderComposer({ input: "Line", onSubmitAction, ...readyToSend });
      await user.click(getTextarea());
      await user.keyboard("{Enter}");
      expect(onSubmitAction).toHaveBeenCalledTimes(1);
    });

    it("does not submit on Shift+Enter", async () => {
      const user = userEvent.setup();
      const onSubmitAction = mockSubmitHandler();
      renderComposer({ input: "", onSubmitAction, ...readyToSend });
      await user.click(getTextarea());
      await user.keyboard("{Shift>}{Enter}{/Shift}");
      expect(onSubmitAction).not.toHaveBeenCalled();
    });

    it("does not submit on Enter when canSend is false", () => {
      const onSubmitAction = mockSubmitHandler();
      renderComposer({
        input: "Hello",
        onSubmitAction,
        isProviderReady: true,
        canSend: false,
      });
      fireEvent.keyDown(getTextarea(), { key: "Enter", code: "Enter" });
      expect(onSubmitAction).not.toHaveBeenCalled();
    });

    it("does not submit on Enter while loading", () => {
      const onSubmitAction = mockSubmitHandler();
      renderComposer({
        input: "Hello",
        onSubmitAction,
        isProviderReady: true,
        canSend: true,
        isLoading: true,
      });
      fireEvent.keyDown(getTextarea(), { key: "Enter", code: "Enter" });
      expect(onSubmitAction).not.toHaveBeenCalled();
    });

    it("does not submit on Enter during IME composition", () => {
      const onSubmitAction = mockSubmitHandler();
      renderComposer({ input: "Hello", onSubmitAction, ...readyToSend });
      const textarea = getTextarea();
      const event = createEvent.keyDown(textarea, { key: "Enter", code: "Enter" });
      Object.defineProperty(event, "isComposing", { value: true });
      fireEvent(textarea, event);
      expect(onSubmitAction).not.toHaveBeenCalled();
    });

    it("does not submit on Enter when IME keyCode is 229", () => {
      const onSubmitAction = mockSubmitHandler();
      renderComposer({ input: "Hello", onSubmitAction, ...readyToSend });
      fireEvent.keyDown(getTextarea(), {
        key: "Enter",
        code: "Enter",
        keyCode: 229,
      });
      expect(onSubmitAction).not.toHaveBeenCalled();
    });
  });

  describe("textarea layout", () => {
    it("aligns controls to center for a single-line input", () => {
      renderComposer({ input: "Hello", ...readyToSend });
      expect(getInputRow()).toHaveClass("items-center");
      expect(getInputRow()).not.toHaveClass("items-end");
    });

    it("aligns controls to end when input has a newline", () => {
      renderComposer({ input: "Line one\nLine two", ...readyToSend });
      expect(getInputRow()).toHaveClass("items-end");
      expect(getInputRow()).not.toHaveClass("items-center");
    });

    it("observes the textarea with ResizeObserver", () => {
      const observe = vi.fn();
      const disconnect = vi.fn();
      class MockResizeObserver {
        observe = observe;
        disconnect = disconnect;
      }
      vi.stubGlobal("ResizeObserver", MockResizeObserver);

      try {
        const { unmount } = renderComposer({ input: "Hi", ...readyToSend });
        expect(observe).toHaveBeenCalledWith(getTextarea());
        unmount();
        expect(disconnect).toHaveBeenCalled();
      } finally {
        vi.unstubAllGlobals();
      }
    });
  });

  describe("display", () => {
    it("disables the textarea when the provider is not ready", () => {
      renderComposer({ isProviderReady: false });
      expect(getTextarea()).toBeDisabled();
    });

    it("shows default helper text when helperText is omitted", () => {
      renderComposer();
      expect(screen.getByText(defaultHelperText)).toBeInTheDocument();
    });

    it("renders error message when provided", () => {
      const errorMessage = "Something failed";
      renderComposer({ errorMessage });
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe("provider-not-ready tooltip", () => {
    it("does not show tooltip before interaction", () => {
      renderComposer(notReadyWithTooltip);
      expectTooltipHidden();
    });

    it("hides tooltip on mouse leave", () => {
      renderComposer(notReadyWithTooltip);
      const wrapper = getTooltipWrapper();
      fireEvent.mouseEnter(wrapper);
      expectTooltipVisible();
      fireEvent.mouseLeave(wrapper);
      expectTooltipHidden();
    });

    it("shows tooltip on click when provider is not ready", async () => {
      const user = userEvent.setup();
      renderComposer(notReadyWithTooltip);
      await user.click(getTooltipWrapper());
      expectTooltipVisible();
    });
  });

  describe("attachments", () => {
    const attachButton = () =>
      screen.getByRole("button", {
        name: FILE_PREVIEW_COPY.attachMenuAriaLabel,
      });

    const addFilesMenuItem = () =>
      screen.getByRole("menuitem", { name: FILE_PREVIEW_COPY.addFilesLabel });

    it("renders attachment menu and chip when configured", () => {
      renderComposer({
        attachmentMenu: { onFileSelected: vi.fn() },
        attachedFile: MOCK_COMPOSER_ATTACHMENT,
        onRemoveAttachedFile: vi.fn(),
        ...readyToSend,
      });

      expect(screen.getByText(MOCK_COMPOSER_ATTACHMENT.name)).toBeInTheDocument();
      expect(attachButton()).toBeInTheDocument();
    });

    it("clicks the hidden file input when Add files is chosen", async () => {
      const user = userEvent.setup();
      const clickSpy = vi.spyOn(HTMLInputElement.prototype, "click");

      renderComposer({
        attachmentMenu: { onFileSelected: vi.fn() },
        ...readyToSend,
      });

      await user.click(attachButton());
      await user.click(addFilesMenuItem());

      expect(clickSpy).toHaveBeenCalled();
      clickSpy.mockRestore();
    });
  });

  it("renders quick actions above the input when provided", () => {
    renderComposer({
      quickActions: QUICK_ACTIONS_BY_ROLE.user,
      onQuickActionSelect: vi.fn(),
    });

    for (const action of QUICK_ACTIONS_BY_ROLE.user) {
      expect(
        screen.getByRole("button", { name: action.label }),
      ).toBeInTheDocument();
    }
  });
});
