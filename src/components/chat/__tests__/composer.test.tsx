import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FormEvent } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ChatComposer } from "@/components/chat/composer";
import { CHAT_COMPOSER_COPY } from "@/constants/chat";
import {
  mockChatComposerProps,
  MOCK_COMPOSER_TOOLTIP,
} from "@/mocks/chat-composer";

describe("ChatComposer", () => {
  afterEach(() => {
    cleanup();
  });

  it.each([
    ["default", {}],
    ["ready", { input: "Hello", canSend: true }],
    ["loading", { input: "Hello", canSend: true, isLoading: true }],
    [
      "provider-not-ready",
      { isProviderReady: false, inputTooltip: MOCK_COMPOSER_TOOLTIP },
    ],
    [
      "with-error",
      { errorMessage: "Network error", canSend: false, isProviderReady: true },
    ],
    ["custom-helper", { helperText: "Custom helper copy", canSend: false }],
  ] as const)("matches snapshot (%s)", (_name, overrides) => {
    const { container } = render(
      <ChatComposer {...mockChatComposerProps(overrides)} />,
    );
    expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
  });

  it("calls onInputChange when typing", async () => {
    const user = userEvent.setup();
    const onInputChange = vi.fn();
    render(
      <ChatComposer
        {...mockChatComposerProps({ onInputChange, isProviderReady: true })}
      />,
    );
    await user.type(
      screen.getByRole("textbox", { name: CHAT_COMPOSER_COPY.ariaLabel }),
      "Hi",
    );
    expect(onInputChange).toHaveBeenCalled();
  });

  it("calls onSubmitAction when the form is submitted", async () => {
    const user = userEvent.setup();
    const onSubmitAction = vi.fn((event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    });
    render(
      <ChatComposer
        {...mockChatComposerProps({
          input: "Send this",
          canSend: true,
          isProviderReady: true,
          onSubmitAction,
        })}
      />,
    );
    await user.click(
      screen.getByRole("button", { name: CHAT_COMPOSER_COPY.sendButtonLabel }),
    );
    expect(onSubmitAction).toHaveBeenCalledTimes(1);
  });

  it("submits on Enter when canSend is true", async () => {
    const user = userEvent.setup();
    const onSubmitAction = vi.fn((event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    });
    render(
      <ChatComposer
        {...mockChatComposerProps({
          input: "Line",
          canSend: true,
          isProviderReady: true,
          onSubmitAction,
        })}
      />,
    );
    const textarea = screen.getByRole("textbox", {
      name: CHAT_COMPOSER_COPY.ariaLabel,
    });
    await user.click(textarea);
    await user.keyboard("{Enter}");
    expect(onSubmitAction).toHaveBeenCalledTimes(1);
  });

  it("does not submit on Shift+Enter", async () => {
    const user = userEvent.setup();
    const onSubmitAction = vi.fn((event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    });
    render(
      <ChatComposer
        {...mockChatComposerProps({
          input: "",
          canSend: true,
          isProviderReady: true,
          onSubmitAction,
        })}
      />,
    );
    const textarea = screen.getByRole("textbox", {
      name: CHAT_COMPOSER_COPY.ariaLabel,
    });
    await user.click(textarea);
    await user.keyboard("{Shift>}{Enter}{/Shift}");
    expect(onSubmitAction).not.toHaveBeenCalled();
  });

  it("disables the textarea when the provider is not ready", () => {
    render(
      <ChatComposer {...mockChatComposerProps({ isProviderReady: false })} />,
    );
    expect(
      screen.getByRole("textbox", { name: CHAT_COMPOSER_COPY.ariaLabel }),
    ).toBeDisabled();
  });

  it("shows default helper text when helperText is omitted", () => {
    render(<ChatComposer {...mockChatComposerProps()} />);
    expect(
      screen.getByText(CHAT_COMPOSER_COPY.defaultHelperText),
    ).toBeInTheDocument();
  });

  it("renders error message when provided", () => {
    const errorMessage = "Something failed";
    render(<ChatComposer {...mockChatComposerProps({ errorMessage })} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("shows stop button while loading and calls onStopAction", async () => {
    const user = userEvent.setup();
    const onStopAction = vi.fn();
    const onSubmitAction = vi.fn((event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    });

    render(
      <ChatComposer
        {...mockChatComposerProps({
          input: "Hello",
          canSend: true,
          isLoading: true,
          isProviderReady: true,
          onStopAction,
          onSubmitAction,
        })}
      />,
    );

    expect(
      screen.getByRole("button", { name: CHAT_COMPOSER_COPY.stopButtonLabel }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: CHAT_COMPOSER_COPY.sendButtonLabel }),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: CHAT_COMPOSER_COPY.stopButtonLabel }),
    );
    expect(onStopAction).toHaveBeenCalledTimes(1);
  });

  it("does not submit on Enter while loading", async () => {
    const user = userEvent.setup();
    const onSubmitAction = vi.fn((event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    });

    render(
      <ChatComposer
        {...mockChatComposerProps({
          input: "Hello",
          canSend: true,
          isLoading: true,
          isProviderReady: true,
          onSubmitAction,
        })}
      />,
    );

    const textarea = screen.getByRole("textbox", {
      name: CHAT_COMPOSER_COPY.ariaLabel,
    });
    await user.click(textarea);
    await user.keyboard("{Enter}");
    expect(onSubmitAction).not.toHaveBeenCalled();
  });
});
