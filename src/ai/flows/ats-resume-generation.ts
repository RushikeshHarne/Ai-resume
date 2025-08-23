'use server';

/**
 * @fileOverview An ATS-friendly resume generation AI agent.
 *
 * - generateAtsResume - A function that handles the resume generation process.
 * - AtsResumeInput - The input type for the generateAtsResume function.
 * - AtsResumeOutput - The return type for the generateAtsResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AtsResumeInputSchema = z.object({
  skills: z.array(z.string()).describe('A list of skills.'),
  education: z.array(z.object({
    institution: z.string().describe('The name of the educational institution.'),
    degree: z.string().describe('The degree obtained.'),
    graduationDate: z.string().describe('The graduation date.'),
  })).describe('A list of education entries.'),
  projects: z.array(z.object({
    name: z.string().describe('The name of the project.'),
    description: z.string().describe('A description of the project.'),
  })).describe('A list of project entries.'),
  experience: z.array(z.object({
    title: z.string().describe('Job title'),
    company: z.string().describe('Company name'),
    startDate: z.string().describe('Start date'),
    endDate: z.string().describe('End date'),
    description: z.string().describe('Job description'),
  })).describe('A list of work experiences'),
  summary: z.string().describe('A professional summary of the candidate'),
  template: z.string().describe('The template for the resume in markdown format.'),
});
export type AtsResumeInput = z.infer<typeof AtsResumeInputSchema>;

const AtsResumeOutputSchema = z.object({
  resume: z.string().describe('The generated ATS-friendly resume.'),
});
export type AtsResumeOutput = z.infer<typeof AtsResumeOutputSchema>;

export async function generateAtsResume(input: AtsResumeInput): Promise<AtsResumeOutput> {
  return atsResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'atsResumePrompt',
  input: {schema: AtsResumeInputSchema},
  output: {schema: AtsResumeOutputSchema},
  prompt: `You are an expert resume writer, specializing in creating ATS-friendly resumes.

  Using the provided information, generate a resume that is optimized for applicant tracking systems (ATS).
  Follow these guidelines:

  - Use a clean and simple format that is easily parsed by ATS software.
  - Avoid tables, columns, and graphics.
  - Use clear and concise language.
  - Focus on keywords and skills that are relevant to the job.

  Here is the candidate's information:

  Summary: {{{summary}}}

  Skills:
  {{#each skills}}
  - {{{this}}}
  {{/each}}

  Education:
  {{#each education}}
  - Institution: {{{institution}}}, Degree: {{{degree}}}, Graduation Date: {{{graduationDate}}}
  {{/each}}

  Projects:
  {{#each projects}}
  - Name: {{{name}}}, Description: {{{description}}}
  {{/each}}

  Experience:
  {{#each experience}}
  - Title: {{{title}}}, Company: {{{company}}}, Start Date: {{{startDate}}}, End Date: {{{endDate}}}, Description: {{{description}}}
  {{/each}}
  
  Template:
  {{{template}}}
  
  Return only the resume content. Do not include any intro or explanation text.`, 
});

const atsResumeFlow = ai.defineFlow(
  {
    name: 'atsResumeFlow',
    inputSchema: AtsResumeInputSchema,
    outputSchema: AtsResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
