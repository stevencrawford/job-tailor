import { UserExperienceAttributes } from '../interfaces/user.interface';

export function getJobMatchAssistantMessage(userExperience: UserExperienceAttributes) {
  return `You are a recruitment assistant. Given the following job(s) details, rank them based on my compatibility and preferences.
My Experience:
${userExperience.responsibilities}
My skills:
${userExperience.skillsUsed}

Other preferences:
1. The job description needs to be in english and the expected language requirements can only be English
2. The job needs to be Fully Remote
`;
}

export const CATEGORIZE_ASSISTANT_MESSAGE = `You categorize job titles into category and level.`
export const SUMMARIZE_ASSISTANT_MESSAGE = `Given a complete job description, extract the relevant information. 
Each field has max length of 500 characters so summarize when necessary. With "technicalStack", "interviewProcess", and "applicationProcess" if the 
job does not mention it leave blank.`
