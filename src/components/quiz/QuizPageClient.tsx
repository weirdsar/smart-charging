'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/ToastProvider';
import QuizQuestion from '@/components/quiz/QuizQuestion';
import QuizResult from '@/components/quiz/QuizResult';
import QuizStepper from '@/components/quiz/QuizStepper';
import { useExitIntent } from '@/hooks/useExitIntent';
import { useQuizProgress } from '@/hooks/useQuizProgress';
import { trackFormSubmit, trackQuizComplete, trackQuizStep } from '@/lib/analytics';
import { calculateQuizResult, QUIZ_QUESTIONS } from '@/lib/quizConfig';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

const TOTAL_STEPS = QUIZ_QUESTIONS.length;

export default function QuizPageClient() {
  const { progress, saveProgress, resetProgress, isLoaded } = useQuizProgress();
  const { showPopup, closePopup } = useExitIntent(50);
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const step = progress.currentStep;
  const onQuestions = step < TOTAL_STEPS;
  const currentQuestion = onQuestions ? QUIZ_QUESTIONS[step] : null;

  const result = useMemo(() => calculateQuizResult(progress.answers), [progress.answers]);

  const selectAnswer = (value: string) => {
    if (!currentQuestion) return;
    saveProgress({
      currentStep: step,
      answers: { ...progress.answers, [currentQuestion.id]: value },
    });
  };

  const goNext = () => {
    if (!currentQuestion) return;
    const answer = progress.answers[currentQuestion.id];
    if (!answer) {
      addToast({
        type: 'warning',
        title: 'Выберите вариант',
        message: 'Ответьте на вопрос, чтобы перейти дальше.',
      });
      return;
    }
    const next = step + 1;
    saveProgress({ currentStep: next, answers: progress.answers });
    if (next < TOTAL_STEPS) {
      trackQuizStep(next);
    } else if (next === TOTAL_STEPS) {
      trackQuizComplete();
    }
  };

  const goPrev = () => {
    if (step > 0) {
      saveProgress({ currentStep: step - 1, answers: progress.answers });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      addToast({ type: 'warning', title: 'Имя', message: 'Укажите имя (не менее 2 символов).' });
      return;
    }
    if (phone.trim().length < 10) {
      addToast({ type: 'warning', title: 'Телефон', message: 'Укажите номер телефона.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          phone: phone.trim(),
          email: email.trim(),
          answers: progress.answers,
          sourcePage: typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/quiz',
        }),
      });
      const json: unknown = await res.json().catch(() => ({}));
      const parsed = json as { success?: boolean; error?: string };
      if (!res.ok || !parsed.success) {
        addToast({
          type: 'error',
          title: 'Не удалось отправить',
          message: parsed.error ?? 'Попробуйте позже.',
        });
        return;
      }
      trackFormSubmit('quiz');
      resetProgress();
      setName('');
      setPhone('');
      setEmail('');
      setDone(true);
      addToast({
        type: 'success',
        title: 'Заявка отправлена',
        message: 'Менеджер свяжется с вами и уточнит детали.',
      });
    } catch {
      addToast({ type: 'error', title: 'Ошибка сети', message: 'Проверьте подключение и попробуйте снова.' });
    } finally {
      setSubmitting(false);
    }
  };

  const showExitModal = showPopup && !done && step < TOTAL_STEPS;

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center text-text-secondary">
        Загрузка квиза…
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Card padding="lg" className="border-accent/30 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15">
            <Sparkles className="h-7 w-7 text-accent" aria-hidden />
          </div>
          <h1 className="mt-6 font-heading text-2xl font-bold text-text-primary">Спасибо!</h1>
          <p className="mt-3 text-text-secondary">
            Заявка принята. Если указали email — проверьте почту. Менеджер «Умной зарядки» свяжется с вами в рабочее
            время.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button as="a" href="/catalog" variant="primary">
              В каталог
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetProgress();
                setDone(false);
              }}
            >
              Пройти квиз снова
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:py-16">
        <div className="rounded-2xl border border-accent/25 bg-gradient-to-br from-surface via-surface to-primary p-6 shadow-2xl shadow-black/40 ring-1 ring-accent/15 sm:p-10">
          {onQuestions && currentQuestion ? (
            <>
              <QuizStepper
                currentStep={step + 1}
                totalSteps={TOTAL_STEPS}
                title="Подбор генератора"
                subtitle="Ответьте на вопросы — предложим тип станции и ориентир по бюджету."
              />
              <QuizQuestion question={currentQuestion} value={progress.answers[currentQuestion.id]} onChange={selectAnswer} />
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={goPrev}
                  disabled={step === 0}
                  leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden />}
                >
                  Назад
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={goNext}
                  rightIcon={<ArrowRight className="h-4 w-4" aria-hidden />}
                >
                  {step === TOTAL_STEPS - 1 ? 'Результат' : 'Далее'}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-8">
              <header>
                <h1 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">Ваш подбор</h1>
                <p className="mt-2 text-sm text-text-secondary">
                  Ниже — предварительная рекомендация. Оставьте контакты — отправим уточнения и варианты.
                </p>
              </header>
              <QuizResult result={result} />
              <Card padding="lg" className="border-surface-light">
                <h2 className="font-heading text-lg font-semibold text-text-primary">Контакты</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Имя и телефон обязательны. Email — если хотите получить письмо с материалами.
                </p>
                <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
                  <Input label="Имя" name="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
                  <Input
                    label="Телефон"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    required
                  />
                  <Input
                    label="Email (необязательно)"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                  <Button type="submit" variant="primary" fullWidth isLoading={submitting} disabled={submitting}>
                    Отправить заявку
                  </Button>
                </form>
              </Card>
              <p className="text-center text-sm text-text-secondary">
                <button
                  type="button"
                  className="text-accent underline-offset-2 hover:underline"
                  onClick={() => resetProgress()}
                >
                  Начать квиз заново
                </button>
              </p>
            </div>
          )}
        </div>

        <p className="mt-10 text-center text-sm text-text-secondary">
          <Link href="/" className="text-accent hover:text-accent-hover">
            ← На главную
          </Link>
        </p>
      </div>

      <Modal isOpen={showExitModal} onClose={closePopup} title="Не уходите — почти готово" size="sm">
        <p className="text-sm text-text-secondary">
          Вы ответили на часть вопросов. Завершите квиз — покажем рекомендацию по мощности и бюджету. Или оставьте заявку
          на странице контактов.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={closePopup}>
            Продолжить квиз
          </Button>
          <Button as="a" href="/contacts" variant="primary" onClick={closePopup}>
            Связаться с нами
          </Button>
        </div>
      </Modal>
    </>
  );
}
