import React, { useState } from 'react';

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: boolean;
  loading?: boolean;
}
export const Input: React.FC<InputProps> = ({
  label,
  id,
  error = false,
  loading = false,
  className = '',
  ...props
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-brand-text-secondary mb-1">
      {label}
    </label>
    <div className="relative">
      <input
        id={id}
        className={`w-full bg-brand-bg border rounded-md px-3 py-2 text-brand-text-primary transition-all duration-200 ${
          error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-brand-border focus:ring-2 focus:ring-brand-primary focus:border-brand-primary'
        } focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-brand-bg ${loading ? 'pr-10' : ''} ${className}`}
        {...props}
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  </div>
);

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: boolean;
  loading?: boolean;
}
export const Textarea: React.FC<TextareaProps> = ({
  label,
  id,
  error = false,
  loading = false,
  className = '',
  ...props
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-brand-text-secondary mb-1">
      {label}
    </label>
    <div className="relative">
      <textarea
        id={id}
        rows={3}
        className={`w-full bg-brand-bg border rounded-md px-3 py-2 text-brand-text-primary resize-vertical transition-all duration-200 ${
          error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-brand-border focus:ring-2 focus:ring-brand-primary focus:border-brand-primary'
        } focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-brand-bg ${loading ? 'pr-10' : ''} ${className}`}
        {...props}
      />
      {loading && (
        <div className="absolute right-3 top-3">
          <div className="h-4 w-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  </div>
);

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, variant = 'primary', isLoading = false, ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg disabled:opacity-50 disabled:pointer-events-none';
    const variantClasses = {
      primary: 'bg-brand-primary text-white hover:bg-brand-primary-hover focus:ring-brand-primary',
      secondary:
        'bg-brand-surface border border-brand-border text-brand-text-primary hover:bg-brand-border',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        disabled={isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  },
);

// Card Component
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={`bg-brand-surface border border-brand-border rounded-lg p-6 ${className}`}>
    {children}
  </div>
);

// Tag Component
export const Tag: React.FC<{
  children: React.ReactNode;
  onRemove?: () => void;
  className?: string;
}> = ({ children, onRemove, className }) => (
  <span
    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-primary/20 text-brand-primary-hover ${className}`}
  >
    {children}
    {onRemove && (
      <button
        onClick={onRemove}
        className="ml-2 -mr-1 flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center text-brand-primary-hover hover:bg-brand-primary/30 focus:outline-none"
      >
        <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
          <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
        </svg>
      </button>
    )}
  </span>
);

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  isConfirming?: boolean;
}
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = 'Confirm',
  isConfirming = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-brand-surface border border-brand-border rounded-lg shadow-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-brand-text-primary mb-2">{title}</h3>
        <div className="text-sm text-brand-text-secondary mb-6">{children}</div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isConfirming}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm} isLoading={isConfirming}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Search Input Component with enhanced UX
interface SearchInputProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
  loading?: boolean;
  error?: boolean;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  label,
  id,
  value,
  onChange,
  placeholder = 'Enter value...',
  suggestions = [],
  onSuggestionSelect,
  loading = false,
  error = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.toLowerCase().includes(value.toLowerCase()) &&
      suggestion.toLowerCase() !== value.toLowerCase(),
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev <= 0 ? filteredSuggestions.length - 1 : prev - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const selectedSuggestion = filteredSuggestions[selectedIndex];
      onSuggestionSelect?.(selectedSuggestion);
      onChange(selectedSuggestion);
      setIsOpen(false);
      setSelectedIndex(-1);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionSelect?.(suggestion);
    onChange(suggestion);
    setIsOpen(false);
  };

  React.useEffect(() => {
    if (value && filteredSuggestions.length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [value, suggestions]);

  return (
    <div className="relative">
      <label htmlFor={id} className="block text-sm font-medium text-brand-text-secondary mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value && filteredSuggestions.length > 0 && setIsOpen(true)}
          onBlur={() =>
            setTimeout(() => {
              setIsOpen(false);
              setSelectedIndex(-1);
            }, 200)
          }
          placeholder={placeholder}
          className={`w-full bg-brand-bg border rounded-md px-3 py-2 text-brand-text-primary transition-all duration-200 pr-10 ${
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-brand-border focus:ring-2 focus:ring-brand-primary focus:border-brand-primary'
          } focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-brand-bg ${className}`}
          autoComplete="off"
        />
        <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2`}>
          {loading && (
            <div className="h-4 w-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          )}
          {!loading && value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="h-4 w-4 text-brand-text-secondary hover:text-brand-text-primary transition-colors"
              title="Clear"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-brand-surface border border-brand-border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredSuggestions.slice(0, 10).map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full text-left px-3 py-2 hover:bg-brand-bg transition-colors ${
                index === selectedIndex
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-brand-text-primary'
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
