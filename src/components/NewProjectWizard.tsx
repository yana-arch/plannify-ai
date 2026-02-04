import React, { useState, useEffect } from 'react';
import type { ProjectInputData, CoreRequirement, Priority, TemplateData } from '../types';
import { Button, Input, Textarea, Tag, Card, Modal } from './ui';
import {
  PlusCircleIcon,
  XIcon,
  WandSparklesIcon,
  InfoIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
} from './icons';
import { generateCoreRequirements } from '../services/aiService';
import { validateStepData, validateCompleteForm, getFieldTooltip } from '../utils/validation';
import type { ValidationResult, ValidationError } from '../utils/validation';
import { useSettings } from '../SettingsContext';

const defaultFormData: ProjectInputData = {
  projectName: '',
  shortDescription: '',
  businessGoals: '',
  technicalGoals: '',
  targetUsers: [],
  numberOfFeatures: 10,
  estimatedScale: '',
  timeline: '',
  coreRequirements: [],
  userFeatureRequests: '',
  techStack: {
    frontend: [],
    backend: [],
    database: [],
    otherTools: [],
  },
  marketAnalysis: '',
  competitors: [],
  riskAssessment: [],
  featureDependencies: {},
  successMetrics: [],
};

const WIZARD_DRAFT_STORAGE_KEY = 'plannifyai_wizard_draft';

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
    onValuesChange(values.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-brand-bg border border-brand-border rounded-md">
      {values.map((tag) => (
        <Tag key={tag} onRemove={() => removeTag(tag)}>
          {tag}
        </Tag>
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

// Enhanced Input Component with Validation and Tooltip
const ValidatedInput: React.FC<{
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
  tooltip?: string;
  validation?: ValidationResult;
  fieldName?: string;
}> = ({
  label,
  id,
  value,
  onChange,
  type = 'text',
  required = false,
  minLength,
  placeholder,
  tooltip,
  validation,
  fieldName = id,
}) => {
  const fieldErrors = validation?.errors.filter((e) => e.field === fieldName) || [];
  const fieldWarnings = validation?.warnings.filter((w) => w.field === fieldName) || [];
  const hasErrors = fieldErrors.length > 0;
  const hasWarnings = fieldWarnings.length > 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <label htmlFor={id} className="block text-sm font-medium text-brand-text-secondary">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {tooltip && (
          <div className="group relative">
            <InfoIcon className="h-4 w-4 text-brand-text-secondary/60 hover:text-brand-text-secondary cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-brand-surface border border-brand-border rounded-md text-xs text-brand-text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      {type === 'textarea' ? (
        <Textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={hasErrors ? 'border-red-500 focus:ring-red-500' : ''}
        />
      ) : (
        <Input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={hasErrors ? 'border-red-500 focus:ring-red-500' : ''}
        />
      )}
      {hasErrors && (
        <div className="flex items-start gap-2 text-sm text-red-600">
          <AlertTriangleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{fieldErrors[0].message}</span>
        </div>
      )}
      {hasWarnings && !hasErrors && (
        <div className="flex items-start gap-2 text-sm text-yellow-600">
          <InfoIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{fieldWarnings[0].message}</span>
        </div>
      )}
    </div>
  );
};

// Step 1 Component
const Step1BasicInfo: React.FC<{
  data: ProjectInputData;
  update: (field: keyof ProjectInputData, value: unknown) => void;
  validation?: ValidationResult;
}> = ({ data, update, validation }) => {
  return (
    <div className="space-y-6">
      <ValidatedInput
        label="Project Name"
        id="projectName"
        value={data.projectName}
        onChange={(e) => update('projectName', e.target.value)}
        required
        tooltip={getFieldTooltip('projectName')}
        validation={validation}
      />
      <ValidatedInput
        label="Short Description"
        id="shortDescription"
        value={data.shortDescription}
        onChange={(e) => update('shortDescription', e.target.value)}
        type="textarea"
        required
        minLength={20}
        tooltip={getFieldTooltip('shortDescription')}
      />
      <ValidatedInput
        label="Business Goals"
        id="businessGoals"
        value={data.businessGoals}
        onChange={(e) => update('businessGoals', e.target.value)}
        required
        minLength={30}
        tooltip={getFieldTooltip('businessGoals')}
      />
      <ValidatedInput
        label="Technical Goals"
        id="technicalGoals"
        value={data.technicalGoals}
        onChange={(e) => update('technicalGoals', e.target.value)}
        required
        minLength={30}
        tooltip={getFieldTooltip('technicalGoals')}
      />
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <label className="block text-sm font-medium text-brand-text-secondary">
            Target Users
          </label>
          <span className="text-red-500">*</span>
          <div className="group relative">
            <InfoIcon className="h-4 w-4 text-brand-text-secondary/60 hover:text-brand-text-secondary cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-brand-surface border border-brand-border rounded-md text-xs text-brand-text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
              {getFieldTooltip('targetUsers')}
            </div>
          </div>
        </div>
        <TagInput
          values={data.targetUsers}
          onValuesChange={(v) => update('targetUsers', v)}
          placeholder="Type and press Enter..."
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="numFeatures"
          className="block text-sm font-medium text-brand-text-secondary"
        >
          Approximate Number of Core Features: {data.numberOfFeatures}
          <div className="inline-block ml-2 group relative">
            <InfoIcon className="h-4 w-4 text-brand-text-secondary/60 hover:text-brand-text-secondary cursor-help inline" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-brand-surface border border-brand-border rounded-md text-xs text-brand-text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
              {getFieldTooltip('numberOfFeatures')}
            </div>
          </div>
        </label>
        <input
          type="range"
          id="numFeatures"
          min="3"
          max="20"
          value={data.numberOfFeatures}
          onChange={(e) => update('numberOfFeatures', parseInt(e.target.value))}
          className="w-full h-2 bg-brand-border rounded-lg appearance-none cursor-pointer"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <ValidatedInput
          label="Estimated Budget"
          id="estimatedScale"
          value={data.estimatedScale}
          onChange={(e) => update('estimatedScale', e.target.value)}
          required
          placeholder="$10K-$50K"
          tooltip={getFieldTooltip('estimatedScale')}
        />
        <ValidatedInput
          label="Timeline"
          id="timeline"
          value={data.timeline}
          onChange={(e) => update('timeline', e.target.value)}
          required
          placeholder="3-6 months"
          tooltip={getFieldTooltip('timeline')}
        />
      </div>
    </div>
  );
};

// Step 2 Component
const Step2CoreRequirements: React.FC<{
  data: ProjectInputData;
  update: (field: keyof ProjectInputData, value: unknown) => void;
}> = ({ data, update }) => {
  const [newReq, setNewReq] = useState('');
  const [newReqPriority, setNewReqPriority] = useState<Priority>('Medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { activeProvider } = useSettings();
  const handleConfirmGeneration = async () => {
    if (!activeProvider) {
      setGenerationError('No active AI provider configured.');
      return;
    }
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const projectInfo: Partial<ProjectInputData> = {
        projectName: data.projectName,
        shortDescription: data.shortDescription,
        businessGoals: data.businessGoals,
        targetUsers: data.targetUsers,
        numberOfFeatures: data.numberOfFeatures,
        userFeatureRequests: data.userFeatureRequests,
      };
      const generatedReqs = await generateCoreRequirements(projectInfo, activeProvider);
      const newCoreRequirements: CoreRequirement[] = generatedReqs.map((req) => ({
        id: `${Date.now()}-${Math.random()}`,
        description: req.description,
        priority: req.priority,
      }));
      update('coreRequirements', newCoreRequirements);
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsGenerating(false);
      setShowConfirmModal(false);
    }
  };

  const addRequirement = () => {
    if (!newReq.trim()) return;
    const req: CoreRequirement = {
      id: Date.now().toString(),
      description: newReq.trim(),
      priority: newReqPriority,
    };
    update('coreRequirements', [...data.coreRequirements, req]);
    setNewReq('');
  };

  const removeRequirement = (id: string) => {
    update(
      'coreRequirements',
      data.coreRequirements.filter((r) => r.id !== id),
    );
  };

  return (
    <div className="space-y-4">
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmGeneration}
        title="Confirm AI Generation"
        confirmText="Generate"
        isConfirming={isGenerating}
      >
        The AI will analyze your project details and suggest a list of core requirements. This will
        replace any requirements you have already added. Do you want to continue?
      </Modal>

      <Card className="bg-brand-bg/50">
        <div>
          <h4 className="font-semibold text-brand-text-primary">Generate Requirements with AI</h4>
          <p className="text-sm text-brand-text-secondary mt-1">
            Let AI suggest core requirements based on your project details. You can also provide
            your own ideas below to guide the generation.
          </p>
        </div>

        <div className="mt-4">
          <Textarea
            label="Your feature ideas (optional, one per line)"
            id="userFeatureRequests"
            placeholder={
              'e.g., A real-time chat feature for users\nA dark mode option in the settings'
            }
            value={data.userFeatureRequests || ''}
            onChange={(e) => update('userFeatureRequests', e.target.value)}
            rows={3}
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          {generationError ? (
            <p className="text-sm text-red-400 flex-grow pr-4">{generationError}</p>
          ) : (
            <div /> /* Spacer */
          )}
          <Button
            onClick={() => setShowConfirmModal(true)}
            isLoading={isGenerating}
            className="flex-shrink-0"
          >
            <WandSparklesIcon className="h-4 w-4 mr-2" />
            Generate with AI
          </Button>
        </div>
      </Card>

      {data.coreRequirements.map((req, index) => (
        <div
          key={req.id}
          className="flex items-center gap-2 p-2 bg-brand-bg rounded-md border border-brand-border"
        >
          <span className="text-sm text-brand-text-secondary">{index + 1}.</span>
          <input
            type="text"
            value={req.description}
            readOnly
            className="flex-grow bg-transparent text-brand-text-primary text-sm"
          />
          <span
            className={`px-2 py-0.5 text-xs rounded-full ${
              req.priority === 'High'
                ? 'bg-red-500/20 text-red-400'
                : req.priority === 'Medium'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-blue-500/20 text-blue-400'
            }`}
          >
            {req.priority}
          </span>
          <button onClick={() => removeRequirement(req.id)}>
            <XIcon className="h-4 w-4 text-brand-text-secondary hover:text-red-500" />
          </button>
        </div>
      ))}
      <p className="text-center text-xs text-brand-text-secondary pt-2">
        or add a requirement manually:
      </p>
      <div className="flex items-center gap-2">
        <Input
          label=""
          id="newReq"
          placeholder="Add new requirement..."
          value={newReq}
          onChange={(e) => setNewReq(e.target.value)}
          className="flex-grow"
        />
        <select
          value={newReqPriority}
          onChange={(e) => setNewReqPriority(e.target.value as Priority)}
          className="bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
        >
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <Button variant="secondary" onClick={addRequirement} className="!p-2">
          <PlusCircleIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

// Step 3 Component
const Step3TechStack: React.FC<{
  data: ProjectInputData;
  update: (field: keyof ProjectInputData, value: unknown) => void;
}> = ({ data, update }) => {
  const updateStack = (category: keyof ProjectInputData['techStack'], value: string[]) => {
    update('techStack', { ...data.techStack, [category]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-brand-text-secondary mb-1">Frontend</label>
        <TagInput
          values={data.techStack.frontend}
          onValuesChange={(v) => updateStack('frontend', v)}
          placeholder="e.g., React, Vue.js"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-brand-text-secondary mb-1">Backend</label>
        <TagInput
          values={data.techStack.backend}
          onValuesChange={(v) => updateStack('backend', v)}
          placeholder="e.g., Node.js, Django"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-brand-text-secondary mb-1">Database</label>
        <TagInput
          values={data.techStack.database}
          onValuesChange={(v) => updateStack('database', v)}
          placeholder="e.g., PostgreSQL, MongoDB"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-brand-text-secondary mb-1">
          Other Tools / Libraries
        </label>
        <TagInput
          values={data.techStack.otherTools}
          onValuesChange={(v) => updateStack('otherTools', v)}
          placeholder="e.g., Docker, Jest"
        />
      </div>
    </div>
  );
};

// Step 4 Component - Core Modules
const Step4CoreModules: React.FC<{
  data: ProjectInputData;
  update: (field: keyof ProjectInputData, value: unknown) => void;
}> = ({ data, update }) => {
  const [activeTab, setActiveTab] = useState(0);

  // Ensure activeTab is valid when modules change
  useEffect(() => {
    if (data.coreModules && data.coreModules.length > 0) {
      if (activeTab >= data.coreModules.length) {
        setActiveTab(Math.max(0, data.coreModules.length - 1));
      }
    }
  }, [data.coreModules?.length, activeTab]);

  const addModule = () => {
    const newMod = {
      moduleName: 'New Module',
      description: '',
      flows: [],
    };
    const newModules = [...(data.coreModules || []), newMod];
    update('coreModules', newModules);
    setActiveTab(newModules.length - 1);
  };

  const removeModule = (index: number) => {
    const modules = data.coreModules || [];
    const newModules = modules.filter((_, i) => i !== index);
    update('coreModules', newModules);
    if (activeTab >= newModules.length) {
      setActiveTab(Math.max(0, newModules.length - 1));
    }
  };

  const updateModule = (index: number, field: string, value: string) => {
    const modules = data.coreModules || [];
    modules[index] = { ...modules[index], [field]: value };
    update('coreModules', modules);
  };

  const addFlow = (moduleIndex: number) => {
    const modules = data.coreModules || [];
    if (!modules[moduleIndex].flows) modules[moduleIndex].flows = [];
    modules[moduleIndex].flows.push('');
    update('coreModules', [...modules]);
  };

  const updateFlow = (moduleIndex: number, flowIndex: number, value: string) => {
    const modules = data.coreModules || [];
    modules[moduleIndex].flows[flowIndex] = value;
    update('coreModules', [...modules]);
  };

  const removeFlow = (moduleIndex: number, flowIndex: number) => {
    const modules = data.coreModules || [];
    modules[moduleIndex].flows = modules[moduleIndex].flows.filter((_, i) => i !== flowIndex);
    update('coreModules', [...modules]);
  };

  const currentModule = data.coreModules?.[activeTab];

  return (
    <div className="space-y-6">
      <div>
        {/* Tabs Header */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-brand-border mb-4">
          {(data.coreModules || []).map((module, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === index
                  ? 'bg-brand-primary/10 text-brand-primary border-b-2 border-brand-primary'
                  : 'text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-surface'
              }`}
            >
              {module.moduleName || `Module ${index + 1}`}
            </button>
          ))}
          <Button variant="secondary" onClick={addModule} className="!p-2 flex-shrink-0">
            <PlusCircleIcon className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        {/* Active Tab Content */}
        {currentModule ? (
          <Card key={activeTab} className="animate-fadeIn">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium text-brand-text-primary">
                Editing: {currentModule.moduleName || 'Untitled Module'}
              </h4>
              <Button
                variant="danger"
                onClick={() => removeModule(activeTab)}
                className="!py-1 !px-3 text-xs"
              >
                Delete Module
              </Button>
            </div>
            <div className="space-y-4">
              <Input
                label="Module Name"
                value={currentModule.moduleName}
                onChange={(e) => updateModule(activeTab, 'moduleName', e.target.value)}
                placeholder="e.g., User Authentication"
              />
              <Textarea
                label="Description"
                value={currentModule.description}
                onChange={(e) => updateModule(activeTab, 'description', e.target.value)}
                rows={3}
                placeholder="Describe what this module does..."
              />
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                  Key Flows
                </label>
                <div className="space-y-2">
                  {(currentModule.flows || []).map((flow, flowIndex) => (
                    <div key={flowIndex} className="flex gap-2">
                      <div className="flex-grow">
                        <Input
                          label=""
                          value={flow}
                          onChange={(e) => updateFlow(activeTab, flowIndex, e.target.value)}
                          placeholder="e.g., User Login Flow"
                        />
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => removeFlow(activeTab, flowIndex)}
                        className="!p-2"
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="secondary"
                  onClick={() => addFlow(activeTab)}
                  className="text-sm mt-2"
                >
                  <PlusCircleIcon className="h-4 w-4 mr-2" />
                  Add Flow
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="text-center py-10 bg-brand-surface/30 rounded-lg border border-dashed border-brand-border">
            <p className="text-brand-text-secondary mb-4">No modules defined yet.</p>
            <Button onClick={addModule}>
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Create First Module
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Step 5 Component - Role Permissions
const Step5RolePermissions: React.FC<{
  data: ProjectInputData;
  update: (field: keyof ProjectInputData, value: unknown) => void;
}> = ({ data, update }) => {
  const [activeTab, setActiveTab] = useState(0);

  // Ensure activeTab is valid
  useEffect(() => {
    if (data.rolePermissions && data.rolePermissions.length > 0) {
      if (activeTab >= data.rolePermissions.length) {
        setActiveTab(Math.max(0, data.rolePermissions.length - 1));
      }
    }
  }, [data.rolePermissions?.length, activeTab]);

  const addRole = () => {
    const newRoleObj = {
      role: 'New Role',
      permissions: [],
    };
    const newRoles = [...(data.rolePermissions || []), newRoleObj];
    update('rolePermissions', newRoles);
    setActiveTab(newRoles.length - 1);
  };

  const removeRole = (index: number) => {
    const roles = data.rolePermissions || [];
    const newRoles = roles.filter((_, i) => i !== index);
    update('rolePermissions', newRoles);
    if (activeTab >= newRoles.length) {
      setActiveTab(Math.max(0, newRoles.length - 1));
    }
  };

  const updateRole = (index: number, field: string, value: string) => {
    const roles = data.rolePermissions || [];
    roles[index] = { ...roles[index], [field]: value };
    update('rolePermissions', [...roles]);
  };

  const addPermission = (roleIndex: number) => {
    const roles = data.rolePermissions || [];
    if (!roles[roleIndex].permissions) roles[roleIndex].permissions = [];
    roles[roleIndex].permissions.push('');
    update('rolePermissions', [...roles]);
  };

  const updatePermission = (roleIndex: number, permIndex: number, value: string) => {
    const roles = data.rolePermissions || [];
    roles[roleIndex].permissions[permIndex] = value;
    update('rolePermissions', [...roles]);
  };

  const removePermission = (roleIndex: number, permIndex: number) => {
    const roles = data.rolePermissions || [];
    roles[roleIndex].permissions = roles[roleIndex].permissions.filter((_, i) => i !== permIndex);
    update('rolePermissions', [...roles]);
  };

  const currentRole = data.rolePermissions?.[activeTab];

  return (
    <div className="space-y-6">
      <div>
        {/* Tabs Header */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-brand-border mb-4">
          {(data.rolePermissions || []).map((role, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === index
                  ? 'bg-brand-primary/10 text-brand-primary border-b-2 border-brand-primary'
                  : 'text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-surface'
              }`}
            >
              {role.role || `Role ${index + 1}`}
            </button>
          ))}
          <Button variant="secondary" onClick={addRole} className="!p-2 flex-shrink-0">
            <PlusCircleIcon className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        {/* Active Tab Content */}
        {currentRole ? (
          <Card key={activeTab} className="animate-fadeIn">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium text-brand-text-primary">
                Editing: {currentRole.role || 'Untitled Role'}
              </h4>
              <Button
                variant="danger"
                onClick={() => removeRole(activeTab)}
                className="!py-1 !px-3 text-xs"
              >
                Delete Role
              </Button>
            </div>
            <div className="space-y-4">
              <Input
                label="Role Name"
                value={currentRole.role}
                onChange={(e) => updateRole(activeTab, 'role', e.target.value)}
                placeholder="e.g., Administrator, User"
              />
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  {(currentRole.permissions || []).map((permission, permIndex) => (
                    <div key={permIndex} className="flex gap-2">
                      <div className="flex-grow">
                        <Input
                          label=""
                          value={permission}
                          onChange={(e) => updatePermission(activeTab, permIndex, e.target.value)}
                          placeholder="e.g., Can manage users"
                        />
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => removePermission(activeTab, permIndex)}
                        className="!p-2"
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="secondary"
                  onClick={() => addPermission(activeTab)}
                  className="text-sm mt-2"
                >
                  <PlusCircleIcon className="h-4 w-4 mr-2" />
                  Add Permission
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="text-center py-10 bg-brand-surface/30 rounded-lg border border-dashed border-brand-border">
            <p className="text-brand-text-secondary mb-4">No roles defined yet.</p>
            <Button onClick={addRole}>
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Create First Role
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Step 6 Component - Standard Flows
const Step6StandardFlows: React.FC<{
  data: ProjectInputData;
  update: (field: keyof ProjectInputData, value: unknown) => void;
}> = ({ data, update }) => {
  const [activeTab, setActiveTab] = useState(0);

  // Ensure activeTab is valid
  useEffect(() => {
    if (data.standardFlows && data.standardFlows.length > 0) {
      if (activeTab >= data.standardFlows.length) {
        setActiveTab(Math.max(0, data.standardFlows.length - 1));
      }
    }
  }, [data.standardFlows?.length, activeTab]);

  const addFlow = () => {
    const newFlowObj = {
      flowName: 'New Flow',
      steps: [],
    };
    const newFlows = [...(data.standardFlows || []), newFlowObj];
    update('standardFlows', newFlows);
    setActiveTab(newFlows.length - 1);
  };

  const removeFlow = (index: number) => {
    const flows = data.standardFlows || [];
    const newFlows = flows.filter((_, i) => i !== index);
    update('standardFlows', newFlows);
    if (activeTab >= newFlows.length) {
      setActiveTab(Math.max(0, newFlows.length - 1));
    }
  };

  const updateFlow = (index: number, field: string, value: string) => {
    const flows = data.standardFlows || [];
    flows[index] = { ...flows[index], [field]: value };
    update('standardFlows', [...flows]);
  };

  const addStep = (flowIndex: number) => {
    const flows = data.standardFlows || [];
    if (!flows[flowIndex].steps) flows[flowIndex].steps = [];
    flows[flowIndex].steps.push('');
    update('standardFlows', [...flows]);
  };

  const updateStep = (flowIndex: number, stepIndex: number, value: string) => {
    const flows = data.standardFlows || [];
    flows[flowIndex].steps[stepIndex] = value;
    update('standardFlows', [...flows]);
  };

  const removeStep = (flowIndex: number, stepIndex: number) => {
    const flows = data.standardFlows || [];
    flows[flowIndex].steps = flows[flowIndex].steps.filter((_, i) => i !== stepIndex);
    update('standardFlows', [...flows]);
  };

  const currentFlow = data.standardFlows?.[activeTab];

  return (
    <div className="space-y-6">
      <div>
        {/* Tabs Header */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-brand-border mb-4">
          {(data.standardFlows || []).map((flow, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === index
                  ? 'bg-brand-primary/10 text-brand-primary border-b-2 border-brand-primary'
                  : 'text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-surface'
              }`}
            >
              {flow.flowName || `Flow ${index + 1}`}
            </button>
          ))}
          <Button variant="secondary" onClick={addFlow} className="!p-2 flex-shrink-0">
            <PlusCircleIcon className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        {/* Active Tab Content */}
        {currentFlow ? (
          <Card key={activeTab} className="animate-fadeIn">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium text-brand-text-primary">
                Editing: {currentFlow.flowName || 'Untitled Flow'}
              </h4>
              <Button
                variant="danger"
                onClick={() => removeFlow(activeTab)}
                className="!py-1 !px-3 text-xs"
              >
                Delete Flow
              </Button>
            </div>
            <div className="space-y-4">
              <Input
                label="Flow Name"
                value={currentFlow.flowName}
                onChange={(e) => updateFlow(activeTab, 'flowName', e.target.value)}
                placeholder="e.g., Order Processing"
              />
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                  Steps
                </label>
                <div className="space-y-2">
                  {(currentFlow.steps || []).map((step, stepIndex) => (
                    <div key={stepIndex} className="flex gap-2">
                      <span className="text-sm text-brand-text-secondary mt-2 w-6">
                        {stepIndex + 1}.
                      </span>
                      <div className="flex-grow">
                        <Input
                          label=""
                          value={step}
                          onChange={(e) => updateStep(activeTab, stepIndex, e.target.value)}
                          placeholder="Step description"
                        />
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => removeStep(activeTab, stepIndex)}
                        className="!p-2"
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="secondary" onClick={() => addStep(activeTab)} className="text-sm mt-2">
                  <PlusCircleIcon className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="text-center py-10 bg-brand-surface/30 rounded-lg border border-dashed border-brand-border">
            <p className="text-brand-text-secondary mb-4">No flows defined yet.</p>
            <Button onClick={addFlow}>
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Create First Flow
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Step 7 Component - Risk Assessment & Success Metrics
const Step7RiskAssessmentAndMetrics: React.FC<{
  data: ProjectInputData;
  update: (field: keyof ProjectInputData, value: unknown) => void;
}> = ({ data, update }) => {
  const [newRisk, setNewRisk] = useState<{
    risk: string;
    impact: 'Low' | 'Medium' | 'High';
    probability: 'Low' | 'Medium' | 'High';
    mitigation: string;
  }>({
    risk: '',
    impact: 'Medium',
    probability: 'Medium',
    mitigation: '',
  });
  const [newMetric, setNewMetric] = useState({ metric: '', target: '', timeframe: '' });

  const addRisk = () => {
    if (!newRisk.risk.trim()) return;
    const risk = {
      risk: newRisk.risk.trim(),
      impact: newRisk.impact,
      probability: newRisk.probability,
      mitigation: newRisk.mitigation.trim(),
    };
    update('riskAssessment', [...data.riskAssessment, risk]);
    setNewRisk({ risk: '', impact: 'Medium', probability: 'Medium', mitigation: '' });
  };

  const removeRisk = (index: number) => {
    update(
      'riskAssessment',
      data.riskAssessment.filter((_, i) => i !== index),
    );
  };

  const addMetric = () => {
    if (!newMetric.metric.trim()) return;
    update('successMetrics', [...data.successMetrics, newMetric]);
    setNewMetric({ metric: '', target: '', timeframe: '' });
  };

  const removeMetric = (index: number) => {
    update(
      'successMetrics',
      data.successMetrics.filter((_, i) => i !== index),
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-brand-text-primary mb-2">Risk Assessment</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.riskAssessment.map((risk, index) => (
            <Card key={index} className="h-full">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-brand-text-primary">
                  Risk {index + 1}: {risk.risk}
                </h4>
                <Button variant="secondary" onClick={() => removeRisk(index)} className="!p-2">
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Impact:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      risk.impact === 'High'
                        ? 'bg-red-500/20 text-red-400'
                        : risk.impact === 'Low'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {risk.impact}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Probability:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      risk.probability === 'High'
                        ? 'bg-red-500/20 text-red-400'
                        : risk.probability === 'Low'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {risk.probability}
                  </span>
                </div>
                <div className="md:col-span-1 col-span-3">
                  <span className="font-medium">Mitigation:</span>
                  <p className="mt-1 text-sm">{risk.mitigation}</p>
                </div>
              </div>
            </Card>
          ))}

          <Card className="bg-brand-bg/50 h-full">
            <h4 className="font-medium text-brand-text-primary mb-3">Add New Risk</h4>
            <div className="space-y-3">
              <Input
                label="Risk Description"
                value={newRisk.risk}
                onChange={(e) => setNewRisk((prev) => ({ ...prev, risk: e.target.value }))}
                placeholder="Describe the potential risk..."
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={newRisk.impact}
                  onChange={(e) =>
                    setNewRisk((prev) => ({
                      ...prev,
                      impact: e.target.value as 'Low' | 'Medium' | 'High',
                    }))
                  }
                  className="bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="Low">Low Impact</option>
                  <option value="Medium">Medium Impact</option>
                  <option value="High">High Impact</option>
                </select>
                <select
                  value={newRisk.probability}
                  onChange={(e) =>
                    setNewRisk((prev) => ({
                      ...prev,
                      probability: e.target.value as 'Low' | 'Medium' | 'High',
                    }))
                  }
                  className="bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="Low">Low Probability</option>
                  <option value="Medium">Medium Probability</option>
                  <option value="High">High Probability</option>
                </select>
              </div>
              <Input
                label="Mitigation Strategy"
                value={newRisk.mitigation}
                onChange={(e) => setNewRisk((prev) => ({ ...prev, mitigation: e.target.value }))}
                placeholder="How will you mitigate this risk?"
              />
              <div className="flex justify-end">
                <Button onClick={addRisk} disabled={!newRisk.risk.trim()}>
                  Add Risk
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-brand-text-primary mb-2">Success Metrics</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.successMetrics.map((metric, index) => (
            <Card key={index} className="h-full">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-brand-text-primary">
                  Metric {index + 1}: {metric.metric}
                </h4>
                <Button variant="secondary" onClick={() => removeMetric(index)} className="!p-2">
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Target:</span>
                  <p className="mt-1">{metric.target}</p>
                </div>
                <div>
                  <span className="font-medium">Timeframe:</span>
                  <p className="mt-1">{metric.timeframe}</p>
                </div>
              </div>
            </Card>
          ))}

          <Card className="bg-brand-bg/50 h-full">
            <h4 className="font-medium text-brand-text-primary mb-3">Add Success Metric</h4>
            <div className="space-y-3">
              <Input
                label="Metric Name"
                value={newMetric.metric}
                onChange={(e) => setNewMetric((prev) => ({ ...prev, metric: e.target.value }))}
                placeholder="e.g., User engagement rate, Revenue growth..."
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Target"
                  value={newMetric.target}
                  onChange={(e) => setNewMetric((prev) => ({ ...prev, target: e.target.value }))}
                  placeholder="e.g., 75%, $1M..."
                />
                <Input
                  label="Timeframe"
                  value={newMetric.timeframe}
                  onChange={(e) => setNewMetric((prev) => ({ ...prev, timeframe: e.target.value }))}
                  placeholder="e.g., Q1 2025, 6 months..."
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={addMetric} disabled={!newMetric.metric.trim()}>
                  Add Metric
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Step 8 Component - Review
const Step8Review: React.FC<{ data: ProjectInputData }> = ({ data }) => {
  return (
    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
      <h3 className="text-lg font-semibold text-brand-text-primary">Review Your Project Details</h3>
      <p className="text-sm text-brand-text-secondary">
        Please review the information below before generating the plan.
      </p>
      <div className="space-y-3 text-sm">
        <p>
          <strong>Project Name:</strong> {data.projectName}
        </p>
        <p>
          <strong>Description:</strong> {data.shortDescription}
        </p>
        <p>
          <strong>Business Goals:</strong> {data.businessGoals}
        </p>
        <p>
          <strong>Technical Goals:</strong> {data.technicalGoals}
        </p>
        <p>
          <strong>Target Users:</strong> {data.targetUsers.join(', ')}
        </p>
        <p>
          <strong>Number of Features:</strong> {data.numberOfFeatures}
        </p>
        <p>
          <strong>Estimated Budget:</strong> {data.estimatedScale}
        </p>
        <p>
          <strong>Timeline:</strong> {data.timeline}
        </p>
        <p>
          <strong>Core Requirements:</strong> {data.coreRequirements.length} item(s)
        </p>

        {data.coreModules && data.coreModules.length > 0 && (
          <div>
            <p>
              <strong>Core Modules:</strong> {data.coreModules.length} module(s)
            </p>
            <ul className="list-disc list-inside ml-4">
              {data.coreModules.map((module, i) => (
                <li key={i}>
                  {module.moduleName} ({module.flows.length} flows)
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.rolePermissions && data.rolePermissions.length > 0 && (
          <div>
            <p>
              <strong>Roles:</strong> {data.rolePermissions.length} role(s)
            </p>
            <ul className="list-disc list-inside ml-4">
              {data.rolePermissions.map((role, i) => (
                <li key={i}>
                  {role.role} ({role.permissions.length} permissions)
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.standardFlows && data.standardFlows.length > 0 && (
          <div>
            <p>
              <strong>Standard Flows:</strong> {data.standardFlows.length} flow(s)
            </p>
            <ul className="list-disc list-inside ml-4">
              {data.standardFlows.map((flow, i) => (
                <li key={i}>
                  {flow.flowName} ({flow.steps.length} steps)
                </li>
              ))}
            </ul>
          </div>
        )}

        <p>
          <strong>Tech Stack:</strong>
        </p>
        <div className="ml-4">
          <p>• Frontend: {data.techStack.frontend.join(', ') || 'N/A'}</p>
          <p>• Backend: {data.techStack.backend.join(', ') || 'N/A'}</p>
          <p>• Database: {data.techStack.database.join(', ') || 'N/A'}</p>
          <p>• Other Tools: {data.techStack.otherTools.join(', ') || 'N/A'}</p>
        </div>

        <p>
          <strong>Market Analysis:</strong> {data.marketAnalysis || 'N/A'}
        </p>
        <p>
          <strong>Competitors:</strong> {data.competitors.join(', ') || 'N/A'}
        </p>
      </div>
    </div>
  );
};

const STEPS = [
  {
    title: 'Basic Information',
    component: Step1BasicInfo,
    description: 'Provide the essential details about your project',
  },
  {
    title: 'Core Requirements',
    component: Step2CoreRequirements,
    description: 'List the high-level requirements and goals',
  },
  {
    title: 'Technology Stack',
    component: Step3TechStack,
    description: 'Select the technologies you plan to use',
  },
  {
    title: 'Core Modules',
    component: Step4CoreModules,
    description: 'Define the main modules/components of your system',
  },
  {
    title: 'Role & Permissions',
    component: Step5RolePermissions,
    description: 'Define user roles and their permissions',
  },
  {
    title: 'Standard Flows',
    component: Step6StandardFlows,
    description: 'Define key business processes and workflows',
  },
  {
    title: 'Risk Assessment & Metrics',
    component: Step7RiskAssessmentAndMetrics,
    description: 'Identify potential risks and success metrics',
  },
  {
    title: 'Review & Generate',
    component: Step8Review,
    description: 'Review your project details before generating the plan',
  },
];

export const NewProjectWizard: React.FC<{
  onGenerate: (data: ProjectInputData) => void;
  isGenerating: boolean;
  initialData?: TemplateData;
}> = ({ onGenerate, isGenerating, initialData }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ProjectInputData>(defaultFormData);
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
  });
  const [showValidationPanel, setShowValidationPanel] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    // If initialData is provided (from a template), use it.
    // Otherwise, try to restore the last draft from localStorage,
    // falling back to a blank form for a fresh project.
    let startingData: ProjectInputData = defaultFormData;

    if (initialData) {
      startingData = { ...defaultFormData, ...initialData } as ProjectInputData;
    } else {
      try {
        const storedDraft = localStorage.getItem(WIZARD_DRAFT_STORAGE_KEY);
        if (storedDraft) {
          const parsedDraft = JSON.parse(storedDraft) as ProjectInputData;
          startingData = { ...defaultFormData, ...parsedDraft };
        }
      } catch (e) {
        console.error('Failed to load wizard draft from localStorage', e);
      }
    }

    setFormData(startingData);
    setCurrentStep(0); // Reset to first step when data changes
    setValidationResult({ isValid: true, errors: [], warnings: [] });
    setShowValidationPanel(false);
  }, [initialData]);

  // Validate current step when it changes or when form data updates
  useEffect(() => {
    const result = validateStepData(currentStep, formData);
    setValidationResult(result);
  }, [currentStep, formData]);

  // Auto-save draft to localStorage whenever the form data changes
  useEffect(() => {
    try {
      const draftPayload = JSON.stringify(formData);
      localStorage.setItem(WIZARD_DRAFT_STORAGE_KEY, draftPayload);
    } catch (e) {
      console.error('Failed to save wizard draft to localStorage', e);
    }
  }, [formData]);

  const updateFormData = (field: keyof ProjectInputData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Re-validate the current step after changes
    setTimeout(() => {
      const result = validateStepData(currentStep, { ...formData, [field]: value });
      setValidationResult(result);
    }, 0);
  };

  const nextStep = () => {
    if (validationResult.isValid || currentStep === STEPS.length - 1) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    } else {
      setShowValidationPanel(true);
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleGenerate = () => {
    const completeValidation = validateCompleteForm(formData);
    if (completeValidation.isValid) {
      setShowPreviewModal(true);
    } else {
      setValidationResult(completeValidation);
      setShowValidationPanel(true);
    }
  };

  const handleConfirmGenerate = () => {
    setShowPreviewModal(false);
    onGenerate(formData);
  };

  const handleResetForm = () => {
    setFormData(defaultFormData);
    setCurrentStep(0);
    setValidationResult({ isValid: true, errors: [], warnings: [] });
    setShowValidationPanel(false);
    try {
      localStorage.removeItem(WIZARD_DRAFT_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear wizard draft from localStorage', e);
    }
  };

  const ValidationPanel: React.FC<{ result: ValidationResult }> = ({ result }) => {
    if (!showValidationPanel || (result.errors.length === 0 && result.warnings.length === 0))
      return null;

    return (
      <Card className="mt-4 border-l-4 border-l-red-500 bg-red-500/10">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {result.errors.length > 0 ? (
              <AlertTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
            ) : (
              <InfoIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
            )}
          </div>
          <div className="flex-grow">
            <h4
              className={`font-semibold ${result.errors.length > 0 ? 'text-red-700' : 'text-yellow-700'}`}
            >
              {result.errors.length > 0
                ? 'Please fix the following issues:'
                : 'Consider these suggestions:'}
            </h4>
            <ul className="mt-2 space-y-1 text-sm">
              {result.errors.map((error, i) => (
                <li key={`error-${i}`} className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span className="text-red-700">{error.message}</span>
                </li>
              ))}
              {result.warnings.map((warning, i) => (
                <li key={`warning-${i}`} className="flex items-start gap-2">
                  <span className="text-yellow-500 font-bold">•</span>
                  <span className="text-yellow-700">{warning.message}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowValidationPanel(false)}
              className="mt-3 text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      </Card>
    );
  };

  const StepIndicator: React.FC<{ current: number; total: number }> = ({ current, total }) => {
    return (
      <div className="flex items-center gap-2 mb-2">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className="flex items-center">
            <div
              className={`w-2 h-2 rounded-full ${
                i < current
                  ? 'bg-green-500'
                  : i === current
                    ? validationResult.isValid
                      ? 'bg-blue-500'
                      : 'bg-red-500'
                    : 'bg-gray-300'
              }`}
            />
            {i < total - 1 && (
              <div className={`w-4 h-0.5 ${i < current ? 'bg-green-500' : 'bg-gray-300'}`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const CurrentStepComponent = STEPS[currentStep].component;

  // eslint-disable-next-line react/no-unstable-nested-components
  const PreviewModal: React.FC = () => {
    if (!showPreviewModal) return null;

    return (
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onConfirm={handleConfirmGenerate}
        title="Preview Plan Generation"
        confirmText="Generate Plan"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <InfoIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-700">AI Plan Generation Preview</h4>
              <p className="text-sm text-blue-600 mt-1">
                The following AI generation process will be performed:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h5 className="font-medium text-brand-text-primary">📋 Requirements Analysis</h5>
              <p className="text-sm text-brand-text-secondary">
                AI will analyze {formData.coreRequirements.length} core requirements
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="font-medium text-brand-text-primary">🛠️ Architecture Design</h5>
              <p className="text-sm text-brand-text-secondary">
                System architecture diagram based on your modules
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="font-medium text-brand-text-primary">📊 Development Timeline</h5>
              <p className="text-sm text-brand-text-secondary">
                {formData.timeline} with {formData.numberOfFeatures} features
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="font-medium text-brand-text-primary">🎯 Feature Specification</h5>
              <p className="text-sm text-brand-text-secondary">
                Detailed breakdown of all {formData.numberOfFeatures} features
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <div className="flex items-start gap-3">
              <AlertTriangleIcon className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h6 className="font-semibold text-yellow-700 mb-1">Important Notes:</h6>
                <ul className="text-sm text-yellow-600 space-y-1">
                  <li>• Generation typically takes 10-30 seconds depending on complexity</li>
                  <li>• AI will generate comprehensive Mermaid diagrams for visualization</li>
                  <li>• All generated content can be edited and refined afterwards</li>
                  <li>• Previous plan versions are automatically saved</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-green-500/10 rounded border border-green-500/20">
            <p className="text-sm text-green-600">
              ✨ <strong>Ready to proceed!</strong> Your project data looks comprehensive for
              high-quality AI plan generation.
            </p>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <>
      <div className="w-full mx-auto bg-brand-surface/50 backdrop-blur-lg border border-brand-border/50 rounded-xl shadow-2xl p-8">
        <header className="mb-8">
          <div className="relative flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-brand-text-primary">
                {initialData
                  ? `New Project from Template: ${initialData.projectName}`
                  : 'Start a New Project'}
              </h2>
              <p className="text-brand-text-secondary mt-1">
                Step {currentStep + 1}: {STEPS[currentStep].title}
              </p>
            </div>
            <div className="absolute right-0 top-10 items-center gap-2 text-sm">
              {!validationResult.isValid && (
                <span className="flex items-center gap-1 text-red-500">
                  <AlertTriangleIcon className="h-4 w-4" />
                  Issues to fix
                </span>
              )}
              {validationResult.warnings.length > 0 && validationResult.isValid && (
                <span className="flex items-center gap-1 text-yellow-500">
                  <InfoIcon className="h-4 w-4" />
                  Suggestions available
                </span>
              )}
              {validationResult.isValid &&
                validationResult.errors.length === 0 &&
                validationResult.warnings.length === 0 && (
                  <span className="flex items-center gap-1 text-green-500">
                    <CheckCircleIcon className="h-4 w-4" />
                    All good
                  </span>
                )}
            </div>
          </div>
          <StepIndicator current={currentStep} total={STEPS.length} />
        </header>

        <main className="space-y-6">
          <div className="mb-6">
            <p className="text-brand-text-primary mb-4">{STEPS[currentStep].description}</p>
            <div className="flex items-center justify-between gap-4 p-4 bg-brand-surface border border-brand-border rounded-lg">
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={prevStep} disabled={currentStep === 0}>
                  Back
                </Button>
                <Button variant="secondary" onClick={handleResetForm}>
                  Reset
                </Button>
              </div>
              {currentStep < STEPS.length - 1 ? (
                <Button onClick={nextStep} disabled={!validationResult.isValid}>
                  Continue
                </Button>
              ) : (
                <Button onClick={handleGenerate} isLoading={isGenerating}>
                  Generate Plan
                </Button>
              )}
            </div>
          </div>
          <CurrentStepComponent
            data={formData}
            update={updateFormData}
            validation={validationResult}
          />
          <ValidationPanel result={validationResult} />
        </main>

        <footer className="mt-8 pt-6 border-t border-brand-border flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={prevStep} disabled={currentStep === 0}>
              Back
            </Button>
            <Button variant="secondary" onClick={handleResetForm}>
              Reset form
            </Button>
          </div>
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={nextStep} disabled={!validationResult.isValid}>
              Next: {STEPS[currentStep + 1].title}
            </Button>
          ) : (
            <Button onClick={handleGenerate} isLoading={isGenerating}>
              {isGenerating ? (
                'AI is analyzing project data...'
              ) : (
                <>
                  <WandSparklesIcon className="-ml-1 mr-2 h-5 w-5" />
                  Generate Plan with AI
                </>
              )}
            </Button>
          )}
        </footer>
      </div>

      <PreviewModal />
    </>
  );
};
