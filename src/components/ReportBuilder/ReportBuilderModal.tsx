import React, { useState, useCallback, useRef } from 'react';
import { ProjectPlan } from '../../types';
import { ReportSection, ReportConfig, FormattingOptions } from '../../types/report';
import { SectionEditor } from './SectionEditor';
import { ReportPreview } from './ReportPreview';
import { FormattingPanel } from './FormattingPanel';
import { SortableSectionItem } from './SortableSectionItem';
import {
  saveSectionConfig,
  loadSectionConfig,
  listConfigNames,
  deleteSectionConfig,
  exportConfigsToJSON,
  importConfigsFromJSON,
} from '@/utils/sectionConfigStorage';
import { AddSectionModal } from './AddSectionModal';
import { ConfirmationModal } from './ConfirmationModal';
import { FORMATTING_PRESETS } from '@/presets/formatting';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface ReportBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectPlan: ProjectPlan;
  projectName: string;
  onExport: (config: ReportConfig) => void;
}

const DEFAULT_SECTIONS: ReportSection[] = [
  { id: 'title', title: 'Title Page', isEnabled: true, type: 'static' },
  { id: 'toc', title: 'Table of Contents', isEnabled: true, type: 'static' },
  {
    id: 'summary',
    title: 'Executive Summary',
    isEnabled: true,
    type: 'text',
    dataSource: 'summary',
  },
  {
    id: 'components',
    title: 'Key Components',
    isEnabled: true,
    type: 'dynamic',
    dataSource: 'keyComponents',
  },
  {
    id: 'techStack',
    title: 'Technology Stack',
    isEnabled: true,
    type: 'dynamic',
    dataSource: 'recommendedTechStack',
  },
  {
    id: 'features',
    title: 'Feature Specifications',
    isEnabled: true,
    type: 'dynamic',
    dataSource: 'detailedFeatures',
  },
  {
    id: 'timeline',
    title: 'Development Timeline',
    isEnabled: true,
    type: 'dynamic',
    dataSource: 'developmentPlan',
  },
  {
    id: 'challenges',
    title: 'Challenges & Risks',
    isEnabled: true,
    type: 'dynamic',
    dataSource: 'potentialChallenges',
  },
];

