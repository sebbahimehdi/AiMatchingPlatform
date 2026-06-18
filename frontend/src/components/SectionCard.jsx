export default function SectionCard({ actions, children, eyebrow, title, subtitle }) {
  return (
    <section className="app-card rounded-2xl p-5 sm:p-6">
      {(eyebrow || title || actions) && (
        <div className="mb-5 flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">{eyebrow}</p> : null}
            {title ? <h2 className="mt-2 text-2xl font-bold text-slate-950">{title}</h2> : null}
            {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      )}
      {children}
    </section>
  )
}
