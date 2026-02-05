import { Type } from '@google/genai';
import type { ProjectInputData, ProjectPlan, FeatureSpecification, Milestone } from '../types';
import type { APIProvider } from '../types';
import { cacheService } from './cacheService';
import { retryService } from './retryService';

// ==================== Type Definitions ====================

export interface CoreAnalysis {
  summary: string;
  keyComponents: string[];
  recommendedTechStack: {
    frontend: string[];
    backend: string[];
    database: string[];
    other: string[];
  };
  potentialChallenges: string[];
  potentialOpportunities: string[];
}

export interface BatchProgress {
  currentBatch: string;
  percentage: number;
  completedBatches: string[];
}

export type ProgressCallback = (batch: string, progress: number) => void;

// ==================== Schemas for each batch ====================

const coreAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description:
        'A concise, AI-generated summary of the project explaining its purpose and value.',
    },
    keyComponents: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'A list of the main functional or architectural components needed.',
    },
    recommendedTechStack: {
      type: Type.OBJECT,
      properties: {
        frontend: { type: Type.ARRAY, items: { type: Type.STRING } },
        backend: { type: Type.ARRAY, items: { type: Type.STRING } },
        database: { type: Type.ARRAY, items: { type: Type.STRING } },
        other: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      description: 'A refined and detailed technology stack recommendation.',
    },
    potentialChallenges: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Potential technical or business challenges to be aware of.',
    },
    potentialOpportunities: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Potential opportunities for growth, expansion, or unique value propositions.',
    },
  },
  required: [
    'summary',
    'keyComponents',
    'recommendedTechStack',
    'potentialChallenges',
    'potentialOpportunities',
  ],
};

const featureSpecificationSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    description: { type: Type.STRING },
    targetUsers: { type: Type.ARRAY, items: { type: Type.STRING } },
    mainFunctions: { type: Type.ARRAY, items: { type: Type.STRING } },
    subFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
    preConditions: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['name', 'description', 'targetUsers', 'mainFunctions', 'subFeatures', 'preConditions'],
};

const featuresSchema = {
  type: Type.OBJECT,
  properties: {
    detailedFeatures: {
      type: Type.ARRAY,
      items: featureSpecificationSchema,
      description:
        'A detailed breakdown of each core requirement into a feature specification with comprehensive details.',
    },
  },
  required: ['detailedFeatures'],
};

const milestoneSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    description: { type: Type.STRING },
    tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
    estimatedStartDate: {
      type: Type.STRING,
      description:
        'The estimated start week for the milestone, formatted as "Week X". For example: "Week 1".',
    },
    estimatedDurationWeeks: {
      type: Type.NUMBER,
      description: 'The estimated duration of the milestone in number of weeks.',
    },
  },
  required: ['name', 'description', 'tasks', 'estimatedStartDate', 'estimatedDurationWeeks'],
};

const developmentPlanSchema = {
  type: Type.OBJECT,
  properties: {
    milestones: {
      type: Type.ARRAY,
      items: milestoneSchema,
    },
  },
  required: ['milestones'],
};

const architectureDiagramSchema = {
  type: Type.OBJECT,
  properties: {
    systemArchitectureMermaid: {
      type: Type.STRING,
      description:
        'A Mermaid.js syntax string for a top-down (graph TD) system architecture diagram. It should visualize the key components and their interactions.',
    },
  },
  required: ['systemArchitectureMermaid'],
};

const userFlowDiagramSchema = {
  type: Type.OBJECT,
  properties: {
    userFlowMermaid: {
      type: Type.STRING,
      description:
        "A Mermaid.js syntax string for a user flow diagram (using 'flowchart LR' or 'graph LR'). It should visualize a primary user journey.",
    },
  },
  required: ['userFlowMermaid'],
};

const databaseERDSchema = {
  type: Type.OBJECT,
  properties: {
    databaseERDMermaid: {
      type: Type.STRING,
      description:
        "A Mermaid.js syntax string for an Entity-Relationship Diagram (ERD) showing the database schema. Use 'erDiagram' syntax to illustrate tables, their columns, and relationships with proper cardinality.",
    },
  },
  required: ['databaseERDMermaid'],
};

// ==================== Helper Functions ====================

