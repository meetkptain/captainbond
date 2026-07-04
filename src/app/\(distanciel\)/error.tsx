'use client';

export default function DistancielError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
        <p className="text-slate-400 mb-8">
          We could not load this page. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="bg-white text-slate-950 font-bold py-3 px-6 rounded-xl hover:bg-slate-200 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
