import React, { useId } from "react";

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
  const generatedId = useId();
  // Associate the label with the control: reuse the child's own `id` when it
  // has one, otherwise inject a generated id so the label/input stay linked.
  const childId =
    React.isValidElement<{ id?: string }>(children) && children.props.id
      ? children.props.id
      : generatedId;

  const control = React.isValidElement<{ id?: string }>(children)
    ? React.cloneElement(children, { id: childId })
    : children;

  return (
    <div className={`space-y-2 ${error ? 'shake' : ''}`}>
      <label
        htmlFor={childId}
        className={`block text-sm font-medium text-[--text-primary] ${disabled ? "text-[--text-disabled]" : ""}`}
      >
        {required && <span className="text-[--color-error]">*</span>}
        {label}
      </label>
      <div className="flex flex-col">
        {control}
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