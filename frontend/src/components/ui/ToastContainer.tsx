import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useToast, Toast } from '@/hooks/use-toast';

const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="fixed bottom-0 right-0 p-4 space-y-2 z-50 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const { id, title, description, variant } = toast;

  // Auto-dismiss after specified duration
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [id, toast.duration, onDismiss]);

  // Determine variant classes
  let variantClasses = 'bg-white text-gray-900';
  if (variant === 'destructive') {
    variantClasses = 'bg-error text-white';
  } else if (variant === 'success') {
    variantClasses = 'bg-success text-white';
  }

  return (
    <div
      className={`rounded-lg shadow-lg ${variantClasses} transform transition-all duration-300 ease-out p-4 flex items-start`}
      role="alert"
    >
      <div className="flex-1 mr-2">
        <h3 className="font-medium text-sm">{title}</h3>
        {description && <p className="text-xs mt-1">{description}</p>}
      </div>
      <button
        className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 hover:bg-opacity-20 transition-colors"
        onClick={() => onDismiss(id)}
        aria-label="Close toast"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ToastContainer;