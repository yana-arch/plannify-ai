import React from 'react';
import type { ProjectInputData } from '../../../types';
import { TabbedListEditor } from '../../TabbedListEditor';
import type { TabbedItem } from '../../TabbedListEditor';

export const Step5RolePermissions: React.FC<{
  data: ProjectInputData;
  update: (field: keyof ProjectInputData, value: unknown) => void;
}> = ({ data, update }) => {
  const rolePermissions = (data.rolePermissions || []) as unknown as TabbedItem[];

  return (
    <TabbedListEditor
      items={rolePermissions}
      onUpdate={(items) => update('rolePermissions', items)}
      title="Role & Permissions"
      itemLabel="Role"
      nameField="role"
      listField="permissions"
      listLabel="Permissions"
      emptyStateMessage="No roles defined yet."
      placeholderName="e.g., Administrator"
    />
  );
};
