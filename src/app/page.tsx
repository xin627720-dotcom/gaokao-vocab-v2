'use client'

import { useEffect, useState } from 'react'
import AppShell from '@/components/AppShell'
import MetricCard from '@/components/MetricCard'
import SectionTitle from '@/components/SectionTitle'
import TaskEntryCard from '@/components/TaskEntryCard'
import { initUserSenseStates } from '@/lib/state'
import { loadAttemptLogs, loadUserSenseStates, resetLocalProgress } from '@/lib/storage'
import { buildDailyPlan, estimateMinutes } from '@/lib/planner'
import type { DailyPlan, UserSenseState } from '@/types/vocab'

export default function HomePage() {
  const [plan, setPlan] = useState<DailyPlan | null>(null)
  const [states, setStates] = useState<UserSenseState[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const s = initUserSenseStates()
    setStates(s)
    const logs = loadAttemptLogs()
    const p = buildDailyPlan(s, logs)
    setPlan(p)
    setMounted(true)
  }, [])

  function handleReset() {
    resetLocalProgress()
    const s = initUserSenseStates()
    setStates(s)
    const logs = loadAttemptLogs()
    const p = buildDailyPlan(s, logs)
    setPlan(p)
  }

  const knownCount = states.filter((s) => s.status === 'stable' || s.status === 'known').length
  const learningCount = states.filter((s) => s.status === 'learning').length
  const fuzzyCount = states.filter((s) => s.status === 'fuzzy' || s.status === 'wrong').length
  const totalSenses = states.length

  if (!mounted) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-40">
          <span className="text-sm text-gray-400">加载中…</span>
        </div>
      </AppShell>
    )
  }

  const chips = [
    plan && plan.reviewSenseIds.length > 0 && '到期复习',
    plan && plan.newSenseIds.some(() => true) && '熟词生义',
    plan && plan.confusionSetIds.length > 0 && '易混辨析',
  ].filter(Boolean) as string[]

  return (
    <AppShell>
      <div className="space-y-7">

        {/* Hero */}
        <div className="rounded-2xl bg-indigo-600 px-5 py-5 text-white">
          <p className="text-xs font-medium text-indigo-200 mb-1">{plan?.date}</p>
          <h1 className="text-xl font-bold mb-3">今日训练</h1>
          <div className="flex items-end gap-1 mb-4">
            <span className="text-3xl font-bold">{plan ? estimateMinutes(plan) : 0}</span>
            <span className="text-indigo-300 mb-0.5 text-sm">分钟</span>
          </div>
          {chips.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-4">
              {chips.map((chip) => (
                <span key={chip} className="text-[11px] bg-indigo-500 text-indigo-100 px-2.5 py-1 rounded-full font-medium">
                  {chip}
                </span>
              ))}
            </div>
          )}
          {plan?.rationale && (
            <p className="text-xs text-indigo-200 leading-relaxed mb-4">{plan.rationale}</p>
          )}
          <a
            href="/learn"
            className="block w-full text-center bg-white text-indigo-700 rounded-xl py-2.5 font-semibold text-sm hover:bg-indigo-50 transition-colors"
          >
            开始训练
          </a>
        </div>

        {/* Today tasks */}
        {plan && (
          <div className="space-y-2.5">
            <SectionTitle>今日任务</SectionTitle>
            <TaskEntryCard
              href="/learn"
              label="新词学习"
              description="首次认识义项，语境四选一"
              count={plan.newSenseIds.length}
              accent="bg-blue-50 text-blue-700"
            />
            <TaskEntryCard
              href="/sentence"
              label="句中识义"
              description="在真实句子里识别当前义项"
              count={plan.sentenceSenseIds.length}
              accent="bg-violet-50 text-violet-700"
            />
            <TaskEntryCard
              href="/review"
              label="状态校准"
              description="认识 / 模糊 / 不认识，自我评估"
              count={plan.reviewSenseIds.length}
              accent="bg-amber-50 text-amber-700"
            />
            <TaskEntryCard
              href="/confusion"
              label="易混辨析"
              description="高频易混义项逐组对比"
              count={plan.confusionSetIds.length}
              unit="组"
              accent="bg-rose-50 text-rose-700"
            />
          </div>
        )}

        {/* Progress */}
        <div className="space-y-2.5">
          <SectionTitle>本地进度</SectionTitle>
          <div className="grid grid-cols-3 gap-2">
            <MetricCard label="已掌握" value={knownCount} color="green" />
            <MetricCard label="学习中" value={learningCount} color="blue" />
            <MetricCard label="待巩固" value={fuzzyCount} color="yellow" />
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>总覆盖</span>
              <span>{totalSenses > 0 ? Math.round((knownCount / totalSenses) * 100) : 0}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${totalSenses > 0 ? (knownCount / totalSenses) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-gray-300 hover:text-red-400 transition-colors"
          >
            重置本地进度
          </button>
        </div>
      </div>
    </AppShell>
  )
}
