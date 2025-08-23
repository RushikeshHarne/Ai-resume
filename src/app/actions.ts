"use server";

import { generateAtsResume, AtsResumeInput } from "@/ai/flows/ats-resume-generation";
import { suggestJobRoles, JobRoleSuggestionInput } from "@/ai/flows/job-role-suggestion";

export async function handleGenerateResume(input: AtsResumeInput) {
  try {
    const result = await generateAtsResume(input);
    return { success: true, resume: result.resume };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to generate resume." };
  }
}

export async function handleSuggestJobRoles(input: JobRoleSuggestionInput) {
    try {
        const result = await suggestJobRoles(input);
        return { success: true, ...result };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to suggest job roles." };
    }
}
