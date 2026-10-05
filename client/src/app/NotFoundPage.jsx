import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-16">
      <section className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
        <Link className="mt-4 inline-block text-indigo-600 underline" to="/">Return home</Link>
      </section>
    </main>
  );
}
