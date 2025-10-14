import { GoogleGenAI, Type } from "@google/genai";
import type { ProjectInputData, ProjectPlan, FeatureSpecification, ReportType, Milestone, Priority, CoreRequirement } from './types';
import { cacheService } from './services/cacheService';
import { retryService } from './services/retryService';

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
    },
    databaseERDMermaid: {
        type: Type.STRING,
        description: "A Mermaid.js syntax string for an Entity-Relationship Diagram (ERD) showing the database schema. Use 'erDiagram' syntax to illustrate tables, their columns, and relationships with proper cardinality."
    }
  },
  required: ['summary', 'keyComponents', 'recommendedTechStack', 'potentialChallenges', 'potentialOpportunities', 'detailedFeatures', 'developmentPlan', 'systemArchitectureMermaid', 'userFlowMermaid', 'databaseERDMermaid']
};


// Helper function to safely handle Vietnamese characters in JSON
const sanitizeForJSON = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\u201C/g, '"') // Left double quotation mark
    .replace(/\u201D/g, '"') // Right double quotation mark
    .replace(/\u2018/g, "'") // Left single quotation mark
    .replace(/\u2019/g, "'") // Right single quotation mark
    .replace(/\u2026/g, '...') // Horizontal ellipsis
    .normalize('NFC'); // Normalize to composed form
};

  const buildPrompt = (data: ProjectInputData): string => {
  const coreModulesSection = data.coreModules && data.coreModules.length > 0 ? `
    Core Modules:
    ${data.coreModules.map(module => `
      - Module: ${sanitizeForJSON(module.moduleName)}
        Description: ${sanitizeForJSON(module.description)}
        Flows: ${module.flows.map(flow => sanitizeForJSON(flow)).join(', ')}
    `).join('')}
  ` : '';

  const rolePermissionsSection = data.rolePermissions && data.rolePermissions.length > 0 ? `
    Role & Permissions:
    ${data.rolePermissions.map(role => `
      - Role: ${role.role}
        Permissions: ${role.permissions.join(', ')}
    `).join('')}
  ` : '';

  const standardFlowsSection = data.standardFlows && data.standardFlows.length > 0 ? `
    Standard Flows:
    ${data.standardFlows.map(flow => `
      - Flow: ${flow.flowName}
        Steps: ${flow.steps.join(' → ')}
    `).join('')}
  ` : '';

  return `
    You are an expert Software Architect and Project Planner AI. Your task is to analyze the following comprehensive project details and generate a detailed, structured project plan.

    Project Details:
    - Project Name: ${data.projectName}
    - Short Description: ${data.shortDescription}
    - Business Goals: ${data.businessGoals}
    - Technical Goals: ${data.technicalGoals}
    - Target Users: ${data.targetUsers.join(', ')}
    - Number of Features: ${data.numberOfFeatures}
    - Estimated Scale: ${data.estimatedScale}
    - Timeline: ${data.timeline}

    Core Requirements:
    ${data.coreRequirements.map(req => `- ${req.description} (Priority: ${req.priority})`).join('\n    ')}

    ${coreModulesSection}

    ${rolePermissionsSection}

    ${standardFlowsSection}

    Anticipated Technology Stack:
    - Frontend: ${data.techStack.frontend.join(', ')}
    - Backend: ${data.techStack.backend.join(', ')}
    - Database: ${data.techStack.database.join(', ')}
    - Other Tools/Libraries: ${data.techStack.otherTools.join(', ')}

    Market Analysis: ${data.marketAnalysis || 'Not provided.'}
    Known Competitors: ${data.competitors.join(', ') || 'Not provided.'}

    Please generate a project plan based on this comprehensive information. The plan should be detailed, realistic, and provide actionable insights.

    **IMPORTANT INSTRUCTIONS:**

    1. **Use the Core Modules** to inform the 'Key Components' section. Each module should become a major component in your architecture.

    2. **Use the Role & Permissions** to inform the 'Potential Challenges' section. Consider security implications, access control complexity, and user management challenges.

    3. **Use the Standard Flows** to inform:
       - The 'Detailed Features' section (each flow should become a feature or sub-feature)
       - The 'User Flow Diagram' (use the most important flow as the primary user journey)
       - The 'Development Plan' (flows indicate dependencies and sequencing)

    4. **For the System Architecture Diagram**: Design it based on the core modules and their interactions. Show how data flows between modules and external systems.

    5. **For the User Flow Diagram**: Use the most critical standard flow (e.g., the main business process) as the primary user journey.

    6. **For the Database ERD Diagram**: Design an Entity-Relationship Diagram using 'erDiagram' syntax that shows the main tables/entities, their columns/attributes, and relationships with proper cardinality. Follow the official Mermaid.js ERD syntax:

    **Entity Definition Syntax:**
    \`\`\`
    EntityName {
      attribute1 dataType [PK|FK|UK]
      +attribute2 dataType [PK]
      attribute3 dataType FK "references Entity.field"
    }
    \`\`\`

    **Relationship Syntax:**
    \`\`\`
    Entity1 ||--o{ Entity2 : "one to many - description"
    Entity1 ||--|| Entity2 : "one to one"
    Entity1 }o--|| Entity2 : "zero/one to one"
    Entity1 }o--o{ Entity2 : "zero/one to many"
    Entity1 o{--o{ Entity2 : "many to many"
    \`\`\`

    **Cardinality symbols:**
    - \`||\` or \`||\` : exactly one (required)
    - \`|{ \` or \` }o\` : zero or one (optional)
    - \`|{ \` or \`o{ \` : zero or more
    - \`}o\` or \`o{ \` : one or more

    **Attribute constraints:**
    - \`PK\`: Primary Key
    - \`FK\`: Foreign Key
    - \`UK\`: Unique Key
    - \`+\` : Indicates primary key attribute

    Use the core modules and standard flows to identify the main entities that need to be stored. Include proper data types, relationships, and referential integrity constraints.

    Use the market and competitor information to inform the 'Potential Challenges' and 'Potential Opportunities' sections.

    For the development plan, provide estimated start weeks and durations for each milestone so they can be displayed in a Gantt chart. Consider the standard flows to determine logical sequencing of milestones.

    When generating Mermaid.js diagrams, ensure the syntax is strictly valid. Use multi-line format with proper indentation - do NOT use semicolons to separate lines. Each diagram must start with its appropriate keyword ('graph TD', 'flowchart LR', or 'erDiagram') and each statement should be on its own line.

    **MULTI-LINE DIAGRAM FORMAT REQUIREMENTS (All Diagram Types):**
    - **CORRECT FORMAT** (Multi-line, no semicolons):
      \`\`\`
      graph TD
          A[Start Process]
          B[Process Step 2]
          C[End Process]

          A --> B
          B --> C
      \`\`\`

    - **INCORRECT FORMAT** (Single line with semicolons - DO NOT USE):
      \`\`\`
      graph TD A[Start Process]; B[Process Step 2]; C[End Process]; A --> B; B --> C
      \`\`\`

    Use exactly the multi-line format shown above for ALL diagram types (graphs, flowcharts, and ERDs). Each line should contain a single statement, and proper indentation should be used.

    **CRITICAL MISTAKES TO AVOID FOR ER DIAGRAMS:**

    **Entity Definition Examples:**
    - **INCORRECT (Incorrect constraints):** 'User { id; name }'
    - **CORRECT:** 'User { int id PK "Primary key for user"; varchar name "User\'s full name" }'

    - **INCORRECT (Missing quotes in descriptions):** 'User { int id PK; varchar email FK }'
    - **CORRECT:** 'User { int id PK "Primary key"; varchar email FK "References..." }'

    **Relationship Syntax Examples:**
    - **INCORRECT (Space in cardinality):** 'User ||--o { Post : "has many"'
    - **CORRECT:** 'User ||--o{ Post : "one to many posts"'

    - **INCORRECT (Missing cardinality symbols):** 'User -- Post'
    - **CORRECT:** 'User ||--o{ Post : "one to many"'

    - **INCORRECT (Closure symbol spacing):** 'User ||-- }o Post'
    - **CORRECT:** 'User ||--o{ Post : "one to many"'

    **Important Rules:**
    1. **NO SPACES** between cardinality symbols: '||--o{' not '||--o {'
    2. **ALWAYS QUOTE** attribute descriptions: 'int id PK "description"'
    3. **ONE-TO-MANY**: EntityOne ||--o{ EntityTwo : "relationship description"
    4. **ONE-TO-ONE**: EntityOne ||--|| EntityTwo : "one to one relationship"
    5. **ZERO-ONE-TO-MANY**: EntityOne }o--o{ EntityTwo : "optional to many"
    6. **MANY-TO-MANY**: EntityOne }o--o{ EntityTwo : "many to many"

    **CRITICAL MISTAKES TO AVOID FOR FLOWCHARTS AND GRAPHS:**
    - **INCORRECT (Unterminated Node):** \`A --> B[\`
    - **CORRECT:** \`A --> B[Node B Text]\`

    - **INCORRECT (Undefined Node in Link):** \`A --> B\`
    - **CORRECT:** \`A[Client] --> B[Backend API]\`

    - **INCORRECT (Invalid Label Character):** \`A -->|HTTP/S Request| B\`
    - **CORRECT:** \`A -->|HTTPS Request| B\`

    - **INCORRECT (Stray Identifier):** \`A[Client] --> B(Backend); B\`
    - **CORRECT:** \`A[Client] --> B(Backend); B --> C{Database}\`

    Ensure the entire output is a single, valid JSON object that adheres to the provided schema.
  `;
};

