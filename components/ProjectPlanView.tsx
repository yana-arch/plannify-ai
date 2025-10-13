import React, { useState, useEffect, useRef } from 'react';
import type { ProjectPlan, FeatureSpecification, ReportTemplate, ReportType, ProjectInputData } from '../types';
import { Card, Button } from './ui';
import { DownloadIcon, WandSparklesIcon, TerminalSquareIcon, LightbulbIcon, BriefcaseIcon } from './icons';
import { enhanceFeatureSpecification, generateReport, regenerateProjectPlan } from '../services/geminiService';

// --- Utility function to format plan for export ---
const formatPlanToMarkdown = (plan: ProjectPlan, projectName: string): string => {
  let md = `# Project Plan: ${projectName}\n\n`;

  md += `## 1. Project Summary\n${plan.summary}\n\n`;

  md += `## 2. Key Components\n`;
  plan.keyComponents.forEach(c => md += `- ${c}\n`);
  md += '\n';

  md += `## 3. Recommended Technology Stack\n`;
  md += `- **Frontend:** ${plan.recommendedTechStack.frontend.join(', ')}\n`;
  md += `- **Backend:** ${plan.recommendedTechStack.backend.join(', ')}\n`;
  md += `- **Database:** ${plan.recommendedTechStack.database.join(', ')}\n`;
  md += `- **Other:** ${plan.recommendedTechStack.other.join(', ')}\n\n`;

  md += `## 4. Potential Challenges\n`;
  plan.potentialChallenges.forEach(c => md += `- ${c}\n`);
  md += '\n';

  md += `## 5. Potential Opportunities\n`;
  plan.potentialOpportunities.forEach(o => md += `- ${o}\n`);
  md += '\n';

  md += `## 6. Detailed Feature Specifications\n`;
  plan.detailedFeatures.forEach(f => {
    md += `### 6.1 ${f.name}\n`;
    md += `${f.description}\n`;
    md += `- **Main Functions:**\n`;
    f.mainFunctions.forEach(mf => md += `  - ${mf}\n`);
    md += `- **Sub-Features:**\n`;
    f.subFeatures.forEach(sf => md += `  - ${sf}\n`);
    md += '\n';
  });

  md += `## 7. Development Plan (Milestones)\n`;
  plan.developmentPlan.milestones.forEach(m => {
    md += `### 7.1 ${m.name}\n`;
    md += `${m.description}\n`;
    md += `**Key Tasks:**\n`;
    m.tasks.forEach(t => md += `- ${t}\n`);
    md += '\n';
  });

  md += `## 8. System Architecture Diagram (Mermaid JS)\n`;
  md += '```mermaid\n';
  md += plan.systemArchitectureMermaid;
  md += '\n```\n';

  md += `## 9. User Flow Diagram (Mermaid JS)\n`;
  md += '```mermaid\n';
  md += plan.userFlowMermaid;
  md += '\n```\n';

  return md;
};

const downloadAsMarkdown = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};


const PlanSubNav: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void; }> = ({ activeTab, setActiveTab }) => {
    const navItems = ['Overview', 'Features', 'Development', 'Architecture', 'Workflow', 'Reports'];
    return (
        <aside className="w-56 flex-shrink-0 p-4 border-r border-brand-border">
            <nav className="space-y-1">
                {navItems.map(item => (
                    <button
                        key={item}
                        onClick={() => setActiveTab(item)}
                        className={`w-full text-left flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeTab === item
                            ? 'text-brand-text-primary bg-brand-surface'
                            : 'text-brand-text-secondary hover:bg-brand-surface hover:text-brand-text-primary'
                        }`}
                    >
                        {item}
                    </button>
                ))}
            </nav>
        </aside>
    );
};

