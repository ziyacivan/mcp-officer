import OpenAI from "openai";
import { config } from "./config";

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

export function getOfficerProfile(badgeNumber: number) {
  return {
    name: "Det. Frank Serpico",
    department: "LAPD",
    badgeNumber,
    role: "Interrogation Specialist",
    activeCases: 3,
    rank: "Lieutenant",
    phone: "+12137654321",
    email: "frank.serpico@lspd.gov",
    address: "123 Main St, Los Santos 90038",
    image: "https://via.placeholder.com/150",
  };
}

export async function generateInterrogationResponse(
  suspectName: string,
  pressureLevel: number,
  crime?: string,
  evidence?: string[]
) {
  const prompt = `
    You are an experienced police officer/detective. You are currently interrogating a suspect.
    Suspect's name: ${suspectName}
    Pressure level: ${pressureLevel}/100
    ${crime ? `Crime committed: ${crime}` : ""}
    ${evidence ? `Evidence we have: ${evidence.join(", ")}` : ""}

    How will you approach the suspect based on the pressure level?
    What interrogation strategy will you follow to get a confession from the suspect?
    
    Please write only the words you will say to the suspect.
    Your response must be in English and in a single paragraph.
    The response should be professional, realistic, and appropriate for the pressure level.
  `;

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: config.openai.model,
    max_tokens: config.openai.maxTokens,
    temperature: config.openai.temperature,
  });

  const response = completion.choices[0].message.content;

  return {
    statement: response,
    pressureLevel,
    timestamp: new Date().toISOString(),
    aiModel: config.openai.model,
  };
}

export async function generateSuspectResponse(
  suspectName: string,
  officerStatement: string,
  guilt: number, // 0-100, suspect's level of guilt
  personality: string, // e.g.: "angry", "calm", "fearful", "confident"
  previousResponses?: string[] // context for previous responses
) {
  const prompt = `
    You are a suspect named ${suspectName}. Your personality trait: ${personality}.
    Guilt level: ${guilt}/100 (this information is only to determine your response style, don't directly confess to the crime!)
    
    The police officer said to you: "${officerStatement}"
    
    ${
      previousResponses
        ? `Previous conversations:\n${previousResponses.join("\n")}`
        : ""
    }

    How will you respond? Give a realistic response that fits your character and the situation.
    The response should be a single paragraph and contain only the suspect's words.
  `;

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are a suspect being interrogated. Your responses should be realistic and fit your character.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: config.openai.model,
    max_tokens: config.openai.maxTokens,
    temperature: config.openai.temperature,
  });

  return {
    statement: completion.choices[0].message.content,
    suspectName,
    personality,
    timestamp: new Date().toISOString(),
    aiModel: config.openai.model,
  };
}
