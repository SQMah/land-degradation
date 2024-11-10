import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const openai = createOpenAI({
    apiKey: process.env.OpenAI_API_KEY,
    compatibility: "strict", // strict mode, enable when using the OpenAI API
  });
  const { messages, headers } = await req.json();
  const result = await streamText({
    model: openai("gpt-4o-mini"),
    system: "You are a helpful assistant.",
    messages,
  });

  return result.toDataStreamResponse();
}