export const generateProjectPlan = async (data: ProjectInputData): Promise<ProjectPlan> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  // Check cache first
  const cacheKey = cacheService.generateProjectPlanKey(data);
  const cachedResult = cacheService.get<ProjectPlan>(cacheKey);
  if (cachedResult) {
    console.log("✅ Returning cached project plan");
    return cachedResult;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = buildPrompt(data);

  try {
    const response = await retryService.executeAIOperation(async () => {
      console.log("🧠 Sending request to AI for plan generation...");
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: planSchema,
        },
      });
      return result;
    }, "Project Plan Generation");

    console.log("📝 Processing AI response...");
    const jsonText = response.text.trim();
    const plan: ProjectPlan = JSON.parse(jsonText);

    // Post-process Mermaid diagrams to ensure correct formatting
    if (plan.systemArchitectureMermaid) {
      console.log("🔧 Post-processing architecture diagram...");
      plan.systemArchitectureMermaid = postProcessMermaidCode(plan.systemArchitectureMermaid);
    }
    if (plan.userFlowMermaid) {
      console.log("🔧 Post-processing user flow diagram...");
      plan.userFlowMermaid = postProcessMermaidCode(plan.userFlowMermaid);
    }
    if (plan.databaseERDMermaid) {
      console.log("🔧 Post-processing database ERD diagram...");
      plan.databaseERDMermaid = postProcessMermaidERDCode(plan.databaseERDMermaid);
    }

    // Cache the result with longer TTL for complex operations
    cacheService.set(cacheKey, plan, 1000 * 60 * 60); // 1 hour TTL for plans
    console.log("💾 Plan cached successfully");

    console.log("🎉 Project plan generation completed successfully!");
    return plan;
  } catch (error) {
    console.error("❌ Error generating project plan:", error);

    // Provide more helpful error messages
    if (error.name === 'AIRetryError') {
      const originalError = (error as any).originalError;
      if (originalError?.message?.includes('quota')) {
        throw new Error("AI service quota exceeded. Please try again later or contact support.");
      }
      if (originalError?.message?.includes('rate limit')) {
        throw new Error("AI service is temporarily overloaded. Please wait a moment and try again.");
      }
    }

    throw new Error(`Failed to generate project plan: ${error.message}. Please check your input data and try again.`);
  }
};

