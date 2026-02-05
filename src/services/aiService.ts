import { GoogleGenAI, Type } from '@google/genai';
import type {
  ProjectInputData,
  ProjectPlan,
  FeatureSpecification,
  ReportType,
  Milestone,
  Priority,
} from '../types';
import type { APIProvider } from '../types';
import { cacheService } from './cacheService';
import { retryService } from './retryService';

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
  description:
    'A high-level development plan with milestones and associated tasks, including start dates and durations for a Gantt chart.',
};

const planSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: 'A concise, AI-generated summary of the project.',
    },
    keyComponents: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'A list of the main functional or architectural components.',
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
      description: 'Potential technical or business challenges.',
    },
    potentialOpportunities: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Potential opportunities for growth, expansion, or unique value propositions.',
    },
    detailedFeatures: {
      type: Type.ARRAY,
      items: featureSpecificationSchema,
      description: 'A detailed breakdown of each core requirement into a feature specification.',
    },
    developmentPlan: developmentPlanSchema,
    systemArchitectureMermaid: {
      type: Type.STRING,
      description:
        'A Mermaid.js syntax string for a top-down (graph TD) system architecture diagram. It should visualize the key components and their interactions.',
    },
    userFlowMermaid: {
      type: Type.STRING,
      description:
        "A Mermaid.js syntax string for a user flow diagram (using 'flowchart LR' or 'graph LR'). It should visualize a primary user journey, like registration and onboarding, or a core interaction loop.",
    },
    databaseERDMermaid: {
      type: Type.STRING,
      description:
        "A Mermaid.js syntax string for an Entity-Relationship Diagram (ERD) showing the database schema. Use 'erDiagram' syntax to illustrate tables, their columns, and relationships with proper cardinality.",
    },
  },
  required: [
    'summary',
    'keyComponents',
    'recommendedTechStack',
    'potentialChallenges',
    'potentialOpportunities',
    'detailedFeatures',
    'developmentPlan',
    'systemArchitectureMermaid',
    'userFlowMermaid',
    'databaseERDMermaid',
  ],
};

const coreRequirementSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      description: { type: Type.STRING },
      priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
    },
    required: ['description', 'priority'],
  },
};

// Abstract base class for AI providers
abstract class AIProvider {
  constructor(protected provider: APIProvider) {}

  abstract generateContent(prompt: string, options?: any): Promise<any>;
  abstract getModelName(): string;
}

// Gemini provider implementation
class GeminiProvider extends AIProvider {
  private ai: GoogleGenAI | null = null;
  private isCustomBaseUrl: boolean = false;
  private readonly DEFAULT_BASE_URL = 'https://generativelanguage.googleapis.com';

  constructor(provider: APIProvider) {
    super(provider);
    // Check if a custom base URL is provided and different from the default
    this.isCustomBaseUrl =
      !!provider.baseUrl && !provider.baseUrl.includes('generativelanguage.googleapis.com');

    if (!this.isCustomBaseUrl) {
      this.ai = new GoogleGenAI({ apiKey: provider.apiKey });
    }
  }

