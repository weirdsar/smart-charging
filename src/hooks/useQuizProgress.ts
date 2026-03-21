'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'quiz-progress';

interface QuizProgress {
  currentStep: number;
  answers: Record<string, string>;
}

export function useQuizProgress() {
  const [progress, setProgress] = useState<QuizProgress>({ currentStep: 0, answers: {} });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setProgress(JSON.parse(saved) as QuizProgress);
      } catch {
        // ignore
      }
    }
    setIsLoaded(true);
  }, []);

  const saveProgress = useCallback((newProgress: QuizProgress) => {
    setProgress(newProgress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));

    // Save partial to server
    void fetch('/api/quiz/partial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: newProgress.answers, step: newProgress.currentStep }),
    }).catch(() => {});
  }, []);

  const resetProgress = useCallback(() => {
    setProgress({ currentStep: 0, answers: {} });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { progress, saveProgress, resetProgress, isLoaded };
}
