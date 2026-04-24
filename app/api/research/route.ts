import { generateObject, gateway } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return new Response('Topic is required', { status: 400 });
    }

    const { object } = await generateObject({
      model: gateway('gpt-4o-mini'),
      schema: z.object({
        facts: z.array(z.string()).describe('A list of 5-8 verified facts about the topic. Make them detailed but concise.'),
      }),
      prompt: `You are an expert research agent. Conduct a deep dive into the following topic and provide key, verified facts that would be crucial for a video script. 
      
      Topic: ${topic}
      
      Focus on objective reality and interesting details. Avoid fluff. Provide 5 to 8 facts.`,
    });

    return Response.json(object);
  } catch (error) {
    console.error('Research error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
