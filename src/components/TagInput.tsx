import React, { useState } from 'react';
import { Tag } from './ui';

export const TagInput: React.FC<{
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
