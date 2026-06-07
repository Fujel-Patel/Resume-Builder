import React from "react";
import clsx from "clsx";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function Textarea({
  className,
  leftIcon,
  rightIcon,
  size = "md",
  ...props
}: TextareaProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Adjust height to fit content (autosize)
  const adjustHeight = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  React.useEffect(() => {
    adjustHeight();
  }, [props.value]);
  const sizeClasses = {
    sm: "min-h-[80px] px-3 py-2.5 text-sm",
    md: "min-h-[100px] px-3.5 py-3 text-base",
    lg: "min-h-[120px] px-4 py-3.5 text-lg",
  }[size];

  return (
    <div className="relative">
      {leftIcon && (
        <div className="absolute left-3 top-3 flex h-5 w-5 items-center justify-center text-[--text-muted]">
          {leftIcon}
        </div>
      )}
      {rightIcon && (
        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center text-[--text-muted]">
          {rightIcon}
        </div>
      )}
      <textarea ref={textareaRef} onInput={adjustHeight}
        {...props}
        className={clsx(
          "w-full rounded-xl bg-[--bg-elevated] border border-[--border] text-[--text-primary]",
          sizeClasses,
          "focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus:border-transparent focus:shadow-[0_0_8px_var(--color-primary)] resize-none transition-all duration-200 hover:bg-[--bg-elevated]/90",
          props.disabled && "bg-[--bg-disabled]/50 text-[--text-disabled]",
          className
        )}
      />
    </div>
  );
}