const cleanMarkdownCodeBlocks = (text: string): string => {
  if (!text) return text;
  let cleaned = text.replace(/^```(?:json|JSON)?\\s*\\n?/gm, '').replace(/\\n?```\\s*$/gm, '');
  cleaned = cleaned.replace(/^```\\s*\\n?/gm, '').replace(/\\n?```\\s*$/gm, '');
  return cleaned.trim();
};

// Import validation functions and AIService from aiService.ts
import { validateMermaidCode, validateMermaidERDCode, AIService } from './aiService';

// Helper to extract JSON from AI response
const extractJSONFromResponse = (response: any, provider: APIProvider): string => {
  let jsonText: string;

  if (provider.type === 'gemini') {
    jsonText = response.text?.trim() || '';
  } else if (
    provider.type === 'openrouter' ||
    provider.type === 'anthropic' ||
    provider.type === 'openai'
  ) {
    jsonText =
      response.choices?.[0]?.message?.content ||
      response.content?.[0]?.text ||
      response.choices[0]?.text ||
      '';
    if (!jsonText && response.choices?.[0]) {
      jsonText = response.choices[0].message?.content || response.choices[0].text || '';
    }
  } else if (provider.type === 'ollama') {
    jsonText = response.response || '';
  } else {
    jsonText = response.text || response.content || '';
  }

  return cleanMarkdownCodeBlocks(jsonText);
};

const makeAIRequest = async (
  prompt: string,
  schema: any,
  provider: APIProvider,
  batchName: string,
): Promise<any> => {
  const aiService = new AIService(provider);

  const response = await retryService.executeAIOperation(async () => {
    console.log(`🧠 [Batch: ${batchName}] Sending request to AI...`);
    return await aiService.generateContent(prompt, {
      responseMimeType: 'application/json',
      responseSchema: schema,
    });
  }, batchName);

  const jsonText = extractJSONFromResponse(response, provider);

  if (!jsonText || jsonText.trim() === '') {
    throw new Error(`Empty response from ${provider.type} provider for ${batchName}`);
  }

  try {
    return JSON.parse(jsonText);
  } catch (parseError: any) {
    const jsonMatch = jsonText.match(/\\{[\\s\\S]*\\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        throw new Error(`Failed to parse JSON for ${batchName}: ${parseError.message}`);
      }
    }
    throw new Error(`Invalid JSON for ${batchName}: ${parseError.message}`);
  }
};

// ==================== Batch 1: Core Analysis ====================

export const generateCoreAnalysis = async (
  data: ProjectInputData,
  provider: APIProvider,
): Promise<CoreAnalysis> => {
  const cacheKey = `core_analysis_${JSON.stringify(data)}_provider_${provider.type}_${provider.model}`;
  const cached = cacheService.get<CoreAnalysis>(cacheKey);
  if (cached) {
    console.log('✅ [Batch 1] Using cached core analysis');
    return cached;
  }

  const prompt = `
You are an expert Software Architect and Project Planner AI.

Analyze the following project details and provide a high-level analysis focusing on:
1. Project summary
2. Key architectural components
3. Recommended technology stack
4. Potential challenges
5. Potential opportunities

Project Details:
- Project Name: ${data.projectName}
- Description: ${data.shortDescription}
- Business Goals: ${data.businessGoals}
- Technical Goals: ${data.technicalGoals}
- Target Users: ${data.targetUsers.join(', ')}
- Scale: ${data.estimatedScale}
- Timeline: ${data.timeline}

Core Requirements:
${data.coreRequirements.map((req) => `- ${req.description} (Priority: ${req.priority})`).join('\\n')}

Anticipated Technology Stack:
- Frontend: ${data.techStack.frontend.join(', ')}
- Backend: ${data.techStack.backend.join(', ')}
- Database: ${data.techStack.database.join(', ')}

Provide a comprehensive high-level analysis. Be specific and actionable.
  `.trim();

  console.log('🚀 [Batch 1] Generating core analysis...');
  const result = await makeAIRequest(
    prompt,
    coreAnalysisSchema,
    provider,
    'Batch 1: Core Analysis',
  );

  cacheService.set(cacheKey, result, 1000 * 60 * 60); // 1 hour cache
  console.log('✅ [Batch 1] Core analysis generated successfully');
  return result as CoreAnalysis;
};

// ==================== Batch 2: Feature Specifications ====================

