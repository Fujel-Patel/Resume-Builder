"use client";

import React, { createContext, useContext, useCallback, useState } from 'react';
import { ToastNotification, ToastProps } from './ToastNotification';
import { ToastContainer } from './ToastNotification';

interface ToastContextValue {
  /** Add a new toast */
  addToast: (props: Omit<ToastProps, 'onClose'>) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Array<ToastProps>>([]);

  const removeToast = useCallback((id: string | number | undefined) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((props: Omit<ToastProps, 'onClose'>) => {
    const id = props.id ?? Date.now();
    setToasts((prev) => [...prev, { ...props, id, onClose: () => removeToast(id) }]);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer>
        {toasts.map((toast) => (
          <ToastNotification key={toast.id} {...toast} />
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};
