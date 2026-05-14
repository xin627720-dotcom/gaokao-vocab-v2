import type { UserSenseState } from '@/types/vocab'

type Props = {
  status: UserSenseState['status']
  size?: 'sm' | 'md'
}

const CONFIG: Record<UserSenseState['status'], { label: string; className: string; dot: string }> = {
  new:      { label: '未学',  dot: 'bg-gray-400',    className: 'bg-gray-100 text-gray-600 border-gray-200' },
  learning: { label: '学习中', dot: 'bg-blue-500',   className: 'bg-blue-50 text-blue-700 border-blue-200' },
  fuzzy:    { label: '模糊',  dot: 'bg-yellow-500',  className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  known:    { label: '认识',  dot: 'bg-green-500',   className: 'bg-green-50 text-green-700 border-green-200' },
  stable:   { label: '稳固',  dot: 'bg-emerald-500', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  wrong:    { label: '需复习', dot: 'bg-red-500',    className: 'bg-red-50 text-red-600 border-red-200' },
}

export default function StateBadge({ status, size = 'sm' }: Props) {
  const { label, className, dot } = CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 border font-medium rounded-full ${className} ${size === 'md' ? 'text-xs px-2.5 py-1' : 'text-[11px] px-2 py-0.5'}`}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      {label}
    </span>
  )
}
