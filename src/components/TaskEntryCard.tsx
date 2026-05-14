import Link from 'next/link'

type Props = {
  href: string
  label: string
  description: string
  count: number
  unit?: string
  accent?: string
}

export default function TaskEntryCard({ href, label, description, count, unit = '个', accent = 'bg-indigo-50 text-indigo-700' }: Props) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3.5 hover:border-indigo-300 hover:shadow-sm transition-all active:scale-[0.98]"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{description}</p>
      </div>
      <div className={`ml-3 flex-shrink-0 text-sm font-bold px-3 py-1 rounded-xl ${accent}`}>
        {count} {unit}
      </div>
    </Link>
  )
}
