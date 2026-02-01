import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, context } = await req.json();

  // Build system prompt with article context
  const systemPrompt = `You are a helpful reading assistant. The user is reading an article and has questions about specific passages.

${context?.articleTitle ? `Article: "${context.articleTitle}"` : ''}
${context?.selectedText ? `\nThe user selected this text: "${context.selectedText}"` : ''}
${context?.paragraphText ? `\nFull paragraph context: "${context.paragraphText}"` : ''}

Guidelines:
- Be concise but thorough
- Use markdown formatting when helpful
- Reference the specific text when relevant
- If the user asks for explanation, break it down simply
- Suggest follow-up questions they might consider`;

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
