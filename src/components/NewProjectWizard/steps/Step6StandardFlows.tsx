import React from 'react';
import type { ProjectInputData } from '../../../types';
import { TabbedListEditor } from '../../TabbedListEditor';
import type { TabbedItem } from '../../TabbedListEditor';

export const Step6StandardFlows: React.FC<{
  data: ProjectInputData;
  update: (field: keyof ProjectInputData, value: unknown) => void;
}> = ({ data, update }) => {
  const standardFlows = (data.standardFlows || []) as unknown as TabbedItem[];

  return (
    <TabbedListEditor
      items={standardFlows}
      onUpdate={(items) => update('standardFlows', items)}
      title="Standard Flows"
      itemLabel="Flow"
      nameField="flowName"
      listField="steps"
      listLabel="Steps"
      emptyStateMessage="No flows defined yet."
      placeholderName="e.g., Order Processing"
    />
  );
};