const OverviewTab: React.FC<{ 
    plan: ProjectPlan;
    projectInput: ProjectInputData;
    onPlanUpdate: (newPlan: ProjectPlan) => void;
}> = ({ plan, projectInput, onPlanUpdate }) => {
    const [isEvolving, setIsEvolving] = useState(false);
    const [evolvePrompt, setEvolvePrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleEvolveToggle = () => setIsEvolving(!isEvolving);

    const handleRegenerate = async () => {
        if (!evolvePrompt.trim()) {
            setError("Please enter a prompt to evolve the plan.");
            return;
        }
        setIsGenerating(true);
        setError(null);
        try {
            const newPlan = await regenerateProjectPlan(plan, projectInput, evolvePrompt);
            onPlanUpdate(newPlan);
            setIsEvolving(false);
            setEvolvePrompt('');
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    return (
        <div className="space-y-8">
            <Card>
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">AI-Generated Project Summary</h3>
                        <p className="text-brand-text-secondary">{plan.summary}</p>
                    </div>
                    <Button variant="secondary" className="!px-2 !py-1 text-xs flex-shrink-0" onClick={handleEvolveToggle}>
                        <WandSparklesIcon className="h-4 w-4 mr-1.5" />
                        Evolve
                    </Button>
                </div>

                {isEvolving && (
                    <div className="mt-4 pt-4 border-t border-brand-border/50 space-y-3">
                       <label htmlFor="evolve-prompt" className="block text-sm font-medium text-brand-text-secondary">How should the AI evolve this plan?</label>
                      <input
                        id="evolve-prompt"
                        type="text"
                        value={evolvePrompt}
                        onChange={(e) => setEvolvePrompt(e.target.value)}
                        placeholder="e.g., Suggest alternative backend technologies"
                        className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      />
                      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="secondary" onClick={handleEvolveToggle}>Cancel</Button>
                        <Button onClick={handleRegenerate} isLoading={isGenerating}>
                          {isGenerating ? "Evolving..." : "Regenerate Plan"}
                        </Button>
                      </div>
                    </div>
                )}
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-semibold mb-2">Identified Key Components</h3>
                    <ul className="list-decimal list-inside space-y-1 text-brand-text-secondary">
                        {plan.keyComponents.map((comp, i) => <li key={i}>{comp}</li>)}
                    </ul>
                </Card>
                 <Card>
                    <h3 className="text-lg font-semibold mb-2">Recommended Technology Stack</h3>
                    <div className="text-sm text-brand-text-secondary space-y-1">
                        <p><strong>Frontend:</strong> {plan.recommendedTechStack.frontend.join(', ')}</p>
                        <p><strong>Backend:</strong> {plan.recommendedTechStack.backend.join(', ')}</p>
                        <p><strong>Database:</strong> {plan.recommendedTechStack.database.join(', ')}</p>
                        <p><strong>Other:</strong> {plan.recommendedTechStack.other.join(', ')}</p>
                    </div>
                </Card>
                <Card>
                    <h3 className="text-lg font-semibold mb-2">Potential Challenges</h3>
                     <ul className="list-disc list-inside space-y-1 text-brand-text-secondary">
                        {plan.potentialChallenges.map((challenge, i) => <li key={i}>{challenge}</li>)}
                    </ul>
                </Card>
                <Card>
                    <h3 className="text-lg font-semibold mb-2">Potential Opportunities</h3>
                     <ul className="list-disc list-inside space-y-1 text-brand-text-secondary">
                        {plan.potentialOpportunities.map((opp, i) => <li key={i}>{opp}</li>)}
                    </ul>
                </Card>
            </div>
        </div>
    );
};

const FeatureCard: React.FC<{
  feature: FeatureSpecification;
  projectContext: { name: string; description: string };
  onUpdate: (updatedFeature: FeatureSpecification) => void;
}> = ({ feature, projectContext, onUpdate }) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnhanceToggle = () => {
    setIsEnhancing(!isEnhancing);
    setError(null);
    setPrompt('');
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt to enhance the feature.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const updatedFeature = await enhanceFeatureSpecification(feature, prompt, projectContext);
      onUpdate(updatedFeature);
      setIsEnhancing(false);
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-grow">
          <h4 className="text-md font-semibold text-brand-primary-hover mb-2">{feature.name}</h4>
          <p className="text-sm text-brand-text-secondary mb-4 whitespace-pre-wrap">{feature.description}</p>
        </div>
        <Button variant="secondary" className="!px-2 !py-1 text-xs flex-shrink-0" onClick={handleEnhanceToggle}>
          <WandSparklesIcon className="h-4 w-4 mr-1.5" />
          Enhance
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <h5 className="font-semibold text-brand-text-primary mb-1">Main Functions</h5>
          <ul className="list-disc list-inside text-brand-text-secondary space-y-1">
            {feature.mainFunctions.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
        <div>
          <h5 className="font-semibold text-brand-text-primary mb-1">Sub-Features</h5>
          <ul className="list-disc list-inside text-brand-text-secondary space-y-1">
            {feature.subFeatures.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
      </div>

      {isEnhancing && (
        <div className="mt-4 pt-4 border-t border-brand-border/50 space-y-3">
           <label htmlFor={`enhance-prompt-${feature.name.replace(/\s+/g, '-')}`} className="block text-sm font-medium text-brand-text-secondary">How should the AI enhance this feature?</label>
          <input
            id={`enhance-prompt-${feature.name.replace(/\s+/g, '-')}`}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Add user stories for this feature"
            className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={handleEnhanceToggle}>Cancel</Button>
            <Button onClick={handleGenerate} isLoading={isGenerating}>
              {isGenerating ? "Enhancing..." : "Generate"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};


const FeaturesTab: React.FC<{
  plan: ProjectPlan;
  projectContext: { name: string; description: string };
  onFeatureUpdate: (featureIndex: number, updatedFeature: FeatureSpecification) => void;
}> = ({ plan, projectContext, onFeatureUpdate }) => (
    <div className="space-y-6">
        <h3 className="text-xl font-bold">Project Features & Specifications</h3>
        {plan.detailedFeatures.map((feature, i) => (
          <FeatureCard 
            key={`${i}-${feature.name}`} 
            feature={feature} 
            projectContext={projectContext}
            onUpdate={(updatedFeature) => onFeatureUpdate(i, updatedFeature)}
          />
        ))}
    </div>
);

const DevelopmentTab: React.FC<{ plan: ProjectPlan }> = ({ plan }) => (
    <div className="space-y-6">
        <h3 className="text-xl font-bold">Development Plan</h3>
        {plan.developmentPlan.milestones.map((milestone, i) => (
            <Card key={i}>
                <h4 className="text-md font-semibold text-brand-primary-hover mb-2">{i+1}. {milestone.name}</h4>
                <p className="text-sm text-brand-text-secondary mb-4">{milestone.description}</p>
                <div>
                    <h5 className="font-semibold text-brand-text-primary mb-1 text-sm">Key Tasks</h5>
                    <ul className="list-disc list-inside text-sm text-brand-text-secondary">
                        {milestone.tasks.map((task, ti) => <li key={ti}>{task}</li>)}
                    </ul>
                </div>
            </Card>
        ))}
    </div>
);

const ArchitectureTab: React.FC<{ plan: ProjectPlan }> = ({ plan }) => {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeMermaid = async () => {
      // @ts-ignore - mermaid is global from CDN
      const mermaid = window.mermaid;
      if (mermaidRef.current && plan.systemArchitectureMermaid) {
        try {
          mermaid.initialize({ startOnLoad: false, theme: 'dark' });
          const { svg } = await mermaid.render('mermaid-graph', plan.systemArchitectureMermaid);
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = svg;
          }
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          if (mermaidRef.current) {
             mermaidRef.current.innerText = 'Error rendering diagram. Check console for details.';
          }
        }
      }
    };
    initializeMermaid();
  }, [plan.systemArchitectureMermaid]);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">System Architecture Diagram</h3>
      <Card className="flex justify-center items-center p-8 bg-brand-bg min-h-[300px]">
         <div ref={mermaidRef} key={plan.systemArchitectureMermaid} className="mermaid-container">
            {/* Mermaid will render here */}
         </div>
      </Card>
    </div>
  );
};

const WorkflowTab: React.FC<{ plan: ProjectPlan }> = ({ plan }) => {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeMermaid = async () => {
      // @ts-ignore - mermaid is global from CDN
      const mermaid = window.mermaid;
      if (mermaidRef.current && plan.userFlowMermaid) {
        try {
          mermaid.initialize({ startOnLoad: false, theme: 'dark' });
          const { svg } = await mermaid.render('mermaid-graph-flow', plan.userFlowMermaid);
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = svg;
          }
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          if (mermaidRef.current) {
             mermaidRef.current.innerText = 'Error rendering diagram. Check console for details.';
          }
        }
      }
    };
    initializeMermaid();
  }, [plan.userFlowMermaid]);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Primary User Flow Diagram</h3>
       <p className="text-brand-text-secondary">
        This diagram illustrates a key user journey or process within the application, providing insight into the user experience from a high level.
      </p>
      <Card className="flex justify-center items-center p-8 bg-brand-bg min-h-[300px]">
         <div ref={mermaidRef} key={plan.userFlowMermaid} className="mermaid-container">
            {/* Mermaid will render here */}
         </div>
      </Card>
    </div>
  );
};

