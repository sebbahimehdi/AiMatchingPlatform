const statusClasses = {
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
}

export default function StatusPill({ status }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${statusClasses[status] ?? 'border-slate-200 bg-slate-50 text-slate-600'}`}>
      {status}
    </span>
  )
}
