import React, { useState, useEffect } from 'react';
import type { ProjectInputData, CoreRequirement, Priority, TemplateData } from '../types';
import { Button, Input, Textarea, Tag } from './ui';
import { PlusCircleIcon, XIcon, WandSparklesIcon } from './icons';

const defaultFormData: ProjectInputData = {
  projectName: "",
  shortDescription: "",
  businessGoals: "",
  technicalGoals: "",
  targetUsers: [],
  numberOfFeatures: 10,
  estimatedScale: "",
  timeline: "",
  coreRequirements: [],
  techStack: {
    frontend: [],
    backend: [],
    database: [],
    otherTools: [],
  },
  marketAnalysis: "",
  competitors: [],
};

const TagInput: React.FC<{
    values: string[];
    onValuesChange: (values: string[]) => void;
    placeholder?: string;
}> = ({ values, onValuesChange, placeholder }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            if (!values.includes(inputValue.trim())) {
                onValuesChange([...values, inputValue.trim()]);
            }
            setInputValue('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        onValuesChange(values.filter(tag => tag !== tagToRemove));
    };

    return (
        <div className="flex flex-wrap gap-2 p-2 bg-brand-bg border border-brand-border rounded-md">
            {values.map(tag => (
                <Tag key={tag} onRemove={() => removeTag(tag)}>{tag}</Tag>
            ))}
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="flex-grow bg-transparent outline-none text-sm text-brand-text-primary placeholder-brand-text-secondary"
            />
        </div>
    );
};

// Step 1 Component
const Step1BasicInfo: React.FC<{ data: ProjectInputData; update: (field: string, value: any) => void }> = ({ data, update }) => {
    return (
        <div className="space-y-6">
            <Input label="Project Name" id="projectName" value={data.projectName} onChange={e => update('projectName', e.target.value)} />
            <Textarea label="Short Description" id="shortDescription" value={data.shortDescription} onChange={e => update('shortDescription', e.target.value)} />
            <Input label="Business Goals" id="businessGoals" value={data.businessGoals} onChange={e => update('businessGoals', e.target.value)} />
            <Input label="Technical Goals" id="technicalGoals" value={data.technicalGoals} onChange={e => update('technicalGoals', e.target.value)} />
            <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-1">Target Users</label>
                <TagInput values={data.targetUsers} onValuesChange={v => update('targetUsers', v)} placeholder="Type and press Enter..." />
            </div>
            <div>
                <label htmlFor="numFeatures" className="block text-sm font-medium text-brand-text-secondary mb-1">Number of Features: {data.numberOfFeatures}</label>
                <input type="range" id="numFeatures" min="1" max="50" value={data.numberOfFeatures} onChange={e => update('numberOfFeatures', parseInt(e.target.value))} className="w-full h-2 bg-brand-border rounded-lg appearance-none cursor-pointer" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Input label="Estimated Budget" id="estimatedScale" value={data.estimatedScale} onChange={e => update('estimatedScale', e.target.value)} />
                <Input label="Timeline" id="timeline" value={data.timeline} onChange={e => update('timeline', e.target.value)} />
            </div>
        </div>
    );
};

