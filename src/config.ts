import dotenv from "dotenv";

dotenv.config();

export const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-3.5-turbo",
    maxTokens: 150,
    temperature: 0.7,
  },
};
