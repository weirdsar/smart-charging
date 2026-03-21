'use client';

import QuizProgress from './QuizProgress';

export interface QuizStepperProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
}

export default function QuizStepper({ currentStep, totalSteps, title, subtitle }: QuizStepperProps) {
  return (
    <header className="mb-8 space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-2 text-sm text-text-secondary sm:text-base">{subtitle}</p> : null}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
          Шаг {currentStep} из {totalSteps}
        </p>
      </div>
      <QuizProgress currentStep={currentStep} totalSteps={totalSteps} />
    </header>
  );
}