  async generateContent(prompt: string, options?: any) {
    if (this.isCustomBaseUrl) {
      // Use REST API for custom Base URL (proxies)
      console.log('🚀 Gemini (Custom): Sending request to', this.provider.baseUrl);

      const baseUrl = this.provider.baseUrl.replace(/\/$/, ''); // Remove trailing slash
      const url = `${baseUrl}/v1beta/models/${this.provider.model}:generateContent?key=${this.provider.apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: options,
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini Custom API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Map REST response to ensure compatibility
      // The REST API returns { candidates: [ { content: { parts: [ { text: "..." } ] } } ] }
      // We need to return an object that aligns with what the service expects (data.text() or similar check)
      // But looking at generateProjectPlan, for Gemini it expects `response.text()` function or property.
      // Since we are returning a raw object here, we need to adapt the handle in generateProjectPlan OR
      // we can return a mock object that has a text() function.

      const generatedText =
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts
          ? data.candidates[0].content.parts.map((p: any) => p.text).join('')
          : '';

      return {
        ...data,
        text: generatedText,
      };
    } else {
      // Use official SDK for default URL
      if (!this.ai) throw new Error('Gemini SDK not initialized');

      const result = await this.ai.models.generateContent({
        model: this.provider.model,
        contents: prompt,
        config: options,
      });
      return result;
    }
  }

  getModelName(): string {
    return this.provider.model;
  }
}

// OpenRouter provider implementation
class OpenRouterProvider extends AIProvider {
  async generateContent(prompt: string, options?: any) {
    console.log('🚀 OpenRouter: Sending request to', `${this.provider.baseUrl}/chat/completions`);
    console.log('📋 OpenRouter: Model:', this.provider.model);
    console.log('🔑 OpenRouter: API Key prefix:', this.provider.apiKey.substring(0, 10) + '...');

    const response = await fetch(`${this.provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.provider.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'PlannifyAI',
      },
      body: JSON.stringify({
        model: this.provider.model,
        messages: [{ role: 'user', content: prompt }],
        ...options,
      }),
    });

    console.log('📡 OpenRouter: Response status:', response.status);
    console.log('📡 OpenRouter: Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorText: string;
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        const errorData = await response.json();
        errorText = JSON.stringify(errorData, null, 2);
        console.error('❌ OpenRouter: JSON error response:', errorText);
      } else {
        errorText = await response.text();
        console.error('❌ OpenRouter: HTML/Text error response:', errorText.substring(0, 500));
      }

