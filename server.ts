import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import express from "express";
import { z } from "zod";
import {
  generateInterrogationResponse,
  generateSuspectResponse,
  getOfficerProfile,
} from "./helpers";

const server = new McpServer({
  name: "LSPD Interrogation Server",
  version: "1.0.0",
  description: "MCP server for LSPD interrogation procedures",
  transports: ["http"],
});

const app = express();

server.resource(
  "officer-profile",
  new ResourceTemplate("lapd://officers/{badgeNumber}", {
    list: undefined,
  }),
  async (uri, { badgeNumber }) => {
    const officer = await getOfficerProfile(Number(badgeNumber));
    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(officer, null, 2),
          mimeType: "application/json",
        },
      ],
    };
  }
);

server.resource(
  "conduct-interrogation",
  new ResourceTemplate("lapd://interrogations/{suspectId}", {
    list: undefined,
  }),
  async (uri, { suspectId }, body) => {
    const interrogationData = z
      .object({
        suspectName: z.string(),
        pressureLevel: z.number().min(0).max(100),
        crime: z.string().optional(),
        evidence: z.array(z.string()).optional(),
      })
      .parse(JSON.parse(body.toString()));

    const response = await generateInterrogationResponse(
      interrogationData.suspectName,
      interrogationData.pressureLevel,
      interrogationData.crime,
      interrogationData.evidence
    );

    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(response, null, 2),
          mimeType: "application/json",
        },
      ],
    };
  }
);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/interrogate", (req, res) => {
  const { suspectName, caseId, pressureLevel } = req.query;
  const response = generateInterrogationResponse(
    suspectName as string,
    Number(pressureLevel)
  );
  res.json(response);
});

app.get("/profile/:badgeNumber", (req, res) => {
  const { badgeNumber } = req.params;
  const officer = getOfficerProfile(Number(badgeNumber));
  res.json(officer);
});

app.post("/interrogations/:suspectId", express.json(), async (req, res) => {
  try {
    const interrogationData = z
      .object({
        suspectName: z.string(),
        pressureLevel: z.number().min(0).max(100),
        crime: z.string().optional(),
        evidence: z.array(z.string()).optional(),
      })
      .parse(req.body);

    const response = await generateInterrogationResponse(
      interrogationData.suspectName,
      interrogationData.pressureLevel,
      interrogationData.crime,
      interrogationData.evidence
    );

    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Geçersiz istek formatı",
        details: error.errors,
      });
    } else {
      res.status(500).json({
        error: "Sunucu hatası",
        message: error instanceof Error ? error.message : "Bilinmeyen hata",
      });
    }
  }
});

app.post(
  "/interrogations/:suspectId/respond",
  express.json(),
  async (req, res) => {
    try {
      const responseData = z
        .object({
          suspectName: z.string(),
          officerStatement: z.string(),
          guilt: z.number().min(0).max(100),
          personality: z.string(),
          previousResponses: z.array(z.string()).optional(),
        })
        .parse(req.body);

      const response = await generateSuspectResponse(
        responseData.suspectName,
        responseData.officerStatement,
        responseData.guilt,
        responseData.personality,
        responseData.previousResponses
      );

      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: "Geçersiz istek formatı",
          details: error.errors,
        });
      } else {
        res.status(500).json({
          error: "Sunucu hatası",
          message: error instanceof Error ? error.message : "Bilinmeyen hata",
        });
      }
    }
  }
);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
