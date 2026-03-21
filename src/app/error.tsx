'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 text-center">
      <h1 className="font-heading text-2xl text-text-primary">Произошла ошибка</h1>
      <p className="mt-4 text-sm text-text-secondary">{error.message}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-md bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover"
      >
        Повторить
      </button>
    </div>
  );
}
