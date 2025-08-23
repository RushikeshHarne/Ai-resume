'use server';

/**
 * @fileOverview A chatbot flow for assisting with resume building.
 *
 * - chat - A function that handles the chatbot conversation.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  query: z.string().describe('The user\'s query to the chatbot.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  reply: z.string().describe('The chatbot\'s reply to the user.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  prompt: `You are a friendly and helpful resume assistant chatbot. 
  Your goal is to provide concise and actionable advice to users building their resume.
  Keep your answers short and to the point.

  User query: {{{query}}}
  `,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
