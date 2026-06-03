"use client";
import React from 'react';

interface StepperProps {
  steps: string[];
  activeStep: number;
}

export default function Stepper({ steps, activeStep }: StepperProps) {
  return (
    <nav className="flex items-center" aria-label="Progress">
      {steps.map((label, idx) => (
        <React.Fragment key={label}>
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                idx <= activeStep ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 text-gray-600'
              }`}
            >
              {idx + 1}
            </div>
            <div className="ml-2 text-sm font-medium text-gray-700">
              {label}
            </div>
          </div>
          {idx !== steps.length - 1 && (
            <div className="flex-1 h-0.5 bg-gray-200 mx-4" aria-hidden="true"></div>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
