import { GoogleGenAI, Type } from "@google/genai";
import type { ProjectInputData, ProjectPlan, FeatureSpecification, ReportType, Milestone } from '../types';

const featureSpecificationSchema = {
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
};

const milestoneSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
        estimatedStartDate: {
            type: Type.STRING,
            description: 'The estimated start week for the milestone, formatted as "Week X". For example: "Week 1".'
        },
        estimatedDurationWeeks: {
            type: Type.NUMBER,
            description: 'The estimated duration of the milestone in number of weeks.'
        }
    },
    required: ['name', 'description', 'tasks', 'estimatedStartDate', 'estimatedDurationWeeks']
};

const developmentPlanSchema = {
    type: Type.OBJECT,
    properties: {
        milestones: {
          type: Type.ARRAY,
          items: milestoneSchema
        }
    },
    description: 'A high-level development plan with milestones and associated tasks, including start dates and durations for a Gantt chart.'
};

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
      items: featureSpecificationSchema,
      description: 'A detailed breakdown of each core requirement into a feature specification.'
    },
    developmentPlan: developmentPlanSchema,
    systemArchitectureMermaid: {
        type: Type.STRING,
        description: 'A Mermaid.js syntax string for a top-down (graph TD) system architecture diagram. It should visualize the key components and their interactions.'
    },
    userFlowMermaid: {
        type: Type.STRING,
        description: "A Mermaid.js syntax string for a user flow diagram (using 'flowchart LR' or 'graph LR'). It should visualize a primary user journey, like registration and onboarding, or a core interaction loop."
    }
  },
  required: ['summary', 'keyComponents', 'recommendedTechStack', 'potentialChallenges', 'potentialOpportunities', 'detailedFeatures', 'developmentPlan', 'systemArchitectureMermaid', 'userFlowMermaid']
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
    - Market Analysis: ${data.marketAnalysis || 'Not provided.'}
    - Known Competitors: ${data.competitors.join(', ') || 'Not provided.'}

    Please generate a project plan based on this information. The plan should be detailed, realistic, and provide actionable insights. Use the market and competitor information to inform the 'Potential Challenges' and 'Potential Opportunities' sections.
    For the development plan, provide estimated start weeks and durations for each milestone so they can be displayed in a Gantt chart.
    
    When generating Mermaid.js diagrams, ensure the syntax is strictly valid. The entire diagram MUST be a single line of code starting with 'graph TD' or 'flowchart LR', with statements separated by semicolons.

    **CRITICAL MISTAKES TO AVOID:**
    - **INCORRECT (Unterminated Node):** \`A --> B[\`
      (The definition for node B is incomplete. It's missing text and a closing bracket.)
    - **CORRECT:** \`A --> B[Node B Text]\`
    
    - **INCORRECT (Undefined Node in Link):** \`A --> B\`
      (The link points to a node 'B' that has no text definition. All nodes in a link must be fully defined with text.)
    - **CORRECT:** \`A[Client] --> B[Backend API]\`
    
    - **INCORRECT (Invalid Label Character):** \`A -->|HTTP/S Request| B\`
      (The '/' character can break the parser.)
    - **CORRECT:** \`A -->|HTTPS Request| B\`

    - **INCORRECT (Stray Identifier):** \`A[Client] --> B(Backend); B\`
      (The 'B' at the end is a stray identifier. It must be part of a new, complete link, like \`B --> C\`.)
    - **CORRECT:** \`A[Client] --> B(Backend); B --> C{Database}\`

    - **INCORRECT (Stray Identifier):** \`A[Node 1 Text]; B\`
      (This is also a stray identifier. After a node definition, the next statement must be a complete link.)
    - **CORRECT:** \`A[Node 1 Text]; A --> B[Node 2 Text]\`

    - **INCORRECT (Incomplete Link):** \`A -->|API Request|\`
      (This link is missing a destination node.)
    - **CORRECT:** \`A -->|API Request| B[API Endpoint]\`

    - **INCORRECT (Invalid Cover Sytax):** \`A -->B[API (Weather)]\`
    - **CORRECT:** \`A -->B[API - Weather]\` or \`A -->B[API & Weather Provider]\`

    First, generate a system architecture diagram using Mermaid.js syntax (starting with 'graph TD'). This diagram should visualize how the key components (like Frontend, Backend, Database, external services) interact with each other.

    Second, generate a user flow diagram, also using Mermaid.js syntax (starting with 'flowchart LR'). This should illustrate a key user journey, such as user registration and login, or the main process for using the application's core feature. This is separate from the architecture diagram.

    Ensure the entire output is a single, valid JSON object that adheres to the provided schema.
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

const buildRegeneratePrompt = (currentPlan: ProjectPlan, originalInput: ProjectInputData, userPrompt: string): string => {
  const originalRequestPrompt = buildPrompt(originalInput);
  
  return `
    You are an expert Software Architect and Project Planner AI.
    You have previously generated a project plan for a user. Now, the user has feedback and wants you to regenerate the plan.

    Here is the user's original request:
    ---
    ${originalRequestPrompt}
    ---

    Here is the project plan you generated previously:
    ---
    ${JSON.stringify(currentPlan, null, 2)}
    ---

    Now, here is the user's new request for changes:
    ---
    "${userPrompt}"
    ---

    Please regenerate the **entire** project plan, incorporating the user's new feedback. 
    The new plan should be a complete replacement, not just an update. 
    Maintain the context from the original request but modify the plan according to the new instructions.

    Ensure the entire output is a single, valid JSON object that adheres to the provided schema.
  `;
};

export const regenerateProjectPlan = async (
  currentPlan: ProjectPlan,
  originalInput: ProjectInputData,
  userPrompt: string
): Promise<ProjectPlan> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = buildRegeneratePrompt(currentPlan, originalInput, userPrompt);

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
    console.error("Error regenerating project plan:", error);
    throw new Error("Failed to regenerate project plan with AI.");
  }
};


const buildEnhanceFeaturePrompt = (
  feature: FeatureSpecification,
  userPrompt: string,
  projectContext: { name: string; description: string }
): string => {
  return `
    You are an expert Software Product Manager. Your task is to enhance a feature specification based on a user's request.

    Project Context:
    - Project Name: ${projectContext.name}
    - Project Summary: ${projectContext.description}

    Current Feature Specification:
    - Name: ${feature.name}
    - Description: ${feature.description}
    - Target Users: ${feature.targetUsers.join(', ')}
    - Main Functions: ${feature.mainFunctions.join('\n      - ')}
    - Sub-Features: ${feature.subFeatures.join('\n      - ')}
    - Pre-Conditions: ${feature.preConditions.join('\n      - ')}

    User's Enhancement Request: "${userPrompt}"

    Please generate an updated and improved version of the entire feature specification based on the user's request.
    For example, if the user asks for "add user stories", you should enrich the description with them.
    If the user asks to make it "more technical", you should elaborate on the main functions and sub-features with more technical detail.
    
    The feature name should remain the same.
    
    Ensure the entire output is a single, valid JSON object that adheres to the provided schema.
  `;
};

export const enhanceFeatureSpecification = async (
  feature: FeatureSpecification,
  userPrompt: string,
  projectContext: { name: string; description: string }
): Promise<FeatureSpecification> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = buildEnhanceFeaturePrompt(feature, userPrompt, projectContext);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: featureSpecificationSchema,
      },
    });

    const jsonText = response.text.trim();
    const newFeature: FeatureSpecification = JSON.parse(jsonText);
    return newFeature;
  } catch (error) {
    console.error("Error enhancing feature:", error);
    throw new Error("Failed to enhance feature with AI.");
  }
};

const buildOptimizeDevPlanPrompt = (
  milestones: Milestone[],
  userPrompt: string,
  projectContext: { name: string; description: string }
): string => {
  return `
    You are an expert Project Manager AI. Your task is to optimize a project's development plan based on a user's request.

    Project Context:
    - Project Name: ${projectContext.name}
    - Project Summary: ${projectContext.description}

    Current Development Plan Milestones:
    ${JSON.stringify(milestones, null, 2)}

    User's Optimization Request: "${userPrompt}"

    Please generate an updated and improved list of milestones that completely replaces the old one, based on the user's request.
    For example, if the user asks to "make the timeline more aggressive", you should shorten the durations or overlap milestones where possible. 
    If they ask to "add more detail to a specific milestone", you should break down its tasks more granularly.
    If they ask to "delay the start by 2 weeks", you must adjust all \`estimatedStartDate\` values accordingly.
    
    Ensure the entire output is a single, valid JSON object that adheres to the provided schema, which should be an object with a single key "milestones" containing an array of milestone objects.
  `;
};

