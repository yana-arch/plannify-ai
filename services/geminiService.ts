
import { GoogleGenAI, Type } from "@google/genai";
import type { ProjectInputData, ProjectPlan } from '../types';

const planSchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: 'A concise, AI-generated summary of the project.' },
    keyComponents: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'A list of the main functional or architectural components.'
    },
    recommendedTechStack: {
      type: Type.OBJECT,
      properties: {
        frontend: { type: Type.ARRAY, items: { type: Type.STRING } },
        backend: { type: Type.ARRAY, items: { type: Type.STRING } },
        database: { type: Type.ARRAY, items: { type: Type.STRING } },
        other: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      description: 'A refined and detailed technology stack recommendation.'
    },
    potentialChallenges: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Potential technical or business challenges.'
    },
    potentialOpportunities: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Potential opportunities for growth, expansion, or unique value propositions.'
    },
    detailedFeatures: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          targetUsers: { type: Type.ARRAY, items: { type: Type.STRING } },
          mainFunctions: { type: Type.ARRAY, items: { type: Type.STRING } },
          subFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
          preConditions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['name', 'description', 'targetUsers', 'mainFunctions', 'subFeatures', 'preConditions']
      },
      description: 'A detailed breakdown of each core requirement into a feature specification.'
    },
    developmentPlan: {
      type: Type.OBJECT,
      properties: {
        milestones: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['name', 'description', 'tasks']
          }
        }
      },
      description: 'A high-level development plan with milestones and associated tasks.'
    }
  },
  required: ['summary', 'keyComponents', 'recommendedTechStack', 'potentialChallenges', 'potentialOpportunities', 'detailedFeatures', 'developmentPlan']
};


const buildPrompt = (data: ProjectInputData): string => {
  return `
    You are an expert Software Architect and Project Planner AI. Your task is to analyze the following project details and generate a comprehensive, structured project plan.

    Project Details:
    - Project Name: ${data.projectName}
    - Short Description: ${data.shortDescription}
    - Business Goals: ${data.businessGoals}
    - Technical Goals: ${data.technicalGoals}
    - Target Users: ${data.targetUsers.join(', ')}
    - Number of Features: ${data.numberOfFeatures}
    - Estimated Scale: ${data.estimatedScale}
    - Timeline: ${data.timeline}
    - Core Requirements: 
      ${data.coreRequirements.map(req => `- ${req.description} (Priority: ${req.priority})`).join('\n      ')}
    - Anticipated Technology Stack:
      - Frontend: ${data.techStack.frontend.join(', ')}
      - Backend: ${data.techStack.backend.join(', ')}
      - Database: ${data.techStack.database.join(', ')}
      - Other Tools/Libraries: ${data.techStack.otherTools.join(', ')}

    Please generate a project plan based on this information. The plan should be detailed, realistic, and provide actionable insights. Ensure the output is a valid JSON object that adheres to the provided schema.
  `;
};

export const generateProjectPlan = async (data: ProjectInputData): Promise<ProjectPlan> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = buildPrompt(data);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: planSchema,
      },
    });

    const jsonText = response.text.trim();
    const plan: ProjectPlan = JSON.parse(jsonText);
    return plan;
  } catch (error) {
    console.error("Error generating project plan:", error);
    throw new Error("Failed to generate project plan from AI.");
  }
};