export const generateFeatureSpecs = async (
  data: ProjectInputData,
  coreAnalysis: CoreAnalysis,
  provider: APIProvider,
): Promise<FeatureSpecification[]> => {
  const cacheKey = `features_${JSON.stringify(data)}_${JSON.stringify(coreAnalysis)}_provider_${provider.type}`;
  const cached = cacheService.get<FeatureSpecification[]>(cacheKey);
  if (cached) {
    console.log('✅ [Batch 2] Using cached features');
    return cached;
  }

  const prompt = `
You are an expert Software Architect creating detailed feature specifications.

Based on the following project context, create detailed feature specifications for each core requirement.

PROJECT CONTEXT (from previous analysis):
Summary: ${coreAnalysis.summary}

Key Components: ${coreAnalysis.keyComponents.join(', ')}

Recommended Tech Stack:
- Frontend: ${coreAnalysis.recommendedTechStack.frontend.join(', ')}
- Backend: ${coreAnalysis.recommendedTechStack.backend.join(', ')}
- Database: ${coreAnalysis.recommendedTechStack.database.join(', ')}

CORE REQUIREMENTS TO EXPAND INTO FEATURES:
${data.coreRequirements.map((req, idx) => `${idx + 1}. ${req.description} (Priority: ${req.priority})`).join('\\n')}

TARGET USERS: ${data.targetUsers.join(', ')}

For each core requirement, create a detailed feature specification including:
- Feature name
- Detailed description
- Target users who will use this feature
- Main functions/capabilities
- Sub-features or user stories
- Pre-conditions or dependencies

Make the features comprehensive and implementation-ready.
  `.trim();

  console.log('🚀 [Batch 2] Generating feature specifications...');
  const result = await makeAIRequest(prompt, featuresSchema, provider, 'Batch 2: Features');

  cacheService.set(cacheKey, result.detailedFeatures, 1000 * 60 * 60);
  console.log(`✅ [Batch 2] Generated ${result.detailedFeatures.length} features`);
  return result.detailedFeatures as FeatureSpecification[];
};

// ==================== Batch 3: Development Plan ====================

export const generateDevelopmentPlan = async (
  data: ProjectInputData,
  coreAnalysis: CoreAnalysis,
  features: FeatureSpecification[],
  provider: APIProvider,
): Promise<Milestone[]> => {
  const cacheKey = `devplan_${JSON.stringify(data.timeline)}_${features.length}_provider_${provider.type}`;
  const cached = cacheService.get<Milestone[]>(cacheKey);
  if (cached) {
    console.log('✅ [Batch 3] Using cached development plan');
    return cached;
  }

  const prompt = `
You are an expert Project Manager creating a detailed development timeline.

Based on the project context and features, create a development plan with milestones.

PROJECT TIMELINE: ${data.timeline}
PROJECT SCALE: ${data.estimatedScale}

FEATURES TO IMPLEMENT:
${features.map((f, idx) => `${idx + 1}. ${f.name}: ${f.description}`).join('\\n')}

TECH STACK:
- Frontend: ${coreAnalysis.recommendedTechStack.frontend.join(', ')}
- Backend: ${coreAnalysis.recommendedTechStack.backend.join(', ')}
- Database: ${coreAnalysis.recommendedTechStack.database.join(', ')}

Create a realistic development plan with milestones. Each milestone should:
- Have a clear name and description
- Include specific tasks
- Have an estimated start week (e.g., "Week 1", "Week 2")
- Have an estimated duration in weeks

Consider dependencies and logical sequencing. Make it suitable for a Gantt chart display.
  `.trim();

  console.log('🚀 [Batch 3] Generating development plan...');
  const result = await makeAIRequest(
    prompt,
    developmentPlanSchema,
    provider,
    'Batch 3: Development Plan',
  );

  cacheService.set(cacheKey, result.milestones, 1000 * 60 * 60);
  console.log(`✅ [Batch 3] Generated ${result.milestones.length} milestones`);
  return result.milestones as Milestone[];
};

// ==================== Batch 4: Architecture Diagram ====================

