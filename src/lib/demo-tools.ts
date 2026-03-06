import { tool } from "ai";
import { z } from "zod";

// Deterministic pseudo-random helper so demo outputs are stable per input.
function seededNumber(input: string, min: number, max: number): number {
  const seed = [...input].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return min + (seed % (max - min + 1));
}

const WEATHER_CONDITIONS = ["sunny", "cloudy", "rainy", "windy", "foggy"];
const DEMO_EXCHANGE_RATES: Record<string, number> = {
  EUR: 0.92,
  GBP: 0.79,
  JPY: 151.2,
  VND: 25500,
  SGD: 1.34,
};

export const weatherTool = tool({
  description:
    "Get weather details for a city. Returns a condition and temperature in Celsius.",
  inputSchema: z.object({
    city: z.string().describe("City name, e.g. San Francisco"),
  }),
  execute: async ({ city }) => {
    const condition = WEATHER_CONDITIONS[seededNumber(city, 0, WEATHER_CONDITIONS.length - 1)];
    const temperatureC = seededNumber(city, 16, 33);

    return {
      city,
      condition,
      temperatureC,
    };
  },
});

export const fxRateTool = tool({
  description:
    "Convert an amount in USD to another currency (EUR, GBP, JPY, VND, SGD).",
  inputSchema: z.object({
    amountUsd: z.number().min(0).describe("Amount in USD"),
    toCurrency: z.enum(["EUR", "GBP", "JPY", "VND", "SGD"]),
  }),
  execute: async ({ amountUsd, toCurrency }) => {
    const rate = DEMO_EXCHANGE_RATES[toCurrency];

    return {
      baseCurrency: "USD",
      targetCurrency: toCurrency,
      rate,
      convertedAmount: Number((amountUsd * rate).toFixed(2)),
    };
  },
});

export const cityTipsTool = tool({
  description:
    "Get practical city tips like transport and local highlights for travel planning.",
  inputSchema: z.object({
    city: z.string().describe("Destination city"),
  }),
  execute: async ({ city }) => ({
    city,
    transportTip: `Use local transit pass in ${city} for cheaper daily travel.`,
    localHighlight: `Try a neighborhood walking tour in ${city} near sunset.`,
  }),
});

// Client-side tool: no execute() so the UI can resolve it via onToolCall.
export const clientContextTool = {
  description:
    "Get browser context (locale and timezone) from the user device before final recommendation.",
  inputSchema: z.object({}),
};

export function getSingleToolSet() {
  return {
    getWeatherInformation: weatherTool,
  };
}

export function getMultiToolSet() {
  return {
    getWeatherInformation: weatherTool,
    convertUsdAmount: fxRateTool,
    getCityTips: cityTipsTool,
    getClientContext: clientContextTool,
  };
}

export function getAgentToolSet() {
  return {
    getWeatherInformation: weatherTool,
    convertUsdAmount: fxRateTool,
    getCityTips: cityTipsTool,
  };
}
