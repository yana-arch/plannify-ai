import React from 'react';
import type { ProjectInputData } from '../../../types';
import { TabbedListEditor } from '../../TabbedListEditor';
import type { TabbedItem } from '../../TabbedListEditor';

export const Step4CoreModules: React.FC<{
  data: ProjectInputData;
  update: (field: keyof ProjectInputData, value: unknown) => void;
}> = ({ data, update }) => {
  // We need to cast our types to fit TabbedItem for the editor, simplifying the interface
  // In a real app we might align the types better, but here we just map the fields.
  const coreModules = (data.coreModules || []) as unknown as TabbedItem[];

  return (
    <TabbedListEditor
      items={coreModules}
      onUpdate={(items) => update('coreModules', items)}
      title="Core Modules"
      itemLabel="Module"
      nameField="moduleName"
      descriptionField="description"
      listField="flows"
      listLabel="Key Flows"
      emptyStateMessage="No modules defined yet."
      placeholderName="e.g., User Authentication"
      placeholderDescription="Describe what this module does..."
    />
  );
};