export const generateArchitectureDiagram = async (
  coreAnalysis: CoreAnalysis,
  provider: APIProvider,
): Promise<string> => {
  const cacheKey = `arch_diagram_${JSON.stringify(coreAnalysis.keyComponents)}_provider_${provider.type}`;
  const cached = cacheService.get<string>(cacheKey);
  if (cached) {
    console.log('✅ [Batch 4] Using cached architecture diagram');
    return cached;
  }

  const prompt = `
You are an expert System Architect creating a Mermaid.js architecture diagram.

Create a system architecture diagram showing the key components and their interactions.

KEY COMPONENTS:
${coreAnalysis.keyComponents.map((c, idx) => `${idx + 1}. ${c}`).join('\\n')}

TECH STACK:
- Frontend: ${coreAnalysis.recommendedTechStack.frontend.join(', ')}
- Backend: ${coreAnalysis.recommendedTechStack.backend.join(', ')}
- Database: ${coreAnalysis.recommendedTechStack.database.join(', ')}
- Other: ${coreAnalysis.recommendedTechStack.other.join(', ')}

Generate a Mermaid.js diagram using 'graph TD' (top-down) format showing:
- All key components as nodes
- Data flow and interactions as edges/arrows
- External systems or services if applicable

CRITICAL REQUIREMENTS:
1. Use MULTI-LINE format (one statement per line)
2. NO semicolons to separate lines
3. Use proper node syntax: A[Label Text]
4. Use proper edge syntax: A --> B

Example format:
\`\`\`
graph TD
    A[Component A]
    B[Component B]
    C[Component C]
    
    A --> B
    B --> C
\`\`\`

Return ONLY the Mermaid code, no markdown code blocks, no explanations.
  `.trim();

  console.log('🚀 [Batch 4] Generating architecture diagram...');
  const result = await makeAIRequest(
    prompt,
    architectureDiagramSchema,
    provider,
    'Batch 4: Architecture',
  );

  let diagram = result.systemArchitectureMermaid;
  diagram = validateMermaidCode(diagram);

  cacheService.set(cacheKey, diagram, 1000 * 60 * 60);
  console.log('✅ [Batch 4] Architecture diagram generated');
  return diagram;
};

// ==================== Batch 5: User Flow Diagram ====================

export const generateUserFlowDiagram = async (
  features: FeatureSpecification[],
  provider: APIProvider,
): Promise<string> => {
  const cacheKey = `user_flow_${features.length}_${features[0]?.name}_provider_${provider.type}`;
  const cached = cacheService.get<string>(cacheKey);
  if (cached) {
    console.log('✅ [Batch 5] Using cached user flow diagram');
    return cached;
  }

  const primaryFeature = features.find((f) => f.name.toLowerCase().includes('auth')) || features[0];

  const prompt = `
You are a UX expert creating a user flow diagram in Mermaid.js format.

Create a user journey flowchart for the primary user flow based on these features:

PRIMARY FEATURE:
Name: ${primaryFeature?.name}
Description: ${primaryFeature?.description}
Main Functions: ${primaryFeature?.mainFunctions.join(', ')}

OTHER KEY FEATURES:
${features
  .slice(0, 3)
  .map((f) => `- ${f.name}: ${f.mainFunctions.slice(0, 2).join(', ')}`)
  .join('\\n')}

Generate a Mermaid.js flowchart (use 'flowchart LR' or 'graph LR') showing:
- User entry point
- Key decision points
- Main user actions
- Successful completion paths

CRITICAL REQUIREMENTS:
1. Use MULTI-LINE format (one statement per line)
2. NO semicolons
3. Use proper flowchart syntax

Example:
\`\`\`
flowchart LR
    A[User visits site]
    B{Logged in?}
    C[Show dashboard]
    
    A --> B
    B -->|Yes| C
\`\`\`

Return ONLY the Mermaid code.
  `.trim();

  console.log('🚀 [Batch 5] Generating user flow diagram...');
  const result = await makeAIRequest(prompt, userFlowDiagramSchema, provider, 'Batch 5: User Flow');

  let diagram = result.userFlowMermaid;
  diagram = validateMermaidCode(diagram);

  cacheService.set(cacheKey, diagram, 1000 * 60 * 60);
  console.log('✅ [Batch 5] User flow diagram generated');
  return diagram;
};

// ==================== Batch 6: Database ERD ====================

