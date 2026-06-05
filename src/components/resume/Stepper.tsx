"use client";
import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface StepperProps {
  steps: string[];
  activeStep: number;
}

export default function Stepper({ steps, activeStep }: StepperProps) {
  return (
    <div className="w-full">
      <div className="relative h-12">
        {/* Progress bar background */}
        <div className="absolute inset-y-0 left-0 right-0 h-0.5 bg-[--border]"></div>
        {/* Progress bar fill */}
        <div
          className={`absolute inset-y-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[--color-primary] to-[--color-accent]
          ${activeStep > 0 ? `width-${((activeStep) / (steps.length - 1)) * 100}%` : 'w-0'} transition-all duration-500`}
        ></div>

        {/* Steps */}
        <div className="flex justify-between">
          {steps.map((label, idx) => (
            <div key={label} className="flex flex-col items-center">
              {/* Step circle */}
              <div className={`relative flex h-9 w-9 items-center justify-center
                ${idx < activeStep
                  ? 'bg-[--color-primary]/20 text-[--color-primary]' // completed: filled with indigo 20% bg
                  : idx === activeStep
                    ? 'border-2 border-[--color-primary] bg-[--bg-surface]/50' // active: outline
                    : 'border-2 border-[--border]/50 bg-[--bg-surface]/20' // pending
                }
                rounded-full flex items-center justify-center transition-all duration-300
              `}>
                {idx < activeStep ? (
                  <CheckCircleIcon className="h-4 w-4" />
                ) : idx === activeStep ? (
                  // Active step: we can add a pulsing animation with a ring
                  <div className="animate-pulse h-6 w-6 bg-[--color-primary]/20 rounded-full"></div>
                ) : (
                  // Pending step: just a number or nothing? We'll show the step number.
                  <div className="text-[--text-muted] text-sm">{idx + 1}</div>
                )}
              </div>
              {/* Step label */}
              <div className="mt-2 text-[--text-muted] text-xs text-center" title={label} tabIndex={0}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}