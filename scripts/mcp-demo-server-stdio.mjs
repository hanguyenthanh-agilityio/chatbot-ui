#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as z from "zod/v4";

const WEATHER_CONDITIONS = ["sunny", "cloudy", "rainy", "windy", "foggy"];

function seededNumber(input, min, max) {
  const seed = [...input].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return min + (seed % (max - min + 1));
}

function toFahrenheit(celsius) {
  return Number(((celsius * 9) / 5 + 32).toFixed(1));
}

const server = new McpServer({
  name: "ai-sdk-demo-mcp",
  version: "1.0.0",
});

server.registerTool(
  "mcp_get_weather",
  {
    description:
      "Return deterministic demo weather by city (for MCP mode testing).",
    inputSchema: {
      city: z.string().min(1).describe("City name"),
      unit: z.enum(["C", "F"]).default("C"),
    },
  },
  async ({ city, unit = "C" }) => {
    const condition =
      WEATHER_CONDITIONS[seededNumber(city, 0, WEATHER_CONDITIONS.length - 1)];
    const temperatureC = seededNumber(city, 16, 34);
    const temperature = unit === "F" ? toFahrenheit(temperatureC) : temperatureC;

    return {
      content: [
        {
          type: "text",
          text: `Demo MCP weather for ${city}: ${temperature}°${unit}, ${condition}.`,
        },
      ],
      structuredContent: {
        city,
        condition,
        unit,
        temperature,
      },
    };
  },
);

server.registerTool(
  "mcp_trip_checklist",
  {
    description: "Create a short trip checklist for a destination.",
    inputSchema: {
      destination: z.string().min(1),
      tripType: z.enum(["work", "vacation"]).default("vacation"),
      days: z.number().int().min(1).max(30).default(3),
    },
  },
  async ({ destination, tripType = "vacation", days = 3 }) => {
    const baseChecklist = [
      "Passport/ID",
      "Phone charger",
      "Backup payment method",
      "Medication (if needed)",
    ];

    const typeSpecific = tripType === "work"
      ? ["Laptop + charger", "Meeting agenda", "Business attire"]
      : ["Comfortable shoes", "Casual outfit", "Camera/phone storage check"];

    const checklist = [...baseChecklist, ...typeSpecific].slice(
      0,
      Math.min(8, days + 4),
    );

    return {
      content: [
        {
          type: "text",
          text: `Demo MCP checklist for ${destination} (${tripType}, ${days} days):\n- ${checklist.join("\n- ")}`,
        },
      ],
      structuredContent: {
        destination,
        tripType,
        days,
        checklist,
      },
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);

console.error("[mcp-demo-stdio] server is running.");
