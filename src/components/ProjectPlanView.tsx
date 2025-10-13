import React, { useState, useEffect, useRef } from 'react';
import type { ProjectPlan, FeatureSpecification, ReportTemplate, ReportType, ProjectInputData, PlanHistoryEntry, Milestone, SavedProject } from '../types';
import { Card, Button, Modal } from './ui';
import { DownloadIcon, WandSparklesIcon, TerminalSquareIcon, LightbulbIcon, BriefcaseIcon, HistoryIcon } from './icons';
import { enhanceFeatureSpecification, generateReport, regenerateProjectPlan, optimizeDevelopmentPlan, fixMermaidCode } from '../geminiService';
import { exportPlanAsDocx, exportReportAsDocx } from '../docxService';
import { useProjects } from '../ProjectContext';

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
    const navItems = ['Overview', 'Features', 'Development', 'Architecture', 'Workflow', 'Reports', 'History'];
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
}> = ({ plan, projectInput }) => {
    const [isEvolving, setIsEvolving] = useState(false);
    const [evolvePrompt, setEvolvePrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const { updateCurrentProjectPlan } = useProjects();

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
            updateCurrentProjectPlan(newPlan);
            setIsEvolving(false);
            setEvolvePrompt('');
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsGenerating(false);
            setShowConfirmModal(false);
        }
    };
    
    return (
        <div className="space-y-8">
            <Modal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleRegenerate}
                title="Confirm Plan Regeneration"
                confirmText="Regenerate"
                isConfirming={isGenerating}
            >
                The AI will regenerate the entire project plan based on your new prompt. This will save the current version to history and replace it. Are you sure you want to continue?
            </Modal>
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
                        <Button onClick={() => setShowConfirmModal(true)} isLoading={isGenerating}>
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
  featureIndex: number;
  projectContext: { name: string; description: string };
}> = ({ feature, featureIndex, projectContext }) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { updateCurrentProjectFeatures } = useProjects();

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
      updateCurrentProjectFeatures(featureIndex, updatedFeature);
      setIsEnhancing(false);
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsGenerating(false);
      setShowConfirmModal(false);
    }
  };

  return (
    <Card className="transition-all duration-300 ease-in-out">
        <Modal
            isOpen={showConfirmModal}
            onClose={() => setShowConfirmModal(false)}
            onConfirm={handleGenerate}
            title="Confirm Feature Enhancement"
            confirmText="Enhance"
            isConfirming={isGenerating}
        >
            The AI will enhance this feature based on your prompt. This will save the current plan to history and replace this feature's details. Are you sure you want to continue?
        </Modal>

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
            <Button onClick={() => setShowConfirmModal(true)} isLoading={isGenerating}>
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
}> = ({ plan, projectContext }) => (
    <div className="space-y-6">
        <h3 className="text-xl font-bold">Project Features & Specifications</h3>
        {plan.detailedFeatures.map((feature, i) => (
          <FeatureCard 
            key={`${i}-${feature.name}`} 
            feature={feature}
            featureIndex={i}
            projectContext={projectContext}
          />
        ))}
    </div>
);

