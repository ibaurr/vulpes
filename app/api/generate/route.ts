import { streamText, gateway } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { topic, facts, notes, tone, length } = await req.json();

    const systemPrompt = `You are a professional video script writer. Your job is to write a compelling script based *only* on the provided facts and notes. 
    Do not hallucinate or invent new facts. If the facts are insufficient, work with what you have.
    
    Guidelines:
    - Tone: ${tone}
    - Target length: ${length} minutes
    - Use clear headings for visuals and audio (e.g., **[Visual]**, **[Audio]**, **[Narrator]**).
    
    Verified Facts to include:
    ${facts.map((f: string) => `- ${f}`).join('\n')}
    
    Additional Notes from user:
    ${notes || 'None'}
    `;

    const result = streamText({
      model: gateway('openai:gpt-4o'),
      system: systemPrompt,
      prompt: `Write the video script for the topic: ${topic}`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Generation error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
