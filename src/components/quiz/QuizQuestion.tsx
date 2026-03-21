'use client';

import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { QuizQuestion as QuizQuestionModel } from '@/lib/quizConfig';

export interface QuizQuestionProps {
  question: QuizQuestionModel;
  value: string | undefined;
  onChange: (value: string) => void;
}

export default function QuizQuestion({ question, value, onChange }: QuizQuestionProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="sr-only">{question.question}</legend>
      <p className="text-lg font-medium text-text-primary">{question.question}</p>
      <div className="grid gap-2 sm:grid-cols-1">
        {question.options.map((opt) => {
          const selected = value === opt.value;
          return (
            <Card
              key={opt.value}
              padding="sm"
              hover
              onClick={() => onChange(opt.value)}
              className={cn(
                'cursor-pointer transition-colors',
                selected ? 'border-accent ring-1 ring-accent/40' : 'border-surface-light'
              )}
            >
              <span className="text-sm text-text-primary">{opt.label}</span>
            </Card>
          );
        })}
      </div>
    </fieldset>
  );
}
