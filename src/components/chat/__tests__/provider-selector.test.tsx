import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProviderSelector } from "@/components/chat/provider-selector";
import { mockProvider } from "@/mocks/provider-selector";
import {
  PROVIDER_PANEL_COPY,
  PROVIDER_STATUS_COPY,
} from "@/constants/provider";

describe("ProviderSelector", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders provider label and description from PROVIDER_PANEL_COPY", () => {
    render(
      <ProviderSelector
        provider={mockProvider()}
        withContainer={false}
      />,
    );
    expect(screen.getByText(PROVIDER_PANEL_COPY.label)).toBeInTheDocument();
    expect(screen.getByText(PROVIDER_PANEL_COPY.description)).toBeInTheDocument();
  });

  it("shows OpenAI branch when isOpenAISelected is true (password + verify button)", () => {
    render(
      <ProviderSelector
        provider={mockProvider({
          isOpenAISelected: true,
          selectedProvider: "openai",
        })}
        withContainer={false}
      />,
    );
    expect(
      screen.getByPlaceholderText(PROVIDER_PANEL_COPY.openaiApiKeyPlaceholder),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: PROVIDER_PANEL_COPY.verifyOpenAIButtonLabel,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText(PROVIDER_PANEL_COPY.ollamaBaseUrlPlaceholder),
    ).not.toBeInTheDocument();
  });

  it("shows Ollama branch when isOpenAISelected is false", () => {
    render(
      <ProviderSelector
        provider={mockProvider({
          selectedProvider: "ollama",
          isOpenAISelected: false,
          providerStatus: PROVIDER_STATUS_COPY.ollamaDefault,
        })}
        withContainer={false}
      />,
    );
    expect(
      screen.getByPlaceholderText(PROVIDER_PANEL_COPY.ollamaBaseUrlPlaceholder),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: PROVIDER_PANEL_COPY.verifyOllamaButtonLabel,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText(PROVIDER_PANEL_COPY.openaiApiKeyPlaceholder),
    ).not.toBeInTheDocument();
  });

  it("calls updateOpenAIApiKeyInput when typing in the API key field", async () => {
    const user = userEvent.setup();
    const updateOpenAIApiKeyInput = vi.fn();
    render(
      <ProviderSelector
        provider={mockProvider({
          isOpenAISelected: true,
          updateOpenAIApiKeyInput,
        })}
        withContainer={false}
      />,
    );
    await user.type(
      screen.getByPlaceholderText(PROVIDER_PANEL_COPY.openaiApiKeyPlaceholder),
      "sk-test",
    );
    expect(updateOpenAIApiKeyInput).toHaveBeenCalled();
  });

  it("calls verifyOpenAIKey when the OpenAI verify button is clicked", async () => {
    const user = userEvent.setup();
    const verifyOpenAIKey = vi.fn().mockResolvedValue(undefined);
    render(
      <ProviderSelector
        provider={mockProvider({
          isOpenAISelected: true,
          verifyOpenAIKey,
        })}
        withContainer={false}
      />,
    );
    await user.click(
      screen.getByRole("button", {
        name: PROVIDER_PANEL_COPY.verifyOpenAIButtonLabel,
      }),
    );
    expect(verifyOpenAIKey).toHaveBeenCalledTimes(1);
  });

  it("calls verifyOllamaBaseUrl when the Ollama verify button is clicked", async () => {
    const user = userEvent.setup();
    const verifyOllamaBaseUrl = vi.fn().mockResolvedValue(undefined);
    render(
      <ProviderSelector
        provider={mockProvider({
          selectedProvider: "ollama",
          isOpenAISelected: false,
          verifyOllamaBaseUrl,
        })}
        withContainer={false}
      />,
    );
    await user.click(
      screen.getByRole("button", {
        name: PROVIDER_PANEL_COPY.verifyOllamaButtonLabel,
      }),
    );
    expect(verifyOllamaBaseUrl).toHaveBeenCalledTimes(1);
  });

  it("calls selectProvider when the user picks another provider", async () => {
    const user = userEvent.setup();
    const selectProvider = vi.fn();
    render(
      <ProviderSelector
        provider={mockProvider({
          selectProvider,
        })}
        withContainer={false}
      />,
    );
    await user.selectOptions(screen.getByRole("combobox"), "ollama");
    expect(selectProvider).toHaveBeenCalledWith("ollama");
  });

  it("wraps content in Card when withContainer is true (default)", () => {
    const { container } = render(
      <ProviderSelector provider={mockProvider()} />,
    );
    expect(container.querySelector(".rounded-2xl")).toBeInTheDocument();
  });

  it("does not wrap in Card when withContainer is false", () => {
    const { container } = render(
      <ProviderSelector
        provider={mockProvider()}
        withContainer={false}
      />,
    );
    const root = container.firstElementChild;
    expect(root?.className).toContain("flex");
    expect(root?.className).toContain("flex-col");
    expect(root?.querySelectorAll(".rounded-2xl").length).toBe(0);
  });

  it("disables the provider select when only one allowed provider", () => {
    render(
      <ProviderSelector
        provider={mockProvider({
          selectedProvider: "openai",
          isOpenAISelected: true,
        })}
        allowedProviders={["openai"]}
        withContainer={false}
      />,
    );
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("shows providerStatus in the status line", () => {
    const status = "Custom status line";
    render(
      <ProviderSelector
        provider={mockProvider({ providerStatus: status })}
        withContainer={false}
      />,
    );
    expect(screen.getByText(status)).toBeInTheDocument();
  });
});
