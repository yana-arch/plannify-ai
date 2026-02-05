import React, { useState } from 'react';
import type { ProjectPlan, CritiqueResult, APIProvider } from '../types';
import { Card, Button, Badge } from './ui';
import { generateCritique } from '../services/aiService';
import { useSettings } from '../SettingsContext';
import { AlertTriangleIcon, CheckCircleIcon, LightbulbIcon, PlayIcon, UserIcon } from './icons';
import ReactMarkdown from 'react-markdown';

interface AIReviewTabProps {
  plan: ProjectPlan;
  projectName: string;
}

const PERSONAS = [
  {
    id: 'vc',
    name: 'VC Investor',
    description: 'Focuses on business viability, scalability, and ROI.',
    icon: '💰',
  },
  {
    id: 'cto',
    name: 'Strict CTO',
    description: 'Focuses on technical architecture, security, and debt.',
    icon: '💻',
  },
  {
    id: 'user',
    name: 'UX Advocate',
    description: 'Focuses on user journey, accessibility, and friction.',
    icon: '👥',
  },
  {
    id: 'hacker',
    name: 'Security Expert',
    description: 'Focuses on vulnerabilities and data protection.',
    icon: '🛡️',
  },
];

export const AIReviewTab: React.FC<AIReviewTabProps> = ({ plan, projectName }) => {
  const { activeProvider } = useSettings();
  const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [critique, setCritique] = useState<CritiqueResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!activeProvider) {
      setError('No active AI provider configured.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await generateCritique(
        plan,
        projectName,
        selectedPersona.name,
        activeProvider,
      );
      setCritique(result);
    } catch (err) {
      console.error(err);
      setError('Failed to generate critique. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Persona Selection */}
        <Card className="col-span-1 border-brand-border bg-brand-surface/50">
          <h3 className="text-lg font-semibold text-brand-text-primary mb-4 flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-brand-primary" />
            Select Reviewer
          </h3>
          <div className="space-y-3">
            {PERSONAS.map((persona) => (
              <button
                key={persona.id}
                onClick={() => setSelectedPersona(persona)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedPersona.id === persona.id
                    ? 'border-brand-primary bg-brand-primary/10 ring-1 ring-brand-primary'
                    : 'border-brand-border hover:border-brand-primary/50'
                }`}
              >
                <div className="font-medium text-brand-text-primary flex items-center gap-2">
                  <span className="text-xl">{persona.icon}</span>
                  {persona.name}
                </div>
                <div className="text-xs text-brand-text-secondary mt-1 ml-8">
                  {persona.description}
                </div>
              </button>
            ))}
          </div>
          <div className="mt-6">
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full"
              variant={isAnalyzing ? 'secondary' : 'primary'}
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></span>
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <PlayIcon className="h-4 w-4" />
                  Run Analysis
                </span>
              )}
            </Button>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>
        </Card>

        {/* Results Area */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          {!critique ? (
            <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-brand-border rounded-xl text-brand-text-secondary">
              <span className="text-4xl mb-4">🕵️‍♀️</span>
              <p className="text-lg font-medium">Ready to Review</p>
              <p className="text-sm text-center max-w-sm mt-2">
                Select a persona and click "Run Analysis" to get a critical evaluation of your
                project plan.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              {/* Score Card */}
              <Card className="bg-brand-surface border-brand-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-brand-text-primary flex items-center gap-2">
                      {selectedPersona.icon} {selectedPersona.name}'s Report
                    </h2>
                    <p className="text-brand-text-secondary">
                      Generated on {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-brand-text-secondary uppercase tracking-wider font-semibold">
                      Overall Score
                    </span>
                    <div
                      className={`text-4xl font-bold ${
                        critique.score >= 80
                          ? 'text-green-500'
                          : critique.score >= 60
                            ? 'text-yellow-500'
                            : 'text-red-500'
                      }`}
                    >
                      {critique.score}/100
                    </div>
                  </div>
                </div>
              </Card>

              {/* Strengths */}
              <Card className="border-l-4 border-l-green-500">
                <h3 className="text-lg font-semibold text-green-600 mb-3 flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5" />
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {critique.strengths.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-brand-text-primary">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Weaknesses */}
              <Card className="border-l-4 border-l-red-500">
                <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center gap-2">
                  <AlertTriangleIcon className="h-5 w-5" />
                  Critical Issues & Weaknesses
                </h3>
                <ul className="space-y-2">
                  {critique.weaknesses.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-brand-text-primary">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Suggestions */}
              <Card className="border-l-4 border-l-blue-500">
                <h3 className="text-lg font-semibold text-blue-600 mb-3 flex items-center gap-2">
                  <LightbulbIcon className="h-5 w-5" />
                  Actionable Suggestions
                </h3>
                <ul className="space-y-2">
                  {critique.suggestions.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-brand-text-primary">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
