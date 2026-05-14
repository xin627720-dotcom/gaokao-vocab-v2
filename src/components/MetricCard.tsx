type Props = {
  label: string
  value: number | string
  unit?: string
  color?: 'default' | 'blue' | 'yellow' | 'green' | 'red'
}

const COLOR: Record<NonNullable<Props['color']>, string> = {
  default: 'text-gray-900',
  blue:    'text-blue-600',
  yellow:  'text-amber-600',
  green:   'text-emerald-600',
  red:     'text-red-600',
}

export default function MetricCard({ label, value, unit, color = 'default' }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-center">
      <div className={`text-2xl font-bold leading-none ${COLOR[color]}`}>
        {value}
        {unit && <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>}
      </div>
      <div className="text-[11px] text-gray-400 mt-1.5 font-medium">{label}</div>
    </div>
  )
}
