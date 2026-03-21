'use client';

import { YANDEX_METRIKA_COUNTER_ID } from '@/lib/constants';

declare global {
  interface Window {
    ym?: (id: number, method: string, ...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;

  const ymIdNum = parseInt(YANDEX_METRIKA_COUNTER_ID, 10);
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!Number.isNaN(ymIdNum) && window.ym) {
    window.ym(ymIdNum, 'reachGoal', eventName, params);
  }

  if (gaId && window.gtag) {
    window.gtag('event', eventName, params);
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', eventName, params);
  }
}

export function trackFormSubmit(formType: 'callback' | 'commercial_offer' | 'contact' | 'leasing' | 'quiz'): void {
  trackEvent('lead_form_submit', { form_type: formType });
}

export function trackQuizStep(step: number): void {
  trackEvent('quiz_step', { step });
}

export function trackQuizComplete(): void {
  trackEvent('quiz_complete');
}

export function trackPageView(url: string): void {
  trackEvent('page_view', { page_path: url });
}
