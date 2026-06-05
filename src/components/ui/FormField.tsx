import React from "react";

interface FormFieldProps {
  label: string;
  helpText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

export default function FormField({
  label,
  helpText,
  error,
  required = false,
  disabled = false,
  children,
}: FormFieldProps) {
  const id = `field-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`space-y-2 ${error ? 'shake' : ''}`}>
      <label
        htmlFor={id}
        className={`block text-sm font-medium text-[--text-primary] ${disabled ? "text-[--text-disabled]" : ""}`}
      >
        {required && <span className="text-[--color-error]">*</span>}
        {label}
      </label>
      <div className="flex flex-col">
        {children}
        {helpText && (
          <p className="text-[--text-muted] text-xs mt-1">
            {helpText}
          </p>
        )}
        {error && (
          <p className="text-[--color-error] text-xs mt-1">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}