import type { UserSenseState } from '@/types/vocab'

type Props = {
  status: UserSenseState['status']
}

const CONFIG: Record<UserSenseState['status'], { label: string; className: string }> = {
  new: { label: '新', className: 'bg-gray-100 text-gray-600' },
  learning: { label: '学习中', className: 'bg-blue-100 text-blue-700' },
  fuzzy: { label: '模糊', className: 'bg-yellow-100 text-yellow-700' },
  known: { label: '认识', className: 'bg-green-100 text-green-700' },
  stable: { label: '稳固', className: 'bg-emerald-100 text-emerald-700' },
  wrong: { label: '错误', className: 'bg-red-100 text-red-600' },
}

export default function StateBadge({ status }: Props) {
  const { label, className } = CONFIG[status]
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  )
}
