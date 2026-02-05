import React, { useState } from 'react';
import type { ProjectInputData } from '../../../types';
import { Button, Input, Card } from '../../ui';
import { XIcon } from '../../icons';

export const Step7RiskAssessmentAndMetrics: React.FC<{
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
