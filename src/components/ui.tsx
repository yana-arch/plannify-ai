import React from 'react';

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
export const Input: React.FC<InputProps> = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-brand-text-secondary mb-1">{label}</label>
    <input
      id={id}
      className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
      {...props}
    />
  </div>
);

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}
export const Textarea: React.FC<TextareaProps> = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-brand-text-secondary mb-1">{label}</label>
    <textarea
      id={id}
      rows={3}
      className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
      {...props}
    />
  </div>
);

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ children, className, variant = 'primary', isLoading = false, ...props }, ref) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg disabled:opacity-50 disabled:pointer-events-none";
  const variantClasses = {
    primary: "bg-brand-primary text-white hover:bg-brand-primary-hover focus:ring-brand-primary",
    secondary: "bg-brand-surface border border-brand-border text-brand-text-primary hover:bg-brand-border",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
  };

  return (
    <button ref={ref} className={`${baseClasses} ${variantClasses[variant]} ${className}`} disabled={isLoading} {...props}>
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
});

// Card Component
export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <div className={`bg-brand-surface border border-brand-border rounded-lg p-6 ${className}`}>
    {children}
  </div>
);

// Tag Component
export const Tag: React.FC<{ children: React.ReactNode, onRemove?: () => void, className?: string }> = ({ children, onRemove, className }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-primary/20 text-brand-primary-hover ${className}`}>
    {children}
    {onRemove && (
      <button onClick={onRemove} className="ml-2 -mr-1 flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center text-brand-primary-hover hover:bg-brand-primary/30 focus:outline-none">
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
  isConfirming = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="bg-brand-surface border border-brand-border rounded-lg shadow-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-brand-text-primary mb-2">{title}</h3>
        <div className="text-sm text-brand-text-secondary mb-6">
          {children}
        </div>
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