export const optimizeDevelopmentPlan = async (
  milestones: Milestone[],
  userPrompt: string,
  projectContext: { name: string; description: string }
): Promise<Milestone[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = buildOptimizeDevPlanPrompt(milestones, userPrompt, projectContext);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                milestones: {
                  type: Type.ARRAY,
                  items: milestoneSchema
                }
            }
        },
      },
    });

    const jsonText = response.text.trim();
    const result: { milestones: Milestone[] } = JSON.parse(jsonText);
    return result.milestones;
  } catch (error) {
    console.error("Error optimizing development plan:", error);
    throw new Error("Failed to optimize development plan with AI.");
  }
};


const buildReportPrompt = (
  plan: ProjectPlan,
  projectName: string,
  reportType: ReportType
): string => {
  const planContext = `
    Here is the full project plan for "${projectName}":

    Summary: ${plan.summary}
    Key Components: ${plan.keyComponents.join(', ')}
    Recommended Tech Stack: 
      - Frontend: ${plan.recommendedTechStack.frontend.join(', ')}
      - Backend: ${plan.recommendedTechStack.backend.join(', ')}
      - Database: ${plan.recommendedTechStack.database.join(', ')}
      - Other: ${plan.recommendedTechStack.other.join(', ')}
    Potential Challenges: ${plan.potentialChallenges.join(', ')}
    Potential Opportunities: ${plan.potentialOpportunities.join(', ')}
    Features:
    ${plan.detailedFeatures.map(f => `
      - Feature: ${f.name}
        Description: ${f.description}
        Main Functions: ${f.mainFunctions.join(', ')}
    `).join('')}
    Development Milestones:
    ${plan.developmentPlan.milestones.map(m => `
      - Milestone: ${m.name}
        Description: ${m.description}
        Tasks: ${m.tasks.join(', ')}
    `).join('')}
  `;

  switch (reportType) {
    case 'technical_spec':
      return `
        You are a Principal Software Engineer. Based on the following project plan, write a detailed technical specification document.
        The document should be well-structured, written in Markdown, and focus on technical implementation details, architecture choices, data models, and API design considerations.
        It should be comprehensive enough for a development team to start working from.

        ${planContext}
      `;
    case 'product_brief':
      return `
        You are a Senior Product Manager. Based on the following project plan, write a concise product brief.
        The brief should be written in Markdown and target stakeholders like marketing, sales, and leadership.
        It should clearly articulate the problem, the solution, target users, key features, and success metrics. Avoid overly technical jargon.

        ${planContext}
      `;
    case 'executive_summary':
      return `
        You are a C-level Executive (CEO/CTO). Based on the following project plan, write a high-level executive summary.
        The summary must be brief, written in Markdown, and suitable for a board meeting or for investors.
        Focus on the business opportunity, market potential, strategic value, high-level timeline, and required investment.

        ${planContext}
      `;
  }
};

export const generateReport = async (
  plan: ProjectPlan,
  projectName: string,
  reportType: ReportType
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = buildReportPrompt(plan, projectName, reportType);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error(`Error generating ${reportType} report:`, error);
    throw new Error(`Failed to generate ${reportType} report with AI.`);
  }
};