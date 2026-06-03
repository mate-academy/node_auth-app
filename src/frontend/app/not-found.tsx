import Link from 'next/link'
 
export default function NotFound() {
  return (
    <section className="mx-auto w-full max-w-3xl rounded-2xl border border-rose-700/35 bg-surface-panel p-6 shadow-[inset_0_0_20px_rgba(244,63,94,0.14)] sm:p-8">
      <header className="mb-8 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-rose-300/85">
          404
        </p>
        <h2 className="text-3xl font-bold text-rose-50">Not Found Page</h2>
      </header>

      <div className='text-center'>
        <Link href="/" className="text-xl text-center font-bold  text-rose-300/85">Return Home</Link>
      </div>

    </section>
  )
}