// Step 2 Component
const Step2CoreRequirements: React.FC<{ data: ProjectInputData; update: (field: string, value: any) => void }> = ({ data, update }) => {
    const [newReq, setNewReq] = useState('');
    const [newReqPriority, setNewReqPriority] = useState<Priority>('Medium');

    const addRequirement = () => {
        if (!newReq.trim()) return;
        const req: CoreRequirement = { id: Date.now().toString(), description: newReq.trim(), priority: newReqPriority };
        update('coreRequirements', [...data.coreRequirements, req]);
        setNewReq('');
    };
    
    const removeRequirement = (id: string) => {
        update('coreRequirements', data.coreRequirements.filter(r => r.id !== id));
    };

    return (
        <div className="space-y-4">
            {data.coreRequirements.map((req, index) => (
                <div key={req.id} className="flex items-center gap-2 p-2 bg-brand-bg rounded-md border border-brand-border">
                    <span className="text-sm text-brand-text-secondary">{index + 1}.</span>
                    <input type="text" value={req.description} readOnly className="flex-grow bg-transparent text-brand-text-primary text-sm" />
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                        req.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                        req.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                    }`}>{req.priority}</span>
                    <button onClick={() => removeRequirement(req.id)}><XIcon className="h-4 w-4 text-brand-text-secondary hover:text-red-500" /></button>
                </div>
            ))}
            <div className="flex items-center gap-2 pt-4">
                <Input label="" id="newReq" placeholder="Add new requirement..." value={newReq} onChange={e => setNewReq(e.target.value)} className="flex-grow" />
                 <select value={newReqPriority} onChange={e => setNewReqPriority(e.target.value as Priority)} className="bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary">
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                </select>
                <Button variant="secondary" onClick={addRequirement} className="!p-2"><PlusCircleIcon className="h-5 w-5" /></Button>
            </div>
        </div>
    );
};

// Step 3 Component
const Step3TechStack: React.FC<{ data: ProjectInputData; update: (field: string, value: any) => void }> = ({ data, update }) => {
    const updateStack = (category: keyof ProjectInputData['techStack'], value: string[]) => {
        update('techStack', { ...data.techStack, [category]: value });
    };

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-1">Frontend</label>
                <TagInput values={data.techStack.frontend} onValuesChange={v => updateStack('frontend', v)} placeholder="e.g., React, Vue.js" />
            </div>
            <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-1">Backend</label>
                <TagInput values={data.techStack.backend} onValuesChange={v => updateStack('backend', v)} placeholder="e.g., Node.js, Django" />
            </div>
            <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-1">Database</label>
                <TagInput values={data.techStack.database} onValuesChange={v => updateStack('database', v)} placeholder="e.g., PostgreSQL, MongoDB" />
            </div>
            <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-1">Other Tools / Libraries</label>
                <TagInput values={data.techStack.otherTools} onValuesChange={v => updateStack('otherTools', v)} placeholder="e.g., Docker, Jest" />
            </div>
        </div>
    );
};

// Step 4 Component
const Step4MarketAnalysis: React.FC<{ data: ProjectInputData; update: (field: string, value: any) => void }> = ({ data, update }) => {
    return (
        <div className="space-y-6">
            <Textarea
                label="Market Analysis"
                id="marketAnalysis"
                placeholder="Describe the target market, key trends, and existing competitors. What makes your project unique?"
                value={data.marketAnalysis}
                onChange={e => update('marketAnalysis', e.target.value)}
                rows={5}
            />
            <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-1">Known Competitors</label>
                <TagInput
                    values={data.competitors}
                    onValuesChange={v => update('competitors', v)}
                    placeholder="Add competitor and press Enter..."
                />
            </div>
        </div>
    );
};


// Step 5 Component
const Step5Review: React.FC<{ data: ProjectInputData }> = ({ data }) => {
    return (
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            <h3 className="text-lg font-semibold text-brand-text-primary">Review Your Project Details</h3>
            <p className="text-sm text-brand-text-secondary">Please review the information below before generating the plan.</p>
            <div className="space-y-3 text-sm">
                <p><strong>Project Name:</strong> {data.projectName}</p>
                <p><strong>Description:</strong> {data.shortDescription}</p>
                <p><strong>Target Users:</strong> {data.targetUsers.join(', ')}</p>
                <p><strong>Core Requirements:</strong> {data.coreRequirements.length} item(s)</p>
                <p><strong>Frontend:</strong> {data.techStack.frontend.join(', ')}</p>
                <p><strong>Backend:</strong> {data.techStack.backend.join(', ')}</p>
                <p><strong>Database:</strong> {data.techStack.database.join(', ')}</p>
                <p><strong>Market Analysis:</strong> {data.marketAnalysis || 'N/A'}</p>
                <p><strong>Competitors:</strong> {data.competitors.join(', ') || 'N/A'}</p>
            </div>
        </div>
    );
};

const STEPS = [
    { title: "Basic Information", component: Step1BasicInfo },
    { title: "Core Requirements", component: Step2CoreRequirements },
    { title: "Anticipated Technology Stack", component: Step3TechStack },
    { title: "Market & Competition", component: Step4MarketAnalysis },
    { title: "Review & Generate Plan", component: Step5Review },
];

export const NewProjectWizard: React.FC<{ 
    onGenerate: (data: ProjectInputData) => void, 
    isGenerating: boolean,
    initialData?: TemplateData 
}> = ({ onGenerate, isGenerating, initialData }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ProjectInputData>(defaultFormData);

  useEffect(() => {
      // If initialData is provided (from a template), use it.
      // Otherwise, use the default blank form for a "new" project.
      const startingData = initialData ? { ...defaultFormData, ...initialData } : defaultFormData;
      setFormData(startingData as ProjectInputData);
      setCurrentStep(0); // Reset to first step when data changes
  }, [initialData]);


  const updateFormData = (field: keyof ProjectInputData, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));
  
  const CurrentStepComponent = STEPS[currentStep].component;

  return (
    <div className="max-w-3xl mx-auto bg-brand-surface/50 backdrop-blur-lg border border-brand-border/50 rounded-xl shadow-2xl p-8">
        <header className="mb-8">
            <p className="text-right text-sm text-brand-text-secondary mb-2">{currentStep + 1}/{STEPS.length}</p>
            <h2 className="text-2xl font-bold text-brand-text-primary">{initialData ? `New Project from Template: ${initialData.projectName}` : 'Start a New Project'}</h2>
            <p className="text-brand-text-secondary mt-1">Step {currentStep + 1}: {STEPS[currentStep].title}</p>
        </header>
        
        <main>
            <CurrentStepComponent data={formData} update={updateFormData} />
        </main>

        <footer className="mt-8 pt-6 border-t border-brand-border flex justify-between items-center">
            <Button variant="secondary" onClick={prevStep} disabled={currentStep === 0}>
                Back
            </Button>
            {currentStep < STEPS.length - 1 ? (
                <Button onClick={nextStep}>
                    Next: {STEPS[currentStep + 1].title}
                </Button>
            ) : (
                <Button onClick={() => onGenerate(formData)} isLoading={isGenerating}>
                    {isGenerating ? "AI is analyzing project data..." : (
                        <>
                            <WandSparklesIcon className="-ml-1 mr-2 h-5 w-5" />
                            Generate Plan with AI
                        </>
                    )}
                </Button>
            )}
        </footer>
    </div>
  );
};