const reportTemplates: ReportTemplate[] = [
  {
    id: 'technical_spec',
    title: 'Technical Specification',
    description: 'A detailed document for the engineering team, covering architecture, data models, and API design.',
    persona: 'For Engineers',
    icon: TerminalSquareIcon,
  },
  {
    id: 'product_brief',
    title: 'Product Brief',
    description: 'A concise summary for stakeholders, outlining the product\'s purpose, features, and market goals.',
    persona: 'For Product Managers',
    icon: LightbulbIcon,
  },
  {
    id: 'executive_summary',
    title: 'Executive Summary',
    description: 'A high-level overview for leadership and investors, focusing on business value and strategic goals.',
    persona: 'For Leadership',
    icon: BriefcaseIcon,
  },
];

const ReportsTab: React.FC<{ plan: ProjectPlan; projectName: string }> = ({ plan, projectName }) => {
  const [loadingReport, setLoadingReport] = useState<ReportType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async (template: ReportTemplate) => {
    setLoadingReport(template.id);
    setError(null);
    try {
      const reportContent = await generateReport(plan, projectName, template.id);
      const filename = `${projectName.replace(/\s+/g, '_')}_${template.id}.md`;
      downloadAsMarkdown(reportContent, filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setLoadingReport(null);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Generate Project Reports</h3>
      <p className="text-brand-text-secondary">
        Select a template to generate a tailored report using AI. The report will be downloaded as a Markdown file.
      </p>
      {error && (
        <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-md">{error}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTemplates.map((template) => (
          <Card key={template.id} className="flex flex-col">
            <div className="flex items-start gap-4 mb-3">
              <div className="p-2 bg-brand-border rounded-lg">
                <template.icon className="h-6 w-6 text-brand-primary-hover" />
              </div>
              <div>
                <h4 className="font-semibold text-brand-text-primary">{template.title}</h4>
                <p className="text-xs font-medium text-brand-primary">{template.persona}</p>
              </div>
            </div>
            <p className="text-sm text-brand-text-secondary flex-grow mb-6">{template.description}</p>
            <Button
              onClick={() => handleGenerateReport(template)}
              isLoading={loadingReport === template.id}
              className="mt-auto w-full"
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              {loadingReport === template.id ? 'Generating...' : 'Generate & Download'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};


export const ProjectPlanView: React.FC<{
  plan: ProjectPlan,
  projectName: string,
  projectInput: ProjectInputData;
  onFeatureUpdate: (featureIndex: number, updatedFeature: FeatureSpecification) => void;
  onPlanUpdate: (newPlan: ProjectPlan) => void;
}> = ({ plan, projectName, projectInput, onFeatureUpdate, onPlanUpdate }) => {
    const [activeTab, setActiveTab] = useState('Overview');

    const handleExport = () => {
      const markdownContent = formatPlanToMarkdown(plan, projectName);
      downloadAsMarkdown(markdownContent, `${projectName.replace(/\s+/g, '_')}_Plan.md`);
    };

    const renderContent = () => {
        const projectContext = { name: projectName, description: plan.summary };
        switch (activeTab) {
            case 'Overview':
                return <OverviewTab plan={plan} projectInput={projectInput} onPlanUpdate={onPlanUpdate} />;
            case 'Features':
                return <FeaturesTab plan={plan} projectContext={projectContext} onFeatureUpdate={onFeatureUpdate} />;
            case 'Development':
                return <DevelopmentTab plan={plan} />;
            case 'Architecture':
                return <ArchitectureTab plan={plan} />;
            case 'Workflow':
                return <WorkflowTab plan={plan} />;
            case 'Reports':
                return <ReportsTab plan={plan} projectName={projectName} />;
            default:
                return <OverviewTab plan={plan} projectInput={projectInput} onPlanUpdate={onPlanUpdate} />;
        }
    };

    return (
        <div className="flex flex-col flex-grow bg-brand-surface/50 backdrop-blur-lg border border-brand-border/50 rounded-xl shadow-2xl p-4 w-full">
            <header className="flex justify-between items-center border-b border-brand-border pb-4 mb-4 px-4">
              <h2 className="text-xl font-bold text-brand-text-primary">{projectName} - Project Plan</h2>
              <Button variant="secondary" onClick={handleExport}>
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export Plan
              </Button>
            </header>
            <div className="flex flex-grow">
                <PlanSubNav activeTab={activeTab} setActiveTab={setActiveTab} />
                <main className="flex-grow p-6 overflow-y-auto max-h-[calc(100vh-14rem)]">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};