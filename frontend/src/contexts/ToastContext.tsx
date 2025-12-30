import { createContext, useContext, ReactNode } from 'react';
import toast, { Toaster, Toast } from 'react-hot-toast';

interface ToastContextData {
  success: (message: string) => void;
  error: (message: string) => void;
  loading: (message: string) => string;
  dismiss: (toastId: string) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const success = (message: string) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#10b981',
        color: '#fff',
        fontWeight: 600,
        borderRadius: '8px',
        padding: '16px',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10b981',
      },
    });
  };

  const error = (message: string) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#ef4444',
        color: '#fff',
        fontWeight: 600,
        borderRadius: '8px',
        padding: '16px',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#ef4444',
      },
    });
  };

  const loading = (message: string): string => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#0ea5e9',
        color: '#fff',
        fontWeight: 600,
        borderRadius: '8px',
        padding: '16px',
      },
    });
  };

  const dismiss = (toastId: string) => {
    toast.dismiss(toastId);
  };

  return (
    <ToastContext.Provider value={{ success, error, loading, dismiss }}>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          className: '',
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
            padding: '16px',
          },
        }}
      />
      {children}
    </ToastContext.Provider>
  );
}
