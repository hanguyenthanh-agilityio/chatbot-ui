/** Wrangler bindings — extend when adding resources in `wrangler.jsonc`. */
interface CloudflareEnv {
  OPENAI_VALIDATION: DurableObjectNamespace<
    import("./src/workers/openai-validation-do").OpenAIValidationDO
  >;
  OPENAI_BASE_URL?: string;
}
