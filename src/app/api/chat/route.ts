import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid request: messages array required', { status: 400 });
    }

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not configured');
      return new Response('AI service not configured. Please add your OpenAI API key.', { status: 500 });
    }

    // Build system prompt with full context
    const systemPrompt = `You are Mull, an interactive reading companion. You help users deeply understand what they're reading.

${context?.articleTitle ? `📖 Article: "${context.articleTitle}"` : ''}
${context?.selectedText ? `\n🔍 User highlighted: "${context.selectedText}"` : ''}
${context?.previousContext ? `\n📝 Previous paragraphs for context:\n${context.previousContext}` : ''}
${context?.paragraphText ? `\n📌 Current paragraph: "${context.paragraphText}"` : ''}

## Your Style
- Be concise and direct — 2-3 sentences max unless they ask for more
- Use simple language, avoid jargon
- Ask ONE follow-up question to deepen understanding
- If they seem confused, offer to explain differently
- Use emoji sparingly for warmth 🙂

## Examples of good responses:
User: "Explain simply"
You: "This is saying [simple explanation]. Does that click, or want me to try a different angle?"

User: "Why is this important?"  
You: "It matters because [reason]. What made you curious about this part?"

Remember: You're having a conversation, not writing an essay. Keep it tight.`;

    const result = await generateText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages,
    });

    return new Response(result.text, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return new Response('Invalid API key. Please check your OpenAI configuration.', { status: 401 });
      }
      if (error.message.includes('rate limit')) {
        return new Response('Rate limit exceeded. Please try again in a moment.', { status: 429 });
      }
    }
    
    return new Response('Something went wrong. Please try again.', { status: 500 });
  }
}
