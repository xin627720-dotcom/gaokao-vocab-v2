import SpeakerButton from '@/components/SpeakerButton'

type Props = {
  text: string
  phonetic?: string
  pos?: string
}

export default function WordHeader({ text, phonetic, pos }: Props) {
  return (
    <div className="flex items-center gap-2.5">
      <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{text}</h2>
      <div className="flex flex-col gap-0.5">
        {phonetic && (
          <span className="text-xs text-gray-400">{phonetic}</span>
        )}
        {pos && (
          <span className="text-[11px] text-indigo-600 font-medium">{pos}</span>
        )}
      </div>
      <SpeakerButton text={text} className="ml-1" />
    </div>
  )
}