export const generateDatabaseERD = async (
  coreAnalysis: CoreAnalysis,
  features: FeatureSpecification[],
  provider: APIProvider,
): Promise<string> => {
  const cacheKey = `db_erd_${features.length}_${coreAnalysis.keyComponents.length}_provider_${provider.type}`;
  const cached = cacheService.get<string>(cacheKey);
  if (cached) {
    console.log('✅ [Batch 6] Using cached database ERD');
    return cached;
  }

  const prompt = `
You are a Database Architect creating an Entity-Relationship Diagram in Mermaid.js format.

Design a database schema based on:

KEY COMPONENTS:
${coreAnalysis.keyComponents.join(', ')}

FEATURES:
${features.map((f) => `- ${f.name}: ${f.description.substring(0, 100)}`).join('\\n')}

RECOMMENDED DATABASE: ${coreAnalysis.recommendedTechStack.database.join(', ')}

Generate a Mermaid.js ERD using 'erDiagram' syntax showing:
- Main entities/tables
- Attributes with data types
- Relationships with proper cardinality
- Primary keys (PK) and Foreign keys (FK)

CRITICAL ERD SYNTAX REQUIREMENTS:
1. Start with 'erDiagram'
2. Entity format: EntityName { datatype attribute_name [PK|FK] }
3. Relationship format: Entity1 ||--o{ Entity2 : "relationship description"
4. NO SPACES in cardinality symbols: ||--o{ NOT ||--o {
5. Always quote relationship descriptions

Cardinality symbols:
- ||--|| : one to one
- ||--o{ : one to many
- }o--o{ : many to many

Example:
\`\`\`
erDiagram
    USER {
        int id PK
        varchar email
        varchar name
    }
    POST {
        int id PK
        int user_id FK
        text content
    }
    
    USER ||--o{ POST : "creates"
\`\`\`

Return ONLY the Mermaid ERD code.
  `.trim();

  console.log('🚀 [Batch 6] Generating database ERD...');
  const result = await makeAIRequest(prompt, databaseERDSchema, provider, 'Batch 6: Database ERD');

  let diagram = result.databaseERDMermaid;
  diagram = validateMermaidERDCode(diagram);

  cacheService.set(cacheKey, diagram, 1000 * 60 * 60);
  console.log('✅ [Batch 6] Database ERD generated');
  return diagram;
};

// ==================== Main Orchestrator ====================

export const generateProjectPlanBatched = async (
  data: ProjectInputData,
  provider: APIProvider,
  onProgress?: ProgressCallback,
): Promise<ProjectPlan> => {
  console.log('🎯 Starting batched project plan generation...');
  const startTime = Date.now();

  try {
    // Batch 1: Core Analysis (20%)
    onProgress?.('Analyzing project requirements', 10);
    const coreAnalysis = await generateCoreAnalysis(data, provider);
    onProgress?.('Core analysis complete', 20);

    // Batch 2: Features (40%)
    onProgress?.('Generating feature specifications', 30);
    const features = await generateFeatureSpecs(data, coreAnalysis, provider);
    onProgress?.('Feature specifications complete', 40);

    // Batch 3: Development Plan (55%)
    onProgress?.('Creating development timeline', 45);
    const milestones = await generateDevelopmentPlan(data, coreAnalysis, features, provider);
    onProgress?.('Development plan complete', 55);

    // Batch 4-6 can run in parallel
    onProgress?.('Generating diagrams', 60);

    const [architectureDiagram, userFlowDiagram, databaseERD] = await Promise.all([
      generateArchitectureDiagram(coreAnalysis, provider), // Batch 4 (70%)
      generateUserFlowDiagram(features, provider), // Batch 5 (85%)
      generateDatabaseERD(coreAnalysis, features, provider), // Batch 6 (95%)
    ]);

    onProgress?.('Finalizing project plan', 95);

    // Assemble complete plan
    const projectPlan: ProjectPlan = {
      ...coreAnalysis,
      detailedFeatures: features,
      developmentPlan: { milestones },
      systemArchitectureMermaid: architectureDiagram,
      userFlowMermaid: userFlowDiagram,
      databaseERDMermaid: databaseERD,
    };

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`🎉 Batched generation complete in ${elapsed}s`);
    onProgress?.('Project plan generated successfully', 100);

    return projectPlan;
  } catch (error: any) {
    console.error('❌ Batched generation failed:', error);
    throw new Error(`Failed to generate project plan: ${error.message}`);
  }
};