export const ReportBuilderModal: React.FC<ReportBuilderModalProps> = ({
  isOpen,
  onClose,
  projectPlan,
  projectName,
  onExport,
}) => {
  const [sections, setSections] = useState<ReportSection[]>(DEFAULT_SECTIONS);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>('summary');
  const [reportTitle] = useState(projectName || 'Project Plan');
  const [activePanel, setActivePanel] = useState<'sections' | 'formatting'>('sections');
  const [theme, setTheme] = useState<'modern' | 'corporate' | 'minimal' | 'custom'>('modern');
  const [formatting, setFormatting] = useState<FormattingOptions>(FORMATTING_PRESETS.modern);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveConfigName, setSaveConfigName] = useState('');
  const [selectedConfigName, setSelectedConfigName] = useState<string | null>(null);
  const [showLoadDropdown, setShowLoadDropdown] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    configName: string;
  }>({ isOpen: false, configName: '' });
  const [showCompatibilityWarning, setShowCompatibilityWarning] = useState(false);
  const [pendingTheme, setPendingTheme] = useState<string | null>(null);
  const [showThemeConfirm, setShowThemeConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Browser compatibility check for @dnd-kit (Task #2.2)
  React.useEffect(() => {
    const checkDndKitCompatibility = () => {
      // Check for Pointer Events API (required by @dnd-kit)
      const hasPointerEvents = 'PointerEvent' in window;
      // Check for modern browser features
      const hasModernAPIs = 'requestAnimationFrame' in window && 'MutationObserver' in window;

      if (!hasPointerEvents || !hasModernAPIs) {
        setShowCompatibilityWarning(true);
      }
    };
    checkDndKitCompatibility();
  }, []);

  // Configure sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Debounced auto-save with race condition prevention (Task #2.8)
  const autoSaveTimerRef = useRef<number | null>(null);
  React.useEffect(() => {
    // Cancel any existing pending save to prevent race conditions
    if (autoSaveTimerRef.current !== null) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Schedule new auto-save
    autoSaveTimerRef.current = window.setTimeout(() => {
      const result = saveSectionConfig('__autosave__', sections);
      if (!result.success && result.error) {
        if (!result.error.includes('not found')) {
          console.warn('Auto-save failed:', result.error);
        }
      }
      autoSaveTimerRef.current = null;
    }, 500); // 500ms debounce

    return () => {
      if (autoSaveTimerRef.current !== null) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [sections]);

  const handleUpdateSection = (updatedSection: ReportSection) => {
    setSections((prev) => prev.map((s) => (s.id === updatedSection.id ? updatedSection : s)));
  };

  // Debounced drag end handler
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((prevSections) => {
        const oldIndex = prevSections.findIndex((s) => s.id === active.id);
        const newIndex = prevSections.findIndex((s) => s.id === over.id);
        return arrayMove(prevSections, oldIndex, newIndex);
      });
    }
  }, []);

  // Keyboard shortcuts for section reordering
  const handleKeyboardReorder = useCallback((sectionId: string, direction: 'up' | 'down') => {
    setSections((prevSections) => {
      const index = prevSections.findIndex((s) => s.id === sectionId);
      if (index === -1) return prevSections;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prevSections.length) return prevSections;

      return arrayMove(prevSections, index, newIndex);
    });
  }, []);

  const handleAddSection = (newSection: ReportSection) => {
    setSections((prev) => [...prev, newSection]);
    // Auto-select the new section
    setSelectedSectionId(newSection.id);
  };

  const handleSaveConfig = () => {
    if (!saveConfigName.trim()) {
      setErrorMessage('Please enter a configuration name');
      return;
    }
    const result = saveSectionConfig(saveConfigName.trim(), sections);
    if (result.success) {
      setIsSaveModalOpen(false);
      setSaveConfigName('');
      setErrorMessage(null);
    } else {
      setErrorMessage(result.error || 'Failed to save configuration');
    }
  };

  const handleLoadConfig = (configName: string) => {
    const result = loadSectionConfig(configName);
    if (result.success && result.data) {
      setSections(result.data.sections);
      setSelectedConfigName(configName);
      setShowLoadDropdown(false);
    } else {
      setErrorMessage(result.error || 'Failed to load configuration');
    }
  };

  const handleDeleteConfig = (configName: string) => {
    setDeleteConfirm({ isOpen: true, configName });
  };

  const confirmDeleteConfig = () => {
    deleteSectionConfig(deleteConfirm.configName);
    if (selectedConfigName === deleteConfirm.configName) {
      setSelectedConfigName(null);
    }
    setDeleteConfirm({ isOpen: false, configName: '' });
  };

  const handleExportConfigs = () => {
    const json = exportConfigsToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `section-configs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportConfigs = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = importConfigsFromJSON(content);
      if (result.success) {
        setErrorMessage(null);
        alert(`Successfully imported ${result.data} configuration(s)`);
      } else {
        setErrorMessage(result.error || 'Failed to import configurations');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectPreset = (presetName: string) => {
    // Confirm theme switch if user has customizations (Task #4.10)
    if (theme === 'custom' && presetName !== 'custom') {
      setPendingTheme(presetName);
      setShowThemeConfirm(true);
      return;
    }
    applyThemePreset(presetName);
  };

  const applyThemePreset = (presetName: string) => {
    // Define allowed theme types
    const allowedThemes = ['modern', 'corporate', 'minimal', 'custom'] as const;
    type ThemeType = (typeof allowedThemes)[number];

    // Type-safe theme check
    if (allowedThemes.includes(presetName as ThemeType)) {
      const typedTheme = presetName as ThemeType;
      setTheme(typedTheme);

      // Apply preset if not custom and exists
      if (typedTheme !== 'custom' && FORMATTING_PRESETS[typedTheme]) {
        setFormatting(FORMATTING_PRESETS[typedTheme]);
      }
    }
  };

  const confirmThemeSwitch = () => {
    if (pendingTheme) {
      applyThemePreset(pendingTheme);
      setPendingTheme(null);
    }
    setShowThemeConfirm(false);
  };

  const handleFormattingUpdate = (newFormatting: FormattingOptions) => {
    setFormatting(newFormatting);
    // When user customizes, switch to 'custom' theme
    if (theme !== 'custom') {
      setTheme('custom');
    }
  };

  const handleExport = () => {
    onExport({
      title: reportTitle,
      sections,
      theme,
      formatting,
    });
  };

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-[95vw] h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Browser Compatibility Warning */}
        {showCompatibilityWarning && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border-b border-yellow-200 dark:border-yellow-800 px-6 py-3 flex items-center gap-3">
            <span className="text-yellow-600 dark:text-yellow-400 text-xl">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Browser Compatibility Warning
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Your browser may not fully support drag-and-drop. Please use keyboard shortcuts
                (Ctrl+↑/↓) or upgrade to a modern browser for the best experience.
              </p>
            </div>
            <button
              onClick={() => setShowCompatibilityWarning(false)}
              className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
              aria-label="Dismiss warning"
            >
              ✕
            </button>
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Custom Export Builder
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Customize your report structure and formatting
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => setActivePanel('sections')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activePanel === 'sections'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Sections
            </button>
            <button
              onClick={() => setActivePanel('formatting')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activePanel === 'formatting'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Formatting
            </button>
          </div>

          {/* Configuration Management */}
          <div className="flex items-center gap-2">
            {/* Save Configuration */}
            <button
              onClick={() => setIsSaveModalOpen(true)}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors"
              title="Save current section configuration"
            >
              💾 Save
            </button>

            {/* Load Configuration - Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLoadDropdown(!showLoadDropdown)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors"
                title="Load saved configuration"
              >
                📂 Load
              </button>
              {showLoadDropdown && (
                <div className="absolute top-full mt-1 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl min-w-[200px] max-h-[300px] overflow-y-auto z-10">
                  {listConfigNames().length > 0 ? (
                    listConfigNames().map((name) => (
                      <div
                        key={name}
                        className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
                      >
                        <button
                          onClick={() => handleLoadConfig(name)}
                          className="flex-1 text-left text-sm text-gray-700 dark:text-gray-300"
                        >
                          {name}
                        </button>
                        <button
                          onClick={() => handleDeleteConfig(name)}
                          className="ml-2 text-red-500 hover:text-red-700 text-xs"
                          title="Delete configuration"
                        >
                          🗑️
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                      No saved configurations
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Export / Import */}
            <button
              onClick={handleExportConfigs}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors"
              title="Export all configurations as JSON"
            >
              ⬇️ Export
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportConfigs}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors"
              title="Import configurations from JSON"
            >
              ⬆️ Import
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors flex items-center gap-2"
            >
              <span>Download Report</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar: Sections List OR Formatting Panel */}
          <div className="w-1/4 min-w-[280px] border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-gray-50 dark:bg-gray-900/30">
            {activePanel === 'sections' ? (
              <div className="p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Report Structure
                </h3>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sections.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2 group">
                      {sections.map((section) => (
                        <div
                          key={section.id}
                          onKeyDown={(e) => {
                            // Keyboard shortcuts: Ctrl/Cmd + Arrow Up/Down
                            if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowUp') {
                              e.preventDefault();
                              handleKeyboardReorder(section.id, 'up');
                            } else if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowDown') {
                              e.preventDefault();
                              handleKeyboardReorder(section.id, 'down');
                            }
                          }}
                        >
                          <SortableSectionItem
                            section={section}
                            isSelected={selectedSectionId === section.id}
                            onSelect={setSelectedSectionId}
                            onToggle={(id, isEnabled) => {
                              setSections((prev) =>
                                prev.map((s) => (s.id === id ? { ...s, isEnabled } : s)),
                              );
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                {/* Add Section Button */}
                <button
                  onClick={() => setIsAddSectionModalOpen(true)}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M10 5v10M5 10h10" />
                  </svg>
                  <span className="text-sm font-medium">Add Section</span>
                </button>
              </div>
            ) : (
              <FormattingPanel
                formatting={formatting}
                onUpdate={handleFormattingUpdate}
                onSelectPreset={handleSelectPreset}
                currentTheme={theme}
              />
            )}
          </div>

          {/* Center Panel: Editor */}
          <div className="flex-1 border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-white dark:bg-gray-800 p-6">
            {selectedSection ? (
              <div className="max-w-3xl mx-auto">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                  Editing: {selectedSection.title}
                </h3>
                <SectionEditor
                  key={selectedSectionId}
                  section={selectedSection}
                  onUpdate={handleUpdateSection}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <span className="text-4xl mb-4">👈</span>
                <p>Select a section to edit content</p>
              </div>
            )}
          </div>

          {/* Right Panel: Preview (Collapsible?) */}
          <div className="w-1/3 min-w-[320px] bg-gray-100 dark:bg-gray-900 p-6 overflow-y-auto hidden xl:block">
            <ReportPreview title={reportTitle} sections={sections} projectPlan={projectPlan} />
          </div>
        </div>
      </div>

      {/* Add Section Modal */}
      <AddSectionModal
        isOpen={isAddSectionModalOpen}
        onClose={() => setIsAddSectionModalOpen(false)}
        onAddSection={handleAddSection}
      />

      {/* Save Configuration Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-[400px] p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Save Configuration
            </h3>
            <input
              type="text"
              value={saveConfigName}
              onChange={(e) => setSaveConfigName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveConfig();
              }}
              placeholder="Enter configuration name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-4"
              autoFocus
            />
            {errorMessage && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">{errorMessage}</p>
            )}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setIsSaveModalOpen(false);
                  setSaveConfigName('');
                  setErrorMessage(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {errorMessage && !isSaveModalOpen && (
        <div className="fixed bottom-4 right-4 z-50 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-white hover:text-gray-200">
            ✕
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, configName: '' })}
        onConfirm={confirmDeleteConfig}
        title="Delete Configuration"
        message={`Are you sure you want to delete "${deleteConfirm.configName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
      />

      {/* Theme Switch Confirmation Modal (Task #4.10) */}
      <ConfirmationModal
        isOpen={showThemeConfirm}
        onClose={() => {
          setShowThemeConfirm(false);
          setPendingTheme(null);
        }}
        onConfirm={confirmThemeSwitch}
        title="Switch Theme Preset"
        message="Switching to a preset theme will reset your custom formatting changes.  Do you want to continue?"
        confirmText="Switch Theme"
        cancelText="Cancel"
        isDangerous={false}
      />
    </div>
  );
};
