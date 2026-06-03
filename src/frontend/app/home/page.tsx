'use client';

export default function HomePage() {
  return (
    <section className="w-full rounded-2xl border border-rose-700/35 bg-surface-panel p-6 text-center shadow-[inset_0_0_20px_rgba(244,63,94,0.14)] sm:p-8">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-rose-300/85">
        Welcome
      </p>
      <h2 className="text-3xl font-bold text-rose-50">Home Page</h2>
      <p className="mt-3 text-sm text-rose-100/75">
        It's a homework for topic: Node_Auth-APP.
      </p>
    </section>
  )
}