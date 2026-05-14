'use client'

import { useEffect, useState } from 'react'
import AppShell from '@/components/AppShell'
import PlanCard from '@/components/PlanCard'
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

  if (!mounted) {
    return (
      <AppShell>
        <div className="text-center text-gray-400 mt-20">加载中…</div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-bold text-gray-900">今日计划</h1>
          <p className="text-xs text-gray-400 mt-0.5">{plan?.date}</p>
        </div>

        {plan && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <PlanCard
                label="新义项"
                count={plan.newSenseIds.length}
                href="/learn"
              />
              <PlanCard
                label="到期复习"
                count={plan.reviewSenseIds.length}
                href="/review"
              />
              <PlanCard
                label="句中识义"
                count={plan.sentenceSenseIds.length}
                href="/sentence"
              />
              <PlanCard
                label="易混微练"
                count={plan.confusionSetIds.length}
                unit="组"
                href="/confusion"
              />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">今日预计用时</span>
                <span className="text-sm font-bold text-gray-800">
                  约 {estimateMinutes(plan)} 分钟
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{plan.rationale}</p>
            </div>

            <a
              href="/learn"
              className="block w-full text-center bg-indigo-600 text-white rounded-xl py-3 font-semibold text-sm hover:bg-indigo-700 transition-colors"
            >
              开始学习
            </a>
          </>
        )}

        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">本地进度</h2>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-gray-200 bg-white p-3 text-center">
              <div className="text-xl font-bold text-gray-900">{knownCount}</div>
              <div className="text-xs text-gray-500 mt-0.5">已掌握</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-3 text-center">
              <div className="text-xl font-bold text-blue-600">{learningCount}</div>
              <div className="text-xs text-gray-500 mt-0.5">学习中</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-3 text-center">
              <div className="text-xl font-bold text-yellow-600">{fuzzyCount}</div>
              <div className="text-xs text-gray-500 mt-0.5">待巩固</div>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            重置本地进度（开发用）
          </button>
        </div>
      </div>
    </AppShell>
  )
}
