#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import * as z from "zod/v4";

const WEATHER_CONDITIONS = ["sunny", "cloudy", "rainy", "windy", "foggy"];
const HOST = process.env.MCP_DEMO_HOST || "127.0.0.1";
const PORT = Number(process.env.MCP_DEMO_PORT || 4001);

function seededNumber(input, min, max) {
  const seed = [...input].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return min + (seed % (max - min + 1));
}

function toFahrenheit(celsius) {
  return Number(((celsius * 9) / 5 + 32).toFixed(1));
}

function buildServer() {
  const server = new McpServer({
    name: "ai-sdk-demo-mcp-http",
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
      const condition = WEATHER_CONDITIONS[
        seededNumber(city, 0, WEATHER_CONDITIONS.length - 1)
      ];
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

  return server;
}

const app = createMcpExpressApp({ host: HOST });

app.post("/mcp", async (req, res) => {
  const server = buildServer();

  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);

    res.on("close", () => {
      void transport.close();
      void server.close();
    });
  } catch (error) {
    console.error("[mcp-demo-http] request error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});

app.get("/mcp", async (_req, res) => {
  res.writeHead(405).end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed.",
      },
      id: null,
    }),
  );
});

app.delete("/mcp", async (_req, res) => {
  res.writeHead(405).end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed.",
      },
      id: null,
    }),
  );
});

app.listen(PORT, HOST, (error) => {
  if (error) {
    console.error("[mcp-demo-http] failed to start:", error);
    process.exit(1);
  }

  console.log(`[mcp-demo-http] listening at http://${HOST}:${PORT}/mcp`);
});
