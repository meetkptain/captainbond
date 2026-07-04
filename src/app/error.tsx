'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-slate-950 text-slate-100 flex items-center justify-center min-h-screen p-8">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold mb-4">Oops</h1>
          <p className="text-slate-400 mb-8">
            Something went wrong. Our team has been notified.
          </p>
          <button
            onClick={() => reset()}
            className="bg-white text-slate-950 font-bold py-3 px-6 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