const DevelopmentTab: React.FC<{
  plan: ProjectPlan;
  projectContext: { name: string; description: string };
}> = ({ plan, projectContext }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizePrompt, setOptimizePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { updateCurrentProjectDevPlan } = useProjects();

  const milestones = plan.developmentPlan.milestones || [];

  const handleOptimizeToggle = () => setIsOptimizing(!isOptimizing);

  const handleGenerate = async () => {
    if (!optimizePrompt.trim()) {
      setError("Please enter a prompt to optimize the schedule.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const newMilestones = await optimizeDevelopmentPlan(milestones, optimizePrompt, projectContext);
      updateCurrentProjectDevPlan(newMilestones);
      setIsOptimizing(false);
      setOptimizePrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsGenerating(false);
      setShowConfirmModal(false);
    }
  };

  const parseWeek = (weekStr: string): number => {
    if (!weekStr) return 1;
    const match = weekStr.match(/(\d+)/);
    return match ? parseInt(match[0], 10) : 1;
  };

  const totalWeeks = milestones.reduce((max, milestone) => {
    if (!milestone.estimatedStartDate || !milestone.estimatedDurationWeeks) return max;
    const start = parseWeek(milestone.estimatedStartDate);
    const end = start + milestone.estimatedDurationWeeks;
    return Math.max(max, end);
  }, 1);

  const colors = [
    '#2F81F7', '#3FB950', '#A371F7', '#DB61A2', '#F7B955', '#58A6FF'
  ];

  return (
    <div className="space-y-6">
       <Modal
            isOpen={showConfirmModal}
            onClose={() => setShowConfirmModal(false)}
            onConfirm={handleGenerate}
            title="Confirm Timeline Optimization"
            confirmText="Optimize"
            isConfirming={isGenerating}
        >
            The AI will generate a new development timeline based on your prompt. This will save the current version to history and replace the existing milestones. Are you sure you want to continue?
        </Modal>
      <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold">Development Timeline</h3>
            <p className="text-brand-text-secondary mt-1">
              An AI-generated Gantt chart visualizing the project milestones over an estimated {totalWeeks - 1}-week timeline.
            </p>
          </div>
          <Button variant="secondary" className="!px-2 !py-1 text-xs flex-shrink-0" onClick={handleOptimizeToggle}>
            <WandSparklesIcon className="h-4 w-4 mr-1.5" />
            Optimize with AI
          </Button>
      </div>

      {isOptimizing && (
        <Card>
          <div className="space-y-3">
              <label htmlFor="optimize-prompt" className="block text-sm font-medium text-brand-text-secondary">How should the AI optimize this timeline?</label>
              <input
                id="optimize-prompt"
                type="text"
                value={optimizePrompt}
                onChange={(e) => setOptimizePrompt(e.target.value)}
                placeholder="e.g., Make the timeline more aggressive"
                className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={handleOptimizeToggle}>Cancel</Button>
                <Button onClick={() => setShowConfirmModal(true)} isLoading={isGenerating}>
                  {isGenerating ? "Optimizing..." : "Generate New Timeline"}
                </Button>
              </div>
          </div>
        </Card>
      )}
      
      {milestones.length > 0 ? (
        <div className="w-full overflow-x-auto bg-brand-bg p-4 rounded-lg border border-brand-border">
          <div className="relative" style={{ minWidth: `${totalWeeks * 60}px` }}>
            {/* Week Headers */}
            <div className="grid sticky top-0 bg-brand-bg z-10" style={{ gridTemplateColumns: `repeat(${totalWeeks - 1}, minmax(60px, 1fr))` }}>
              {Array.from({ length: totalWeeks -1 }, (_, i) => (
                <div key={i} className="text-center text-xs font-semibold text-brand-text-secondary py-2 border-b border-r border-brand-border/30">
                  Week {i + 1}
                </div>
              ))}
            </div>

            {/* Grid Lines */}
             <div className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${totalWeeks - 1}, minmax(60px, 1fr))` }}>
              {Array.from({ length: totalWeeks - 1 }, (_, i) => (
                <div key={i} className={`h-full border-r border-brand-border/30`}></div>
              ))}
            </div>

            {/* Milestone Bars */}
            <div className="mt-4 space-y-8 relative">
              {milestones.map((milestone, index) => {
                if (!milestone.estimatedStartDate || !milestone.estimatedDurationWeeks) return null;
                const startWeek = parseWeek(milestone.estimatedStartDate);
                const duration = milestone.estimatedDurationWeeks;
                const endWeek = startWeek + duration;

                return (
                  <div key={index}>
                    <div className="grid w-full relative" style={{ gridTemplateColumns: `repeat(${totalWeeks - 1}, minmax(60px, 1fr))` }}>
                         <div
                          className="h-10 rounded-md flex items-center justify-start px-3 text-white text-sm font-medium shadow-lg hover:opacity-90 transition-opacity duration-200"
                          style={{
                            gridColumn: `${startWeek} / ${endWeek}`,
                            backgroundColor: colors[index % colors.length],
                          }}
                          title={`${milestone.name} | Starts: Week ${startWeek}, Duration: ${duration} weeks`}
                        >
                          <p className="truncate">{milestone.name}</p>
                        </div>
                    </div>
                     <div className="mt-3 ml-2 text-xs text-brand-text-secondary border-l-2 pl-3" style={{borderColor: colors[index % colors.length]}}>
                        <p className="font-semibold text-sm text-brand-text-primary">{milestone.name}</p>
                        <p className="mt-1">{milestone.description}</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                           {milestone.tasks.map((task, i) => <li key={i}>{task}</li>)}
                        </ul>
                     </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <Card>
          <p className="text-brand-text-secondary">No development milestones available to display.</p>
        </Card>
      )}
    </div>
  );
};

const EditableArchitectureTab: React.FC<{
  plan: ProjectPlan;
  projectContext: { name: string; description: string };
}> = ({ plan, projectContext }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState(plan.systemArchitectureMermaid);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isFixing, setIsFixing] = useState(false);
  const [fixError, setFixError] = useState<string | null>(null);
  const { updateCurrentProjectPlan } = useProjects();
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditedCode(plan.systemArchitectureMermaid);
    setRenderError(null);

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
        } catch (error: any) {
          console.error('Mermaid rendering error:', error.str || error.message);
          setRenderError(error.str || error.message || 'Failed to render diagram.');
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = '';
          }
        }
      }
    };

    if (!isEditing) {
      initializeMermaid();
    }
  }, [plan.systemArchitectureMermaid, isEditing]);

  const handleSave = () => {
    const newPlan = { ...plan, systemArchitectureMermaid: editedCode };
    updateCurrentProjectPlan(newPlan);
    setIsEditing(false);
    setRenderError(null);
  };

  const handleCancel = () => {
    setEditedCode(plan.systemArchitectureMermaid);
    setIsEditing(false);
    setFixError(null);
  };

  const handleFixWithAI = async () => {
    setIsFixing(true);
    setFixError(null);
    try {
      const fixedCode = await fixMermaidCode(editedCode, 'system architecture', projectContext);
      setEditedCode(fixedCode);
    } catch (err) {
      setFixError(err instanceof Error ? err.message : 'An unknown AI error occurred.');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">System Architecture Diagram</h3>
        {!isEditing && !renderError && plan.systemArchitectureMermaid && (
          <Button variant="secondary" onClick={() => setIsEditing(true)} className="!py-1 !px-2 text-xs">
            Edit Diagram
          </Button>
        )}
      </div>

      <Card className="bg-brand-bg min-h-[300px]">
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editedCode}
              onChange={(e) => setEditedCode(e.target.value)}
              className="w-full h-64 bg-brand-bg border border-brand-border rounded-md p-3 font-mono text-sm text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="Enter Mermaid.js code here..."
            />
            {fixError && <p className="text-sm text-red-400">{fixError}</p>}
            <div className="flex justify-between items-center">
              <Button onClick={handleFixWithAI} isLoading={isFixing} variant="secondary">
                <WandSparklesIcon className="h-4 w-4 mr-2" />
                Fix with AI
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-center items-center p-8" ref={mermaidRef} key={plan.systemArchitectureMermaid}>
              {/* Mermaid will render here */}
            </div>
            {(renderError || !plan.systemArchitectureMermaid) && (
              <div className="text-center text-brand-text-secondary p-4">
                {renderError ? (
                  <>
                    <p className="font-semibold text-red-400">Diagram Rendering Failed</p>
                    <pre className="mt-2 text-xs text-left bg-brand-surface p-3 rounded-md overflow-x-auto">{renderError}</pre>
                  </>
                ) : (
                  <p>No diagram code provided.</p>
                )}
                <Button variant="secondary" onClick={() => setIsEditing(true)} className="mt-4">
                  Create Diagram
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

const EditableWorkflowTab: React.FC<{
  plan: ProjectPlan;
  projectContext: { name: string; description: string };
}> = ({ plan, projectContext }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState(plan.userFlowMermaid);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isFixing, setIsFixing] = useState(false);
  const [fixError, setFixError] = useState<string | null>(null);
  const { updateCurrentProjectPlan } = useProjects();
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditedCode(plan.userFlowMermaid);
    setRenderError(null);

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
        } catch (error: any) {
          console.error('Mermaid rendering error:', error.str || error.message);
          setRenderError(error.str || error.message || 'Failed to render diagram.');
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = '';
          }
        }
      }
    };

    if (!isEditing) {
      initializeMermaid();
    }
  }, [plan.userFlowMermaid, isEditing]);

  const handleSave = () => {
    const newPlan = { ...plan, userFlowMermaid: editedCode };
    updateCurrentProjectPlan(newPlan);
    setIsEditing(false);
    setRenderError(null);
  };

  const handleCancel = () => {
    setEditedCode(plan.userFlowMermaid);
    setIsEditing(false);
    setFixError(null);
  };

  const handleFixWithAI = async () => {
    setIsFixing(true);
    setFixError(null);
    try {
      const fixedCode = await fixMermaidCode(editedCode, 'user flow', projectContext);
      setEditedCode(fixedCode);
    } catch (err) {
      setFixError(err instanceof Error ? err.message : 'An unknown AI error occurred.');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">Primary User Flow Diagram</h3>
          {!isEditing && !renderError && plan.userFlowMermaid && (
            <Button variant="secondary" onClick={() => setIsEditing(true)} className="!py-1 !px-2 text-xs">
              Edit Diagram
            </Button>
          )}
          <p className="text-brand-text-secondary mt-1">
            This diagram illustrates a key user journey or process within the application, providing insight into the user experience from a high level.
          </p>
        </div>
      </div>

      <Card className="bg-brand-bg min-h-[300px]">
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editedCode}
              onChange={(e) => setEditedCode(e.target.value)}
              className="w-full h-64 bg-brand-bg border border-brand-border rounded-md p-3 font-mono text-sm text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="Enter Mermaid.js code here..."
            />
            {fixError && <p className="text-sm text-red-400">{fixError}</p>}
            <div className="flex justify-between items-center">
              <Button onClick={handleFixWithAI} isLoading={isFixing} variant="secondary">
                <WandSparklesIcon className="h-4 w-4 mr-2" />
                Fix with AI
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-center items-center p-8" ref={mermaidRef} key={plan.userFlowMermaid}>
              {/* Mermaid will render here */}
            </div>
            {(renderError || !plan.userFlowMermaid) && (
              <div className="text-center text-brand-text-secondary p-4">
                {renderError ? (
                  <>
                    <p className="font-semibold text-red-400">Diagram Rendering Failed</p>
                    <pre className="mt-2 text-xs text-left bg-brand-surface p-3 rounded-md overflow-x-auto">{renderError}</pre>
                  </>
                ) : (
                  <p>No diagram code provided.</p>
                )}
                <Button variant="secondary" onClick={() => setIsEditing(true)} className="mt-4">
                  Create Diagram
                </Button>
              </div>
            )}
          </div>
        )}
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
  const [loadingReport, setLoadingReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async (template: ReportTemplate, format: 'md' | 'docx') => {
    setLoadingReport(`${template.id}_${format}`);
    setError(null);
    try {
      const reportContent = await generateReport(plan, projectName, template.id);

      if (format === 'md') {
        const filename = `${projectName.replace(/\s+/g, '_')}_${template.id}.md`;
        downloadAsMarkdown(reportContent, filename);
      } else {
        await exportReportAsDocx(reportContent, projectName, template.title);
      }
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
        Select a template to generate a tailored report using AI. Choose between Markdown (.md) or Microsoft Word (.docx) format.
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
            <div className="flex gap-2 mt-auto w-full">
                <Button
                    variant="secondary"
                    onClick={() => handleGenerateReport(template, 'md')}
                    isLoading={loadingReport === `${template.id}_md`}
                    className="w-full text-xs"
                    >
                    Generate MD
                </Button>
                <Button
                    onClick={() => handleGenerateReport(template, 'docx')}
                    isLoading={loadingReport === `${template.id}_docx`}
                    className="w-full text-xs"
                    >
                    Generate DOCX
                </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const HistoryTab: React.FC<{
    history: PlanHistoryEntry[];
}> = ({ history }) => {
    const { restoreProjectVersion } = useProjects();
    
    if (history.length === 0) {
        return (
             <div className="space-y-6">
                <h3 className="text-xl font-bold">Plan History</h3>
                 <Card>
                    <p className="text-brand-text-secondary">No previous versions have been saved. As you evolve the plan using the features in the 'Overview' or 'Features' tabs, older versions will appear here.</p>
                </Card>
            </div>
        );
    }

    const sortedHistory = [...history].sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold">Plan Version History</h3>
            <p className="text-brand-text-secondary">
                You can restore any previous version of your project plan. Restoring a version will save the current plan to history.
            </p>
            <div className="space-y-4">
                <Card className="flex justify-between items-center border-brand-primary/50">
                    <div>
                        <p className="font-semibold text-brand-text-primary">Current Active Plan</p>
                        <p className="text-xs text-brand-text-secondary">This is the version you are currently viewing.</p>
                    </div>
                     <span className="text-xs font-medium bg-brand-primary/20 text-brand-primary-hover px-3 py-1 rounded-full">Active</span>
                </Card>
                
                {sortedHistory.map((entry) => (
                    <Card key={entry.savedAt} className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-brand-text-primary">Version saved on</p>
                            <p className="text-sm text-brand-text-secondary">
                                {new Date(entry.savedAt).toLocaleString()}
                            </p>
                        </div>
                        <Button variant="secondary" onClick={() => restoreProjectVersion(entry)}>
                            <HistoryIcon className="h-4 w-4 mr-2" />
                            Restore this version
                        </Button>
                    </Card>
                ))}
            </div>
        </div>
    );
};


export const ProjectPlanView: React.FC<{ project: SavedProject }> = ({ project }) => {
    const [activeTab, setActiveTab] = useState('Overview');
    const { projectPlan, projectName, inputData, history } = project;

    useEffect(() => {
        // When a new project is loaded, switch to the overview tab.
        setActiveTab('Overview');
    }, [project.id]);

    const [exportFormat, setExportFormat] = useState<'md' | 'docx'>('md');
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format?: 'md' | 'docx') => {
      const selectedFormat = format || exportFormat;
      setIsExporting(true);

      try {
        if (selectedFormat === 'md') {
          const markdownContent = formatPlanToMarkdown(projectPlan, projectName);
          downloadAsMarkdown(markdownContent, `${projectName.replace(/\s+/g, '_')}_Plan.md`);
        } else {
          await exportPlanAsDocx(projectPlan, projectName);
        }
      } catch (error) {
        console.error('Export failed:', error);
      } finally {
        setIsExporting(false);
      }
    };

    const renderContent = () => {
        const projectContext = { name: projectName, description: projectPlan.summary };
        switch (activeTab) {
            case 'Overview':
                return <OverviewTab plan={projectPlan} projectInput={inputData} />;
            case 'Features':
                return <FeaturesTab plan={projectPlan} projectContext={projectContext} />;
            case 'Development':
                return <DevelopmentTab plan={projectPlan} projectContext={projectContext} />;
            case 'Architecture':
                return <EditableArchitectureTab plan={projectPlan} projectContext={projectContext} />;
            case 'Workflow':
                return <EditableWorkflowTab plan={projectPlan} projectContext={projectContext} />;
            case 'Reports':
                return <ReportsTab plan={projectPlan} projectName={projectName} />;
            case 'History':
                return <HistoryTab history={history || []} />;
            default:
                return <OverviewTab plan={projectPlan} projectInput={inputData} />;
        }
    };

    return (
        <div className="flex flex-col flex-grow bg-brand-surface/50 backdrop-blur-lg border border-brand-border/50 rounded-xl shadow-2xl p-4 w-full">
            <header className="flex justify-between items-center border-b border-brand-border pb-4 mb-4 px-4">
              <h2 className="text-xl font-bold text-brand-text-primary">{projectName} - Project Plan</h2>
              <div className="flex items-center gap-3">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as 'md' | 'docx')}
                  className="bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="md">Markdown (.md)</option>
                  <option value="docx">Word (.docx)</option>
                </select>
                <Button variant="secondary" onClick={() => handleExport()} isLoading={isExporting}>
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export Plan'}
                </Button>
              </div>
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
