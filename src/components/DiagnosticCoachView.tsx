import { AlertTriangle, ArrowRight, Timer, TrendingUp } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { SKILL_RADAR_BARS, WEAKNESS_ITEMS } from '../data/toeicData';
import { DailyProgressDay, QuestionCategory } from '../types/toeic';

import {
  PartnerEvolutionBadge,
  WeaknessIllustration,
} from './PartnerEvolutionBadge';
import { ShibaCoachMascot } from './ShibaCoachMascot';

interface DiagnosticCoachViewProps {
  weeklyData: DailyProgressDay[];
  currentXp: number;
  muted?: boolean;
  onStartTimedDiagnostic: () => void;
  onPracticeWeakness: (category: QuestionCategory, title: string) => void;
}

export function DiagnosticCoachView({
  weeklyData,
  currentXp,
  muted = false,
  onStartTimedDiagnostic,
  onPracticeWeakness,
}: DiagnosticCoachViewProps) {
  const topWeakness = WEAKNESS_ITEMS[0];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Top Action Strip: Timed Diagnostic Launcher + Interactive Shiba Coach */}
      <section className="rounded-2xl border border-[#1e2636] bg-[#111622] p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <p className="text-xs font-medium text-[#60a5fa]">
              AI 教練診斷與能力趨勢
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-white">
              限時模擬診斷與弱項處方
            </h1>
            <p className="mt-1.5 text-sm text-[#8b98b1]">
              透過 8 題高壓限時模擬偵測作答耗時與文法盲點，自動校正你的 800 分訓練比例。
            </p>
            <button
              type="button"
              onClick={onStartTimedDiagnostic}
              className="mt-4 inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-xl bg-[#3b82f6] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#2563eb] active:scale-[0.98] whitespace-nowrap"
            >
              <Timer className="h-4 w-4" />
              <span>啟動 8 分鐘限時模擬</span>
            </button>
          </div>

          <div className="lg:col-span-6 lg:border-l lg:border-[#1e2636] lg:pl-6">
            <ShibaCoachMascot topWeakness={topWeakness} muted={muted} />
          </div>
        </div>
      </section>

      {/* Analytics Split: Recharts 7-Day Trend + Skill Mastery Bars */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 7 cols: Recharts AreaChart + Partner Evolution Badge */}
        <section className="rounded-2xl border border-[#1e2636] bg-[#111622] p-5 sm:p-6 lg:col-span-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base font-bold text-white">
                  近 7 日經驗值與正確率走勢
                </h2>
                <TrendingUp className="h-4 w-4 text-[#60a5fa]" />
              </div>
              <p className="mt-0.5 text-xs text-[#8b98b1]">
                每日穩定累積 XP，週末保持至少 6 題快充不中斷
              </p>
            </div>
            <div className="w-full sm:w-64 shrink-0">
              <PartnerEvolutionBadge currentXp={currentXp} compact />
            </div>
          </div>

          <div className="mt-5 h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={weeklyData}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e2636"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0e131d',
                    borderColor: '#263044',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#e6edf7',
                  }}
                  formatter={(value, name) => [
                    name === 'xp' ? `${value ?? 0} XP` : `${value ?? 0}%`,
                    name === 'xp' ? '獲得經驗' : '正確率',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="xp"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#xpGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Right 5 cols: TOEIC Part Readiness */}
        <section className="rounded-2xl border border-[#1e2636] bg-[#111622] p-5 sm:p-6 lg:col-span-5">
          <h2 className="font-display text-base font-bold text-white">
            TOEIC 800 分各項能力達標率
          </h2>
          <p className="mt-0.5 text-xs text-[#8b98b1]">
            目標基準線：各項均達 80% 以上即可穩定突破 800 分
          </p>

          <div className="mt-5 space-y-4">
            {SKILL_RADAR_BARS.map((skill) => {
              const belowTarget = skill.score < 70;
              return (
                <div key={skill.label}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#e6edf7]">
                      {skill.label}
                    </span>
                    <span
                      className={`font-mono font-semibold tabular-nums ${
                        belowTarget ? 'text-[#f59e0b]' : 'text-[#60a5fa]'
                      }`}
                    >
                      {skill.score}% / {skill.target}%
                    </span>
                  </div>
                  <div className="relative mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#1b2233]">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        belowTarget ? 'bg-[#f59e0b]' : 'bg-[#3b82f6]'
                      }`}
                      style={{ width: `${skill.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Weakness Prescriptions */}
      <section className="rounded-2xl border border-[#1e2636] bg-[#111622] p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-white">
              近期弱項診斷與補強建議
            </h2>
            <p className="mt-0.5 text-xs text-[#8b98b1]">
              根據近 50 題作答正確率與反應秒數排序
            </p>
          </div>
        </div>

        <div className="mt-5 divide-y divide-[#1e2636]">
          {WEAKNESS_ITEMS.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between gap-4 py-4 first:pt-0 last:pb-0 md:flex-row md:items-center"
            >
              <div className="flex items-start gap-3.5 max-w-2xl">
                <WeaknessIllustration id={item.id} />
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 font-medium text-[#f59e0b]">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {item.part}
                    </span>
                    <span className="text-[#475569]">·</span>
                    <span className="font-mono text-[#cbd5e1] tabular-nums">
                      正確率 {item.accuracy}%
                    </span>
                    <span className="text-[#475569]">·</span>
                    <span className="font-mono text-[#8b98b1] tabular-nums">
                      平均耗時 {item.avgSeconds}s（目標 {item.targetSeconds}s）
                    </span>
                  </div>
                  <h3 className="font-display text-base font-semibold text-white">
                    {item.area}
                  </h3>
                  <p className="text-xs leading-relaxed text-[#94a3b8]">
                    {item.insight}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onPracticeWeakness(item.categoryFilter, `弱項特訓：${item.area}`)
                }
                className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl border border-[#263044] bg-[#171d2c] px-4 py-2.5 text-xs font-semibold text-[#e6edf7] transition-all duration-150 hover:border-[#3b82f6] hover:text-white active:scale-[0.95] whitespace-nowrap"
              >
                <span>{item.recommendedAction}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
