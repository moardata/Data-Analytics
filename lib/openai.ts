// lib/openai.ts
import OpenAI from "openai";

const key = (process.env.OPENAI_API_KEY ?? "").trim();
if (!key || !key.startsWith("sk-")) {
  throw new Error("Missing or invalid OPENAI_API_KEY");
}

export const openai = new OpenAI({ apiKey: key });
