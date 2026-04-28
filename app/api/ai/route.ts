import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// Cache singleton ZAI instance
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

// Default system prompt
const DEFAULT_SYSTEM = 'Eres el asistente de IA del juego School Tycoon. Generas contenido en español. Siempre respondes en formato JSON cuando se te pide. Eres creativo y generas datos realistas para profesores, estudiantes, eventos escolares y analisis de escuelas.';

/** Remove control characters that break JSON/string parsing */
function sanitize(str: string): string {
  return str
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ') // Remove control chars
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const zai = await getZAI();

    // Extract the effective system prompt
    let effectiveSystemPrompt = DEFAULT_SYSTEM;
    if (systemPrompt) {
      effectiveSystemPrompt = sanitize(systemPrompt);
    } else if (messages[0]?.role === 'system') {
      effectiveSystemPrompt = sanitize(messages[0].content);
    }

    // Build messages in z.ai format:
    // - System prompt goes FIRST with role: 'assistant'
    // - User messages use role: 'user'
    // - Previous AI responses use role: 'assistant'
    const zaiMessages: Array<{ role: 'assistant' | 'user'; content: string }> = [
      {
        role: 'assistant' as const,
        content: effectiveSystemPrompt,
      },
    ];

    // Add user and previous assistant messages (skip system messages)
    for (const m of messages) {
      if (m.role === 'system') continue;
      const cleanContent = sanitize(m.content);
      if (!cleanContent) continue; // skip empty messages
      if (m.role === 'user') {
        zaiMessages.push({ role: 'user' as const, content: cleanContent });
      } else if (m.role === 'assistant') {
        zaiMessages.push({ role: 'assistant' as const, content: cleanContent });
      }
    }

    // Don't send two consecutive assistant messages
    const finalMessages = zaiMessages.filter((m, i) => {
      if (i === 0) return true; // keep first (system)
      if (m.role === 'assistant' && zaiMessages[i - 1]?.role === 'assistant') return false;
      return true;
    });

    if (finalMessages.length < 2) {
      return NextResponse.json({ error: 'Not enough messages to process', choices: [] }, { status: 400 });
    }

    const completion = await zai.chat.completions.create({
      messages: finalMessages,
      thinking: { type: 'disabled' },
    });

    const response = completion.choices?.[0]?.message?.content || '';

    // Return in OpenAI-compatible format
    return NextResponse.json({
      choices: [{
        message: {
          role: 'assistant',
          content: response,
        },
        finish_reason: 'stop',
        index: 0,
      }],
      model: 'z-ai-web',
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    });
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: `AI error: ${error instanceof Error ? error.message : 'Unknown error'}`, choices: [] },
      { status: 500 }
    );
  }
}
