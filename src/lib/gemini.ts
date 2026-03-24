// Gemini AI provider — used for chatbot, assistant, and agents
import { GoogleGenerativeAI, type FunctionDeclaration, type Part } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/** Simple text generation */
export async function generateText(
  systemPrompt: string,
  userMessage: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: options?.temperature ?? 0.7,
      maxOutputTokens: options?.maxTokens ?? 1024,
    },
  });

  const result = await model.generateContent(userMessage);
  return result.response.text();
}

/** Chat with conversation history */
export async function chat(
  systemPrompt: string,
  messages: Array<{ role: "user" | "model"; content: string }>,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: options?.temperature ?? 0.7,
      maxOutputTokens: options?.maxTokens ?? 1024,
    },
  });

  const chatSession = model.startChat({
    history: messages.slice(0, -1).map(m => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
  });

  const lastMessage = messages[messages.length - 1];
  const result = await chatSession.sendMessage(lastMessage.content);
  return result.response.text();
}

/** Chat with function calling (tool use) */
export async function chatWithTools(
  systemPrompt: string,
  messages: Array<{ role: "user" | "model"; content: string }>,
  tools: FunctionDeclaration[],
  toolExecutor: (name: string, args: Record<string, unknown>) => Promise<string>,
  options?: { maxSteps?: number }
): Promise<{ reply: string; toolsUsed: string[] }> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: systemPrompt,
    tools: [{ functionDeclarations: tools }],
    generationConfig: {
      temperature: 0.5,
      maxOutputTokens: 2048,
    },
  });

  const chatSession = model.startChat({
    history: messages.slice(0, -1).map(m => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
  });

  const toolsUsed: string[] = [];
  const maxSteps = options?.maxSteps ?? 8;
  let lastMessage = messages[messages.length - 1].content;

  for (let step = 0; step < maxSteps; step++) {
    const result = step === 0
      ? await chatSession.sendMessage(lastMessage)
      : await chatSession.sendMessage(lastMessage as string | Part[]);

    const candidate = result.response.candidates?.[0];
    if (!candidate) break;

    // Check for function calls
    const functionCalls = candidate.content.parts.filter(p => p.functionCall);

    if (functionCalls.length === 0) {
      // No tool calls — return text response
      const text = candidate.content.parts.map(p => p.text || "").join("");
      return { reply: text, toolsUsed };
    }

    // Execute tool calls
    const functionResponses: Part[] = [];
    for (const part of functionCalls) {
      const fc = part.functionCall!;
      toolsUsed.push(fc.name);
      const toolResult = await toolExecutor(fc.name, (fc.args || {}) as Record<string, unknown>);
      functionResponses.push({
        functionResponse: {
          name: fc.name,
          response: { result: toolResult },
        },
      });
    }

    // Send tool results back — Gemini expects Part[] for function responses
    lastMessage = functionResponses as unknown as string;
  }

  return { reply: "I completed the requested actions.", toolsUsed };
}
