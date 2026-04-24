import { streamText, gateway } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { topic, currentScript, instruction, facts, tone, length } = await req.json();

    if (!currentScript || !instruction) {
      return new Response('Current script and revision instruction are required', { status: 400 });
    }

    const systemPrompt = `You are a professional video script editor. You have been given a previously generated video script and the user wants you to revise it based on their instruction.

RULES:
- Apply the user's revision instruction precisely.
- Maintain the same overall structure, tone (${tone}), and target length (${length} minutes) unless the instruction says otherwise.
- Keep all facts accurate — do NOT invent new facts. Only use the verified facts provided below.
- Return the COMPLETE revised script, not just the changed parts.
- Use clear headings for visuals and audio (e.g., **[Visual]**, **[Audio]**, **[Narrator]**).

Verified Facts:
${facts.map((f: string) => `- ${f}`).join('\n')}

CURRENT SCRIPT:
---
${currentScript}
---
`;

    const result = streamText({
      model: gateway('gpt-4o'),
      system: systemPrompt,
      prompt: `Revision instruction: "${instruction}"\n\nApply this revision to the script about "${topic}". Return the full revised script.`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Revision error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
