type Props = {
  label: string
  count: number
  unit?: string
  description?: string
  href?: string
}

export default function PlanCard({ label, count, unit = '个', description, href }: Props) {
  const inner = (
    <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col gap-1">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-2xl font-bold text-gray-900">
        {count}
        <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
      </span>
      {description && (
        <span className="text-xs text-gray-400">{description}</span>
      )}
    </div>
  )

  if (href) {
    return (
      <a href={href} className="block hover:ring-2 hover:ring-indigo-300 rounded-xl transition-shadow">
        {inner}
      </a>
    )
  }
  return inner
}