      throw new Error(
        `OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const responseData = await response.json();
    console.log('📦 OpenRouter: Raw response structure:', JSON.stringify(responseData, null, 2));

    return responseData;
  }

  getModelName(): string {
    return this.provider.model;
  }
}

// Ollama provider implementation
class OllamaProvider extends AIProvider {
  async generateContent(prompt: string, options?: any) {
    const response = await fetch(`${this.provider.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.provider.model,
        prompt: prompt,
        stream: false,
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    return await response.json();
  }

  getModelName(): string {
    return this.provider.model;
  }
}

// Anthropic provider implementation
class AnthropicProvider extends AIProvider {
  async generateContent(prompt: string, options?: any) {
    const response = await fetch(`${this.provider.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': this.provider.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.provider.model,
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    return await response.json();
  }

  getModelName(): string {
    return this.provider.model;
  }
}

// OpenAI provider implementation
class OpenAIProvider extends AIProvider {
  async generateContent(prompt: string, options?: any) {
    const baseUrl = this.provider.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    console.log('🚀 OpenAI: Sending request to', `${baseUrl}/chat/completions`);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.provider.model,
        messages: [{ role: 'user', content: prompt }],
        ...options,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  }

  getModelName(): string {
    return this.provider.model;
  }
}

// Factory to create provider instances
class AIProviderFactory {
  static createProvider(provider: APIProvider): AIProvider {
    switch (provider.type) {
      case 'gemini':
        return new GeminiProvider(provider);
      case 'openrouter':
        return new OpenRouterProvider(provider);
      case 'ollama':
        return new OllamaProvider(provider);
      case 'anthropic':
        return new AnthropicProvider(provider);
      case 'openai':
        return new OpenAIProvider(provider);
      case 'custom':
        // For custom providers, default to OpenRouter-like API
        return new OpenRouterProvider(provider);
      default:
        throw new Error(`Unsupported provider type: ${provider.type}`);
    }
  }
}

// Main AI Service class
class AIService {
  private provider: AIProvider;

  constructor(provider: APIProvider) {
    this.provider = AIProviderFactory.createProvider(provider);
  }

  async generateContent(prompt: string, options?: any): Promise<any> {
    return await this.provider.generateContent(prompt, options);
  }

  getModelName(): string {
    return this.provider.getModelName();
  }
}

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

// Helper function to clean markdown code blocks from AI responses
const cleanMarkdownCodeBlocks = (text: string): string => {
  if (!text) return text;

  // Remove markdown code blocks that wrap JSON
  // Pattern: ```json\n{content}\n```
  let cleaned = text.replace(/^```(?:json|JSON)?\s*\n?/gm, '').replace(/\n?```\s*$/gm, '');

  // Also handle cases where the AI might use different code block markers
  cleaned = cleaned.replace(/^```\s*\n?/gm, '').replace(/\n?```\s*$/gm, '');

  // Trim whitespace
  return cleaned.trim();
};

const buildPrompt = (data: ProjectInputData): string => {
  const coreModulesSection =
    data.coreModules && data.coreModules.length > 0
      ? `
    Core Modules:
    ${data.coreModules
      .map(
        (module) => `
      - Module: ${sanitizeForJSON(module.moduleName)}
        Description: ${sanitizeForJSON(module.description)}
        Flows: ${module.flows.map((flow) => sanitizeForJSON(flow)).join(', ')}
    `,
      )
      .join('')}
  `
      : '';

  const rolePermissionsSection =
    data.rolePermissions && data.rolePermissions.length > 0
      ? `
    Role & Permissions:
    ${data.rolePermissions
      .map(
        (role) => `
      - Role: ${role.role}
        Permissions: ${role.permissions.join(', ')}
    `,
      )
      .join('')}
  `
      : '';

  const standardFlowsSection =
    data.standardFlows && data.standardFlows.length > 0
      ? `
    Standard Flows:
    ${data.standardFlows
      .map(
        (flow) => `
      - Flow: ${flow.flowName}
        Steps: ${flow.steps.join(' → ')}
    `,
      )
      .join('')}
  `
      : '';

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
    ${data.coreRequirements.map((req) => `- ${req.description} (Priority: ${req.priority})`).join('\n    ')}

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
    - \` }o\` or \`o{ \` : one or more

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
    - **CORRECT:** 'User { int id PK "Primary key for user"; varchar name "User's full name" }'

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

export const generateProjectPlan = async (
  data: ProjectInputData,
  provider: APIProvider,
): Promise<ProjectPlan> => {
  // Check cache first
  const cacheKey = cacheService.generateProjectPlanKey(data, provider);
  const cachedResult = cacheService.get<ProjectPlan>(cacheKey);
  if (cachedResult) {
    console.log('✅ Returning cached project plan');
    return cachedResult;
  }

  const aiService = new AIService(provider);
  const prompt = buildPrompt(data);

  try {
    const response = await retryService.executeAIOperation(async () => {
      console.log('🧠 Sending request to AI for plan generation...');
      const result = await aiService.generateContent(prompt, {
        responseMimeType: 'application/json',
        responseSchema: planSchema,
      });
      return result;
    }, 'Project Plan Generation');

    console.log('📝 Processing AI response...');
    console.log('🔍 Raw response from provider:', JSON.stringify(response, null, 2));

    let jsonText: string;

    // Handle different response formats based on provider
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
        response.choices?.[0]?.text ||
        '';

      // Additional fallback for OpenRouter specific structure
      if (!jsonText && response.choices?.[0]) {
        jsonText = response.choices[0].message?.content || response.choices[0].text || '';
      }
    } else if (provider.type === 'ollama') {
      jsonText = response.response || '';
    } else {
      jsonText = response.text || response.content || '';
    }

    console.log(
      '📄 Extracted jsonText:',
      jsonText.substring(0, 500) + (jsonText.length > 500 ? '...' : ''),
    );

    // Clean markdown code blocks from the response
    jsonText = cleanMarkdownCodeBlocks(jsonText);

    console.log(
      '🧹 After cleaning markdown:',
      jsonText.substring(0, 500) + (jsonText.length > 500 ? '...' : ''),
    );

    // Validate that we have content before parsing
    if (!jsonText || jsonText.trim() === '') {
      throw new Error(`Empty response from ${provider.type} provider. No content to parse.`);
    }

    let plan: ProjectPlan;
    try {
      plan = JSON.parse(jsonText);
      console.log('✅ JSON parsing successful');
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError);
      console.error('❌ Failed jsonText:', jsonText);

      // Try to extract JSON from a larger text block if parsing failed
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          plan = JSON.parse(jsonMatch[0]);
          console.log('✅ JSON extracted and parsed from text block');
        } catch {
          throw new Error(
            `Failed to parse JSON response from ${provider.type}: ${parseError.message}. Extracted content: ${jsonMatch[0].substring(0, 200)}...`,
          );
        }
      } else {
        throw new Error(
          `Invalid JSON response from ${provider.type}: ${parseError.message}. Response content: ${jsonText.substring(0, 200)}...`,
        );
      }
    }

    // Validate Mermaid diagrams (removed aggressive post-processing)
    if (plan.systemArchitectureMermaid) {
      console.log('🔍 Validating architecture diagram...');
      plan.systemArchitectureMermaid = validateMermaidCode(plan.systemArchitectureMermaid);
    }
    if (plan.userFlowMermaid) {
      console.log('🔍 Validating user flow diagram...');
      plan.userFlowMermaid = validateMermaidCode(plan.userFlowMermaid);
    }
    if (plan.databaseERDMermaid) {
      console.log('🔍 Validating database ERD diagram...');
      plan.databaseERDMermaid = validateMermaidERDCode(plan.databaseERDMermaid);
    }

    // Cache the result with longer TTL for complex operations
    cacheService.set(cacheKey, plan, 1000 * 60 * 60); // 1 hour TTL for plans
    console.log('💾 Plan cached successfully');

    console.log('🎉 Project plan generation completed successfully!');
    return plan;
  } catch (error) {
    console.error('❌ Error generating project plan:', error);

    // Provide more helpful error messages
    if (error.name === 'AIRetryError') {
      const originalError = (error as any).originalError;
      if (originalError?.message?.includes('quota')) {
        throw new Error('AI service quota exceeded. Please try again later or contact support.');
      }
      if (originalError?.message?.includes('rate limit')) {
        throw new Error(
          'AI service is temporarily overloaded. Please wait a moment and try again.',
        );
      }
    }

    throw new Error(
      `Failed to generate project plan: ${error.message}. Please check your input data and try again.`,
    );
  }
};

// ... existing code for other functions will be moved here later
// For now, keeping the core functionality focused on the main plan generation

const validateMermaidCode = (code: string): string => {
  if (!code) return code;

  // Only perform minimal validation and basic cleanup
  let validatedCode = code.trim();

  // Convert escaped newlines to actual newlines
  validatedCode = validatedCode.replace(/\\n/g, '\n');

  // Ensure the code starts with proper diagram declaration
  if (!validatedCode.match(/^(graph|flowchart)\s+(TD|LR|TB|BT|RL)/m)) {
    // If it doesn't start with proper declaration, try to add one
    if (validatedCode.includes('-->') || validatedCode.includes('->')) {
      validatedCode = `graph TD\n${validatedCode}`;
    } else if (validatedCode.includes('flowchart')) {
      // Already has flowchart, keep as is
    } else {
      validatedCode = `flowchart LR\n${validatedCode}`;
    }
  }

  // Basic cleanup: remove excessive whitespace but preserve structure
  validatedCode = validatedCode
    .replace(/[ \t]+$/gm, '') // Remove trailing whitespace
    .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
    .trim();

  return validatedCode;
};

const validateMermaidERDCode = (code: string): string => {
  if (!code) return code;

  // Only perform minimal validation and basic cleanup
  let validatedCode = code.trim();

  // Convert escaped newlines to actual newlines
  validatedCode = validatedCode.replace(/\\n/g, '\n');

  // Ensure the code starts with erDiagram
  if (!validatedCode.startsWith('erDiagram')) {
    validatedCode = `erDiagram\n${validatedCode}`;
  }

  // Basic cleanup: remove excessive whitespace but preserve structure
  validatedCode = validatedCode
    .replace(/[ \t]+$/gm, '') // Remove trailing whitespace
    .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
    .trim();

  return validatedCode;
};

const buildRegeneratePrompt = (
  currentPlan: ProjectPlan,
  originalInput: ProjectInputData,
  userPrompt: string,
): string => {
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
  userPrompt: string,
  provider: APIProvider,
): Promise<ProjectPlan> => {
  const aiService = new AIService(provider);
  const prompt = buildRegeneratePrompt(currentPlan, originalInput, userPrompt);

  try {
    const response = await retryService.executeAIOperation(async () => {
      console.log('🧠 Sending request to AI for plan regeneration...');
      const result = await aiService.generateContent(prompt, {
        responseMimeType: 'application/json',
        responseSchema: planSchema,
      });
      return result;
    }, 'Project Plan Regeneration');

    console.log('📝 Processing AI response...');
    let jsonText: string;

    // Handle different response formats based on provider
    if (provider.type === 'gemini') {
      jsonText = response.text.trim();
    } else if (
      provider.type === 'openrouter' ||
      provider.type === 'anthropic' ||
      provider.type === 'openai'
    ) {
      jsonText = response.choices?.[0]?.message?.content || response.content?.[0]?.text || '';
    } else if (provider.type === 'ollama') {
      jsonText = response.response || '';
    } else {
      jsonText = response.text || response.content || '';
    }

    // Clean markdown code blocks from the response
    jsonText = cleanMarkdownCodeBlocks(jsonText);

    const plan: ProjectPlan = JSON.parse(jsonText);

    // Validate Mermaid diagrams
    if (plan.systemArchitectureMermaid) {
      plan.systemArchitectureMermaid = validateMermaidCode(plan.systemArchitectureMermaid);
    }
    if (plan.userFlowMermaid) {
      plan.userFlowMermaid = validateMermaidCode(plan.userFlowMermaid);
    }
    if (plan.databaseERDMermaid) {
      plan.databaseERDMermaid = validateMermaidERDCode(plan.databaseERDMermaid);
    }

    console.log('🎉 Project plan regeneration completed successfully!');
    return plan;
  } catch (error) {
    console.error('❌ Error regenerating project plan:', error);
    throw new Error(
      `Failed to regenerate project plan: ${error.message}. Please check your input data and try again.`,
    );
  }
};

const buildEnhanceFeaturePrompt = (
  feature: FeatureSpecification,
  userPrompt: string,
  projectContext: { name: string; description: string },
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
  projectContext: { name: string; description: string },
  provider: APIProvider,
): Promise<FeatureSpecification> => {
  const aiService = new AIService(provider);
  const prompt = buildEnhanceFeaturePrompt(feature, userPrompt, projectContext);

  try {
    const response = await aiService.generateContent(prompt, {
      responseMimeType: 'application/json',
      responseSchema: featureSpecificationSchema,
    });

    let jsonText: string;

    // Handle different response formats based on provider
    if (provider.type === 'gemini') {
      jsonText = response.text.trim();
    } else if (
      provider.type === 'openrouter' ||
      provider.type === 'anthropic' ||
      provider.type === 'openai'
    ) {
      jsonText = response.choices?.[0]?.message?.content || response.content?.[0]?.text || '';
    } else if (provider.type === 'ollama') {
      jsonText = response.response || '';
    } else {
      jsonText = response.text || response.content || '';
    }

    // Clean markdown code blocks from the response
    jsonText = cleanMarkdownCodeBlocks(jsonText);

    const newFeature: FeatureSpecification = JSON.parse(jsonText);
    return newFeature;
  } catch (error) {
    console.error('Error enhancing feature:', error);
    throw new Error('Failed to enhance feature with AI.');
  }
};

const buildOptimizeDevPlanPrompt = (
  milestones: Milestone[],
  userPrompt: string,
  projectContext: { name: string; description: string },
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
  projectContext: { name: string; description: string },
  provider: APIProvider,
): Promise<Milestone[]> => {
  const aiService = new AIService(provider);
  const prompt = buildOptimizeDevPlanPrompt(milestones, userPrompt, projectContext);

  try {
    const response = await aiService.generateContent(prompt, {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          milestones: {
            type: Type.ARRAY,
            items: milestoneSchema,
          },
        },
      },
    });

    let jsonText: string;

    // Handle different response formats based on provider
    if (provider.type === 'gemini') {
      jsonText = response.text.trim();
    } else if (
      provider.type === 'openrouter' ||
      provider.type === 'anthropic' ||
      provider.type === 'openai'
    ) {
      jsonText = response.choices?.[0]?.message?.content || response.content?.[0]?.text || '';
    } else if (provider.type === 'ollama') {
      jsonText = response.response || '';
    } else {
      jsonText = response.text || response.content || '';
    }

    // Clean markdown code blocks from the response
    jsonText = cleanMarkdownCodeBlocks(jsonText);

    const result: { milestones: Milestone[] } = JSON.parse(jsonText);
    return result.milestones;
  } catch (error) {
    console.error('Error optimizing development plan:', error);
    throw new Error('Failed to optimize development plan with AI.');
  }
};

const buildReportPrompt = (
  plan: ProjectPlan,
  projectName: string,
  reportType: ReportType,
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
    ${plan.detailedFeatures
      .map(
        (f) => `
      - Feature: ${f.name}
        Description: ${f.description}
        Main Functions: ${f.mainFunctions.join(', ')}
    `,
      )
      .join('')}
    Development Milestones:
    ${plan.developmentPlan.milestones
      .map(
        (m) => `
      - Milestone: ${m.name}
        Description: ${m.description}
        Tasks: ${m.tasks.join(', ')}
    `,
      )
      .join('')}
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
  reportType: ReportType,
  provider: APIProvider,
): Promise<string> => {
  const aiService = new AIService(provider);
  const prompt = buildReportPrompt(plan, projectName, reportType);

  try {
    const response = await aiService.generateContent(prompt);

    let text: string;

    // Handle different response formats based on provider
    if (provider.type === 'gemini') {
      text = response.text.trim();
    } else if (
      provider.type === 'openrouter' ||
      provider.type === 'anthropic' ||
      provider.type === 'openai'
    ) {
      text = response.choices?.[0]?.message?.content || response.content?.[0]?.text || '';
    } else if (provider.type === 'ollama') {
      text = response.response || '';
    } else {
      text = response.text || response.content || '';
    }

    return text.trim();
  } catch (error) {
    console.error(`Error generating ${reportType} report:`, error);
    throw new Error(`Failed to generate ${reportType} report with AI.`);
  }
};

const buildFixMermaidPrompt = (
  faultyCode: string,
  diagramType: string,
  projectContext: { name: string; description: string },
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

export const critiqueSchema = {
  type: Type.OBJECT,
  properties: {
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of strong points in the plan',
    },
    weaknesses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of weak points or risks',
    },
    suggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Actionable suggestions for improvement',
    },
    score: {
      type: Type.NUMBER,
      description: 'Overall score out of 100',
    },
  },
  required: ['strengths', 'weaknesses', 'suggestions', 'score'],
};

export const generateCritique = async (
  plan: ProjectPlan,
  projectName: string,
  persona: string,
  provider: APIProvider,
): Promise<{ strengths: string[]; weaknesses: string[]; suggestions: string[]; score: number }> => {
  const aiService = new AIService(provider);

  const prompt = `
    You are acting as a ${persona}. Review the following project plan critically.
    
    Project Name: ${projectName}
    Summary: ${plan.summary}
    Key Components: ${plan.keyComponents.join(', ')}
    Tech Stack: ${JSON.stringify(plan.recommendedTechStack)}
    
    Identify strengths, weaknesses, and provide actionable suggestions. Give an overall score (0-100).
    Be specific to your persona.
  `;

  try {
    const response = await retryService.executeAIOperation(async () => {
      const result = await aiService.generateContent(prompt, {
        responseMimeType: 'application/json',
        responseSchema: critiqueSchema,
      });
      return result;
    }, 'Critique Generation');

    // Parse result similarly to other functions
    let jsonText: string;
    if (provider.type === 'gemini') {
      jsonText = response.text.trim();
    } else if (
      provider.type === 'openrouter' ||
      provider.type === 'anthropic' ||
      provider.type === 'openai'
    ) {
      jsonText = response.choices?.[0]?.message?.content || response.content?.[0]?.text || '';
    } else if (provider.type === 'ollama') {
      jsonText = response.response || '';
    } else {
      jsonText = response.text || response.content || '';
    }

    jsonText = cleanMarkdownCodeBlocks(jsonText);
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Critique generation failed:', error);
    throw error;
  }
};

export const fixMermaidCode = async (
  faultyCode: string,
  diagramType: string,
  projectContext: { name: string; description: string },
  provider: APIProvider,
): Promise<string> => {
  const aiService = new AIService(provider);
  const prompt = buildFixMermaidPrompt(faultyCode, diagramType, projectContext);

  try {
    const response = await aiService.generateContent(prompt);

    // Clean up potential markdown fences if the model adds them despite instructions
    let cleanedCode =
      response.text
        ?.trim()
        .replace(/```mermaid/g, '')
        .replace(/```/g, '')
        .trim() || '';

    // Handle different response formats based on provider
    if (provider.type === 'openrouter' || provider.type === 'anthropic') {
      cleanedCode =
        response.choices?.[0]?.message?.content
          ?.replace(/```mermaid/g, '')
          .replace(/```/g, '')
          .trim() || '';
    } else if (provider.type === 'ollama') {
      cleanedCode =
        response.response
          ?.replace(/```mermaid/g, '')
          .replace(/```/g, '')
          .trim() || '';
    }

    // Apply minimal validation instead of aggressive post-processing
    cleanedCode = validateMermaidCode(cleanedCode);

    return cleanedCode;
  } catch (error) {
    console.error('Error fixing Mermaid code:', error);
    throw new Error('Failed to fix diagram with AI.');
  }
};

export const generateCoreRequirements = async (
  projectInfo: Partial<ProjectInputData>,
  provider?: APIProvider,
): Promise<{ description: string; priority: Priority }[]> => {
  // Use generic prompt for requirements
  const prompt = `
    You are a Business Analyst AI. Generate a list of 5-10 core functional requirements for the following project:
    Project Name: ${projectInfo.projectName}
    Description: ${projectInfo.shortDescription}
    Goals: ${projectInfo.businessGoals}
    Target Users: ${projectInfo.targetUsers?.join(', ')}

    Return the response as a JSON array of objects, each with 'description' and 'priority' (High, Medium, Low).
  `;

  // We need a provider. If not passed, we might fail or need a default.
  // For NewProjectWizard, we might not have a provider selected yet if it comes from settings?
  // Actually, NewProjectWizard usually relies on activeProvider from SettingsContext.
  // But wait, the generateCoreRequirements call in NewProjectWizard.tsx uses:
  // const generatedReqs = await generateCoreRequirements(projectInfo);
  // It doesn't pass a provider!

  // I need to update NewProjectWizard to pass the provider, OR handle it here.
  // But aiService usually takes a provider.
  // Let's assume for now I will update NewProjectWizard to pass the provider.

  if (!provider) {
    throw new Error('No AI provider specified.');
  }

  const aiService = new AIService(provider);

  try {
    const response = await aiService.generateContent(prompt, {
      responseMimeType: 'application/json',
      responseSchema: coreRequirementSchema,
    });

    let jsonText: string;
    if (provider.type === 'gemini') {
      jsonText = response.text.trim();
    } else if (provider.type === 'openrouter' || provider.type === 'anthropic') {
      jsonText = response.choices?.[0]?.message?.content || response.content?.[0]?.text || '';
    } else if (provider.type === 'ollama') {
      jsonText = response.response || '';
    } else {
      jsonText = response.text || response.content || '';
    }

    jsonText = cleanMarkdownCodeBlocks(jsonText);
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Error generating requirements:', error);
    throw error;
  }
};
