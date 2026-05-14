type Props = {
  children: React.ReactNode
  className?: string
}

export default function SectionTitle({ children, className = '' }: Props) {
  return (
    <h2 className={`text-xs font-semibold text-gray-400 uppercase tracking-widest ${className}`}>
      {children}
    </h2>
  )
}