const coreRequirementSchema = {
    type: Type.OBJECT,
    properties: {
        requirements: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    description: { type: Type.STRING },
                    priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] }
                },
                required: ['description', 'priority']
            }
        }
    },
    required: ['requirements']
};

const buildGenerateRequirementsPrompt = (data: Partial<ProjectInputData>): string => {
  const userRequestsSection = data.userFeatureRequests ? `
    Additionally, the user has provided the following specific feature requests. Please incorporate these ideas into the generated requirements list, refining them as needed to fit the project's scope and priority.
    User's Feature Requests:
    ---
    ${data.userFeatureRequests}
    ---
  ` : '';

  const coreModulesSection = data.coreModules && data.coreModules.length > 0 ? `
    Core Modules Defined:
    ${data.coreModules.map(module => `- ${module.moduleName}: ${module.description}`).join('\n    ')}
  ` : '';

  const rolePermissionsSection = data.rolePermissions && data.rolePermissions.length > 0 ? `
    User Roles Defined:
    ${data.rolePermissions.map(role => `- ${role.role}: ${role.permissions.join(', ')}`).join('\n    ')}
  ` : '';

  const standardFlowsSection = data.standardFlows && data.standardFlows.length > 0 ? `
    Standard Flows Defined:
    ${data.standardFlows.map(flow => `- ${flow.flowName}: ${flow.steps.length} steps`).join('\n    ')}
  ` : '';

  return `
    You are an expert Software Product Manager. Your task is to analyze the following comprehensive project details and generate a list of core functional requirements.

    Project Overview:
    - Project Name: ${data.projectName}
    - Short Description: ${data.shortDescription}
    - Business Goals: ${data.businessGoals}
    - Technical Goals: ${data.technicalGoals}
    - Target Users: ${data.targetUsers?.join(', ')}
    - Desired Number of Features: ${data.numberOfFeatures}

    ${coreModulesSection}

    ${rolePermissionsSection}

    ${standardFlowsSection}

    ${userRequestsSection}

    Based on all this comprehensive information, please generate a list of approximately ${data.numberOfFeatures} core requirements that align with the defined modules, roles, and flows.

    **IMPORTANT REQUIREMENTS GENERATION GUIDELINES:**

    1. **Consider Core Modules**: Each module should have corresponding functional requirements. For example, if there's a "Student Management" module, you need requirements for student registration, data management, etc.

    2. **Consider Role Permissions**: Different roles need different functional requirements. For example, admin roles need management features, while end users need access features.

    3. **Consider Standard Flows**: Each flow step should translate to functional requirements. For example, a "Student Registration Flow" needs requirements for form submission, approval processes, etc.

    4. **Balance Priorities**: Ensure a good mix of High (MVP essential), Medium (Phase 2), and Low (nice-to-have) priority requirements.

    5. **Technical vs Business**: Include both technical requirements (security, performance) and business requirements (user workflows, reporting).

    Each requirement should have a clear description and a priority level (High, Medium, or Low).

    Ensure the entire output is a single, valid JSON object that adheres to the provided schema, with a single key "requirements" containing the array of requirement objects.
  `;
};

