export default function PageCard({ title, subtitle, children, footer }) {
  return (
    <section className="mx-auto max-w-xl">
      <div className="glass rounded-2xl p-6">
        <div className="mb-4 space-y-1">
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {subtitle ? <p className="text-sm text-slate-600">{subtitle}</p> : null}
        </div>
        <div className="space-y-4">{children}</div>
        {footer ? <div className="mt-4 text-sm text-slate-600">{footer}</div> : null}
      </div>
    </section>
  );
}
