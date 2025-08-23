'use server';

/**
 * @fileOverview AI-powered job role suggestion flow based on user profile.
 *
 * - suggestJobRoles - A function that suggests relevant job roles and skills.
 * - JobRoleSuggestionInput - The input type for the suggestJobRoles function.
 * - JobRoleSuggestionOutput - The return type for the suggestJobRoles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const JobRoleSuggestionInputSchema = z.object({
  userProfile: z
    .string()
    .describe("The user's profile information, including skills, education, and experience."),
});
export type JobRoleSuggestionInput = z.infer<typeof JobRoleSuggestionInputSchema>;

const JobRoleSuggestionOutputSchema = z.object({
  jobRoles: z.array(z.string()).describe('A list of suggested job roles.'),
  skillsToHighlight: z.array(z.string()).describe('A list of skills to highlight based on the job roles.'),
});
export type JobRoleSuggestionOutput = z.infer<typeof JobRoleSuggestionOutputSchema>;

export async function suggestJobRoles(input: JobRoleSuggestionInput): Promise<JobRoleSuggestionOutput> {
  return jobRoleSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'jobRoleSuggestionPrompt',
  input: {schema: JobRoleSuggestionInputSchema},
  output: {schema: JobRoleSuggestionOutputSchema},
  prompt: `You are an AI career advisor specializing in resume optimization and job role suggestions.

  Based on the user's profile, suggest relevant job roles and skills they should highlight in their resume to increase their chances of getting an interview.

  User Profile: {{{userProfile}}}

  Format your response as a JSON object with 'jobRoles' and 'skillsToHighlight' keys.
  `, 
});

const jobRoleSuggestionFlow = ai.defineFlow(
  {
    name: 'jobRoleSuggestionFlow',
    inputSchema: JobRoleSuggestionInputSchema,
    outputSchema: JobRoleSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
