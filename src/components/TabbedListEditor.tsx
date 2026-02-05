import React from 'react';
import { Button, Input, Textarea, Card } from './ui';
import { PlusCircleIcon, XIcon } from './icons';

export interface TabbedItem {
  name: string;
  description?: string;
  list?: string[];
  [key: string]: any;
}

interface TabbedListEditorProps<T extends TabbedItem> {
  items: T[];
  onUpdate: (items: T[]) => void;
  title: string;
  itemLabel: string;
  nameField: keyof T;
  descriptionField?: keyof T; // Optional
  listField?: keyof T; // Optional, e.g., 'flows' or 'permissions'
  listLabel?: string; // Label for the list items, e.g., "Flows" or "Permissions"
  emptyStateMessage?: string;
  placeholderName?: string;
  placeholderDescription?: string;
  renderExtraFields?: (
    item: T,
    updateItem: (field: keyof T, value: any) => void,
  ) => React.ReactNode;
}

export function TabbedListEditor<T extends TabbedItem>({
  items,
  onUpdate,
  title,
  itemLabel,
  nameField,
  descriptionField,
  listField,
  listLabel = 'Items',
  emptyStateMessage = 'No items defined yet.',
  placeholderName = 'e.g., New Item',
  placeholderDescription = 'Description...',
  renderExtraFields,
}: TabbedListEditorProps<T>) {
  const [activeTab, setActiveTab] = React.useState(0);

  // Ensure activeTab is valid
  React.useEffect(() => {
    if (items && items.length > 0) {
      if (activeTab >= items.length) {
        setActiveTab(Math.max(0, items.length - 1));
      }
    }
  }, [items?.length, activeTab]);

  const addItem = () => {
    // We can't know the exact structure of T, but we can create a base object
    // and let the parent handle specific defaults if needed, or just default strictly here.
    // For now, assuming T allows partials or we construct a minimal valid T.
    // Ideally, the parent should pass a "create info" or similar, but let's keep it simple.
    // We'll trust that T interacts well with this structure.

    // Using 'as any' here because generic instantiation is tricky in TS without a factory.
    // In a real app we might pass a `createNewItem` prop.
    const newItem: any = {
      [nameField]: `New ${itemLabel}`,
    };
    if (descriptionField) newItem[descriptionField] = '';
    if (listField) newItem[listField] = [];

    const newItems = [...(items || []), newItem];
    onUpdate(newItems);
    setActiveTab(newItems.length - 1);
  };

  const removeItem = (index: number) => {
    if (!window.confirm(`Are you sure you want to delete this ${itemLabel}?`)) return;
    const newItems = items.filter((_, i) => i !== index);
    onUpdate(newItems);
    // Active tab adjustment handled by effect, but good to be explicit if needed
  };

  const updateItemField = (index: number, field: keyof T, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onUpdate(newItems);
  };

  const addListItem = (index: number) => {
    if (!listField) return;
    const newItems = [...items];
    const currentList = newItems[index][listField] as unknown as string[];
    // Ensure list exists
    const newList = currentList ? [...currentList, ''] : [''];
    newItems[index] = { ...newItems[index], [listField]: newList };
    onUpdate(newItems);
  };

  const updateListItem = (itemIndex: number, listIndex: number, value: string) => {
    if (!listField) return;
    const newItems = [...items];
    const currentList = [...(newItems[itemIndex][listField] as unknown as string[])];
    currentList[listIndex] = value;
    newItems[itemIndex] = { ...newItems[itemIndex], [listField]: currentList };
    onUpdate(newItems);
  };

  const removeListItem = (itemIndex: number, listIndex: number) => {
    if (!listField) return;
    const newItems = [...items];
    const currentList = (newItems[itemIndex][listField] as unknown as string[]).filter(
      (_, i) => i !== listIndex,
    );
    newItems[itemIndex] = { ...newItems[itemIndex], [listField]: currentList };
    onUpdate(newItems);
  };

  const currentItem = items?.[activeTab];

  return (
    <div className="space-y-6">
      <div>
        {/* Tabs Header */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-brand-border mb-4">
          {(items || []).map((item, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === index
                  ? 'bg-brand-primary/10 text-brand-primary border-b-2 border-brand-primary'
                  : 'text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-surface'
              }`}
            >
              {String(item[nameField]) || `${itemLabel} ${index + 1}`}
            </button>
          ))}
          <Button variant="secondary" onClick={addItem} className="!p-2 flex-shrink-0">
            <PlusCircleIcon className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        {/* Active Tab Content */}
        {currentItem ? (
          <Card key={activeTab} className="animate-fadeIn">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium text-brand-text-primary">
                Editing: {String(currentItem[nameField]) || `Untitled ${itemLabel}`}
              </h4>
              <Button
                variant="danger"
                onClick={() => removeItem(activeTab)}
                className="!py-1 !px-3 text-xs"
              >
                Delete {itemLabel}
              </Button>
            </div>
            <div className="space-y-4">
              <Input
                label={`${itemLabel} Name`}
                value={String(currentItem[nameField])}
                onChange={(e) => updateItemField(activeTab, nameField, e.target.value)}
                placeholder={placeholderName}
              />

              {descriptionField && (
                <Textarea
                  label="Description"
                  value={String(currentItem[descriptionField] || '')}
                  onChange={(e) => updateItemField(activeTab, descriptionField, e.target.value)}
                  rows={3}
                  placeholder={placeholderDescription}
                />
              )}

              {listField && (
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                    {listLabel}
                  </label>
                  <div className="space-y-2">
                    {((currentItem[listField] as unknown as string[]) || []).map(
                      (listItem, listIndex) => (
                        <div key={listIndex} className="flex gap-2">
                          <div className="flex-grow">
                            <Input
                              label=""
                              value={listItem}
                              onChange={(e) => updateListItem(activeTab, listIndex, e.target.value)}
                              placeholder={`e.g., New ${listLabel} Item`}
                            />
                          </div>
                          <Button
                            variant="secondary"
                            onClick={() => removeListItem(activeTab, listIndex)}
                            className="!p-2"
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ),
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => addListItem(activeTab)}
                    className="text-sm mt-2"
                  >
                    <PlusCircleIcon className="h-4 w-4 mr-2" />
                    Add {listLabel.slice(0, -1)} {/* Attempt to singularize */}
                  </Button>
                </div>
              )}

              {renderExtraFields &&
                renderExtraFields(currentItem, (field, value) =>
                  updateItemField(activeTab, field, value),
                )}
            </div>
          </Card>
        ) : (
          <div className="text-center py-10 bg-brand-surface/30 rounded-lg border border-dashed border-brand-border">
            <p className="text-brand-text-secondary mb-4">{emptyStateMessage}</p>
            <Button onClick={addItem}>
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Create First {itemLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
