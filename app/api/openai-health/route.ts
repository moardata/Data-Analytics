// app/api/openai-health/route.ts
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const key = (process.env.OPENAI_API_KEY ?? "").trim();
  
  if (!key || !key.startsWith("sk-")) {
    return new Response("Missing/invalid OPENAI_API_KEY", { status: 500 });
  }
  
  try {
    const openai = new OpenAI({ apiKey: key });
    // Lightweight request to test the key
    const models = await openai.models.list({ limit: 1 });
    return new Response("OK", { status: 200 });
  } catch (e: any) {
    return new Response(`OpenAI check failed: ${e?.status || ""} ${e?.message || e}`, { status: 500 });
  }
}