export const generateCoreRequirements = async (data: Partial<ProjectInputData>): Promise<Omit<CoreRequirement, 'id'>[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  // Check cache first
  const cacheKey = cacheService.generateRequirementsKey(data);
  const cachedResult = cacheService.get<Omit<CoreRequirement, 'id'>[]>(cacheKey);
  if (cachedResult) {
    console.log("Returning cached requirements");
    return cachedResult;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = buildGenerateRequirementsPrompt(data);

  try {
    const response = await retryService.executeApiCall(async () => {
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: coreRequirementSchema,
        },
      });
      return result;
    });

    const jsonText = response.text.trim();
    const result: { requirements: Omit<CoreRequirement, 'id'>[] } = JSON.parse(jsonText);

    // Cache the result
    cacheService.set(cacheKey, result.requirements);

    return result.requirements;
  } catch (error) {
    console.error("Error generating core requirements:", error);
    throw new Error("Failed to generate core requirements with AI.");
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

const buildFixMermaidPrompt = (
  faultyCode: string,
  diagramType: string,
  projectContext: { name: string; description: string }
): string => {
  return `
    You are an expert in Mermaid.js syntax. The following Mermaid code, which is intended to be a ${diagramType} diagram for the project "${projectContext.name}", has a syntax error.

    Project Description: ${projectContext.description}

    Faulty Mermaid Code:
    ---
    ${faultyCode}
    ---

    Your task is to correct the syntax errors and return a valid Mermaid.js string using multi-line format with proper indentation - do NOT use semicolons to separate lines.

    **MULTI-LINE FORMATTING REQUIREMENTS:**
    The corrected diagram MUST use multi-line format similar to this example:
    \`\`\`
    graph TD
        A[Start Process]
        B[Process Step 2]
        C[End Process]

        A --> B
        B --> C
    \`\`\`

    **Do NOT use single-line format like this:**
    \`\`\`
    graph TD A[Start]; B[Step]; C[End]; A-->B; B-->C
    \`\`\`

    **IMPORTANT FORMATTING RULES:**

    1. **Node Format Correction:**
       - **INCORRECT:** \`A --> B[Content (Desc)]\`
       - **CORRECT:** \`A --> B[Content - Desc]\`

       - **INCORRECT:** \`A --> B[API (Service Provider)]\`
       - **CORRECT:** \`A --> B[API - Service Provider]\`

    2. **Keep Special Node Types Unchanged:**
       - **KEEP AS IS:** \`B[(Database)]\` (cylindrical database)
       - **KEEP AS IS:** \`B{C[Decision Point]}\` (diamond decision)
       - **KEEP AS IS:** \`B>[Flag]\` (flag shape)
       - **KEEP AS IS:** \`B{{Hexagon}}\` (hexagonal shape)

    3. **General Syntax Rules:**
       - **INCORRECT (Unterminated Node):** \`A --> B[\`
       - **CORRECT:** \`A --> B[Node B Text]\`

       - **INCORRECT (Undefined Node in Link):** \`A --> B\`
       - **CORRECT:** \`A[Client] --> B[Backend API]\`

       - **INCORRECT (Invalid Label Character):** \`A -->|HTTP/S Request| B\`
       - **CORRECT:** \`A -->|HTTPS Request| B\`

    **ERD Specific Rules (if diagram type includes 'ERD'):**
    - Use multi-line entity definitions with proper indentation
    - Each entity attribute on separate line
    - Relationships on separate lines with 4-space indentation

    **SPECIFIC VIETNAMESE PROJECT REQUIREMENTS:**
    - Ensure all Vietnamese text in node labels is properly formatted
    - Replace parentheses with dashes in Vietnamese node labels
    - Keep technical terms in English even when mixed with Vietnamese

    Return ONLY the corrected, valid Mermaid.js code as a multi-line formatted string. Do not include any explanations, markdown code fences, or any other text.
  `;
};

// Helper function to post-process Mermaid code and fix common formatting issues
const postProcessMermaidCode = (code: string): string => {
  if (!code) return code;

  let processedCode = code;

  // Apply general Mermaid post-processing for all diagram types
  // Convert escaped sequences to actual newlines and ensure proper formatting

  // First, handle HTML-style line breaks (\n) and convert them to actual newlines
  processedCode = processedCode.replace(/\\n/g, '\n');

  // Remove semicolons and ensure multi-line format
  processedCode = processedCode
    // Remove any remaining semicolons by replacing them with newlines
    .replace(/;/g, '\n')
    // Ensure proper indentation (4 spaces) for all lines after the diagram type
    .replace(/^\s*(graph|flowchart|erDiagram)\s+(\w+)\s*\n(.+)$/ms, (match, type, direction, content) => {
      // Split content by newlines and add proper indentation
      const lines = content.split('\n').map(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('    ')) {
          return '    ' + trimmed;
        }
        return trimmed;
      });

      // Add a blank line between node definitions and relationships for readability
      const processedLines = [];
      let foundRelationship = false;

      for (const line of lines) {
        if (line.includes('-->') || line.includes('|>') || line.includes('->')) {
          if (!foundRelationship) {
            processedLines.push('');
            foundRelationship = true;
          }
        }
        processedLines.push(line);
      }

      return `${type} ${direction}\n${processedLines.join('\n')}`;
    })
    // Clean up any remaining multiple spaces (but preserve indentation)
    .replace(/[^\n]\s{2,}/g, ' ')
    // Remove any trailing whitespace
    .replace(/[ \t]+$/gm, '')
    // Trim the entire thing
    .trim();

  return processedCode;
};

