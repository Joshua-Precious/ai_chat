import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req) {
  try {
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPEN_API_KEY,
    });
    const data = await req.json();
    const userMessage = data.message || "Hello";
    const conversationHistory = data.history || [];
    const botName = data.botName || "AI Assistant";

    const chatCompletion = await openai.chat.completions.create({
      model: "meta-llama/llama-3.1-8b-instruct:free",
      messages: [
        { role: "system", content: `You are an AI assistant named ${botName}. Please incorporate your name naturally into your responses when appropriate.` },
        ...conversationHistory,
        { role: "user", content: userMessage }
      ],
      stream: true,
      stop: null
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of chatCompletion) {
            const content = chunk.choices[0].delta?.content;
            if (content) {
              const text = encoder.encode(content);
              controller.enqueue(text);
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream);
  } catch (error) {
    console.error("Error in POST route:", error);
    return NextResponse.json({ error: "An error occurred while processing your request." }, { status: 500 });
  }
}