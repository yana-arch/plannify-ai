import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ReportSection } from '@/types/report';

interface SortableSectionItemProps {
  section: ReportSection;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onToggle: (id: string, isEnabled: boolean) => void;
}

export const SortableSectionItem: React.FC<SortableSectionItemProps> = ({
  section,
  isSelected,
  onSelect,
  onToggle,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
        isSelected
          ? 'bg-white dark:bg-gray-800 border-indigo-500 shadow-sm ring-1 ring-indigo-500'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300'
      }`}
    >
      {/* Drag Handle (Notion-style) */}
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        aria-label={`Drag to reorder ${section.title}`}
        aria-description="Use Ctrl+Arrow keys to reorder, or drag with mouse"
        tabIndex={0}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="pointer-events-none"
        >
          <circle cx="4" cy="4" r="1.5" />
          <circle cx="4" cy="8" r="1.5" />
          <circle cx="4" cy="12" r="1.5" />
          <circle cx="12" cy="4" r="1.5" />
          <circle cx="12" cy="8" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
        </svg>
      </button>

      {/* Checkbox */}
      <input
        type="checkbox"
        checked={section.isEnabled}
        tabIndex={-1}
        onChange={(e) => {
          e.stopPropagation();
          onToggle(section.id, e.target.checked);
        }}
        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 flex-shrink-0"
      />

      {/* Section Title */}
      <button
        onClick={() => onSelect(section.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(section.id);
          }
        }}
        className={`flex-1 text-left text-sm font-medium focus:outline-none ${
          section.isEnabled ? 'text-gray-900 dark:text-gray-200' : 'text-gray-400 line-through'
        }`}
      >
        {section.title}
      </button>
    </div>
  );
};
