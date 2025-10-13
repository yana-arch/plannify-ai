
import React, { useState } from 'react';
import type { ProjectPlan, FeatureSpecification } from '../types';
import { Card } from './ui';

const PlanSubNav: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void; projectName: string }> = ({ activeTab, setActiveTab, projectName }) => {
    const navItems = ['Overview', 'Features', 'Development', 'Reports'];
    return (
        <aside className="w-56 flex-shrink-0 p-4">
            <h2 className="text-lg font-semibold mb-6 text-brand-text-primary">{projectName}</h2>
            <nav className="space-y-1">
                {navItems.map(item => (
                    <button
                        key={item}
                        onClick={() => setActiveTab(item)}
                        className={`w-full text-left flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeTab === item
                            ? 'text-brand-text-primary bg-brand-surface border-l-2 border-brand-primary'
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

const OverviewTab: React.FC<{ plan: ProjectPlan }> = ({ plan }) => (
    <div className="space-y-8">
        <Card>
            <h3 className="text-lg font-semibold mb-2">AI-Generated Project Summary</h3>
            <p className="text-brand-text-secondary">{plan.summary}</p>
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

const FeatureCard: React.FC<{ feature: FeatureSpecification }> = ({ feature }) => {
  return (
    <Card>
      <h4 className="text-md font-semibold text-brand-primary-hover mb-2">{feature.name}</h4>
      <p className="text-sm text-brand-text-secondary mb-4">{feature.description}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <h5 className="font-semibold text-brand-text-primary mb-1">Main Functions</h5>
          <ul className="list-disc list-inside text-brand-text-secondary">
            {feature.mainFunctions.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
        <div>
          <h5 className="font-semibold text-brand-text-primary mb-1">Sub-Features</h5>
          <ul className="list-disc list-inside text-brand-text-secondary">
            {feature.subFeatures.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
      </div>
    </Card>
  );
};

const FeaturesTab: React.FC<{ plan: ProjectPlan }> = ({ plan }) => (
    <div className="space-y-6">
        <h3 className="text-xl font-bold">Project Features & Specifications</h3>
        {plan.detailedFeatures.map((feature, i) => <FeatureCard key={i} feature={feature} />)}
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


export const ProjectPlanView: React.FC<{ plan: ProjectPlan, projectName: string }> = ({ plan, projectName }) => {
    const [activeTab, setActiveTab] = useState('Overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'Overview':
                return <OverviewTab plan={plan} />;
            case 'Features':
                return <FeaturesTab plan={plan} />;
            case 'Development':
                return <DevelopmentTab plan={plan} />;
            case 'Reports':
                return <Card><p>Reports functionality coming soon.</p></Card>;
            default:
                return <OverviewTab plan={plan} />;
        }
    };

    return (
        <div className="flex flex-grow bg-brand-surface/50 backdrop-blur-lg border border-brand-border/50 rounded-xl shadow-2xl p-4">
            <PlanSubNav activeTab={activeTab} setActiveTab={setActiveTab} projectName={projectName} />
            <main className="flex-grow p-6 overflow-y-auto max-h-[calc(100vh-10rem)]">
                {renderContent()}
            </main>
        </div>
    );
};