// Helper function to post-process Mermaid ERD code and fix common formatting issues
const postProcessMermaidERDCode = (code: string): string => {
  if (!code) return code;

  let processedCode = code;

  // ERD-specific post-processing: REMOVE semicolons for multi-line format
  // The ERD format requires multi-line with newlines, not semicolons
  processedCode = processedCode
    // Replace all semicolons in ERD context with newlines (except after 'erDiagram')
    .replace(/erDiagram\s*;/g, 'erDiagram\n')
    .replace(/;/g, '\n')
    // Ensure proper indentation (4 spaces) for entity definitions
    .replace(/^(\s*)(\w+\s*\{.*)$/gm, '$1    $2')
    .replace(/^\s*(\w+)\s*\{\s*$/gm, '    $1 {')
    .replace(/^\s*\}\s*$/gm, '    }')
    // Ensure relationships are properly indented without semicolons
    .replace(/^(\s*)(Entity\w+\s*\|\|.*)$/gm, '$1    $2')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    // Normalize newlines and ensure proper line breaks
    .replace(/\s*\n\s*/g, '\n')
    .trim();

  return processedCode;
};

export const fixMermaidCode = async (
  faultyCode: string,
  diagramType: 'system architecture' | 'user flow',
  projectContext: { name: string; description: string }
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = buildFixMermaidPrompt(faultyCode, diagramType, projectContext);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    // Clean up potential markdown fences if the model adds them despite instructions
    let cleanedCode = response.text.trim().replace(/```mermaid/g, '').replace(/```/g, '').trim();

    // Apply post-processing to fix common formatting issues
    cleanedCode = postProcessMermaidCode(cleanedCode);

    return cleanedCode;
  } catch (error) {
    console.error("Error fixing Mermaid code:", error);
    throw new Error("Failed to fix diagram with AI.");
  }
};
