import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookCheck,
  RefreshCw,
  Stethoscope,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  DailyProgressDay,
  DiagnosticSubTab,
  QuestionCategory,
  ReviewQueueItem,
  WeaknessItem,
} from '../types/toeic';
import {
  PartnerEvolutionBadge,
  WeaknessIllustration,
} from './PartnerEvolutionBadge';
import { ShibaCoachMascot } from './ShibaCoachMascot';

export interface SkillBarItem {
  label: string;
  score: number;
  target: number;
  part: string;
}

export interface DiagnosticCoachViewProps {
  weeklyData: DailyProgressDay[];
  currentXp: number;
  skillBars: SkillBarItem[];
  weaknessItems: WeaknessItem[];
  reviewQueue: ReviewQueueItem[];
  muted?: boolean;
  onStartTimedDiagnostic: () => void;
  onPracticeWeakness: (category: QuestionCategory, title: string) => void;
  onStartReviewQueue: () => void;
}

export function DiagnosticCoachView({
  weeklyData,
  currentXp,
  skillBars,
  weaknessItems,
  reviewQueue,
  muted = false,
  onStartTimedDiagnostic,
  onPracticeWeakness,
  onStartReviewQueue,
}: DiagnosticCoachViewProps) {
  const [subTab, setSubTab] = useState<DiagnosticSubTab>('coach');
  const topWeakness = weaknessItems[0];

  const totalAnswered7d = weeklyData.reduce((sum, d) => sum + d.answered, 0);
  const activeDays = weeklyData.filter((d) => d.answered > 0);
  const avgAccuracy7d =
    activeDays.length > 0
      ? Math.round(
          activeDays.reduce((sum, d) => sum + d.accuracy, 0) / activeDays.length
        )
      : 0;

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Top 7-Day Real Stats Strip + 3 Sub-Tabs */}
      <section className="rounded-2xl border border-[#1e2636] bg-[#111622] p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-medium text-[#60a5fa]">
              診斷與學習數據分析
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-white">
              診斷與弱項中心
            </h1>
          </div>

          {/* 3 Sub-Tabs: 教練診斷 / 錯題與複習 / 每週複盤 */}
          <div
            role="tablist"
            aria-label="診斷中心子分頁"
            className="grid grid-cols-3 gap-1 rounded-xl border border-[#1e2636] bg-[#0b0e14] p-1"
          >
            {[
              { id: 'coach' as const, label: '教練診斷', icon: Stethoscope },
              { id: 'review' as const, label: '錯題與複習', icon: RefreshCw },
              { id: 'weekly' as const, label: '每週複盤', icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = subTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => setSubTab(tab.id)}
                  className={`inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all active:scale-[0.97] whitespace-nowrap ${
                    active
                      ? 'bg-[#3b82f6] text-white'
                      : 'text-[#8b98b1] hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 7-Day KPI Strip (Strict Real Data, Tabular Numerals) */}
        <div className="mt-5 grid grid-cols-3 divide-x divide-[#1e2636] border-t border-[#1e2636] pt-4">
          <div className="pr-3">
            <div className="text-[11px] text-[#8b98b1]">近 7 天作答數</div>
            <div className="mt-1 font-mono text-xl font-bold text-white tabular-nums">
              {totalAnswered7d} 題
            </div>
          </div>
          <div className="px-3">
            <div className="text-[11px] text-[#8b98b1]">近 7 天平均正確率</div>
            <div className="mt-1 font-mono text-xl font-bold text-[#10b981] tabular-nums">
              {avgAccuracy7d}%
            </div>
          </div>
          <div className="pl-3">
            <div className="text-[11px] text-[#8b98b1]">到期複習題數</div>
            <div className="mt-1 font-mono text-xl font-bold text-[#f59e0b] tabular-nums">
              {reviewQueue.length} 題
            </div>
          </div>
        </div>
      </section>

      {/* Sub-Tab 1: 教練診斷 */}
      {subTab === 'coach' && (
        <div className="space-y-6">
          {/* Timed Diagnostic + Shiba Coach */}
          <section className="rounded-2xl border border-[#1e2636] bg-[#111622] p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-6">
                <p className="text-xs font-medium text-[#60a5fa]">
                  限時實戰檢測
                </p>
                <h2 className="mt-1 font-display text-xl font-bold text-white">
                  限時模擬診斷與弱項處方
                </h2>
                <p className="mt-1.5 text-sm text-[#8b98b1]">
                  透過 8 題高壓限時模擬偵測作答耗時與文法盲點，自動校正你的練習比例。
                </p>
                <button
                  type="button"
                  onClick={onStartTimedDiagnostic}
                  className="mt-4 inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-xl bg-[#3b82f6] px-5 py-3 text-sm font-semibold text-white transition-all duration-150 hover:bg-[#2563eb] active:scale-[0.95] whitespace-nowrap"
                >
                  <Timer className="h-4 w-4" />
                  <span>啟動 8 分鐘限時模擬</span>
                </button>
              </div>

              <div className="lg:col-span-6 lg:border-l lg:border-[#1e2636] lg:pl-6">
                {topWeakness && (
                  <ShibaCoachMascot topWeakness={topWeakness} muted={muted} />
                )}
              </div>
            </div>
          </section>

          {/* Skill Readiness + Partner Evolution */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <section className="rounded-2xl border border-[#1e2636] bg-[#111622] p-5 sm:p-6 lg:col-span-7">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-base font-bold text-white">
                      近 7 日經驗值走勢
                    </h2>
                    <TrendingUp className="h-4 w-4 text-[#60a5fa]" />
                  </div>
                  <p className="mt-0.5 text-xs text-[#8b98b1]">
                    每日穩定累積獨立作答 XP 與完賽獎勵
                  </p>
                </div>
                <div className="w-full shrink-0 sm:w-64">
                  <PartnerEvolutionBadge currentXp={currentXp} compact />
                </div>
              </div>

              <div className="mt-5 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={weeklyData}
                    margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="xpGradientCoach" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2636" vertical={false} />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0e131d',
                        borderColor: '#263044',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: '#e6edf7',
                      }}
                      formatter={(value) => [`${value ?? 0} XP`, '當日獲得']}
                    />
                    <Area
                      type="monotone"
                      dataKey="xp"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#xpGradientCoach)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-2xl border border-[#1e2636] bg-[#111622] p-5 sm:p-6 lg:col-span-5">
              <h2 className="font-display text-base font-bold text-white">
                各項能力達標率
              </h2>
              <p className="mt-0.5 text-xs text-[#8b98b1]">
                各項達標門檻為 80% 以上
              </p>

              <div className="mt-5 space-y-4">
                {skillBars.map((skill) => {
                  const belowTarget = skill.score < 70;
                  return (
                    <div key={skill.label}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#e6edf7]">{skill.label}</span>
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

          {/* Weakness Prescriptions with Vector Illustrations */}
          <section className="rounded-2xl border border-[#1e2636] bg-[#111622] p-5 sm:p-6">
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                AI 弱項處方清單
              </h2>
              <p className="mt-0.5 text-xs text-[#8b98b1]">
                依據近期答題正確率與作答反應時間排序
              </p>
            </div>

            <div className="mt-5 divide-y divide-[#1e2636]">
              {weaknessItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between gap-4 py-4 first:pt-0 last:pb-0 md:flex-row md:items-center"
                >
                  <div className="flex max-w-2xl items-start gap-3.5">
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
      )}

      {/* Sub-Tab 2: 錯題與複習 */}
      {subTab === 'review' && (
        <section className="rounded-2xl border border-[#1e2636] bg-[#111622] p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                錯題間隔複習佇列
              </h2>
              <p className="mt-0.5 text-xs text-[#8b98b1]">
                優先清掉今日到期的錯題，重新獨立答對即可累積復原紀錄
              </p>
            </div>
            <button
              type="button"
              onClick={onStartReviewQueue}
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl bg-[#3b82f6] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#2563eb] active:scale-[0.95] whitespace-nowrap"
            >
              <BookCheck className="h-4 w-4" />
              <span>一鍵複習到期錯題 ({reviewQueue.length} 題)</span>
            </button>
          </div>

          <div className="mt-5 divide-y divide-[#1e2636]">
            {reviewQueue.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-[#60a5fa]">{item.partLabel}</span>
                    <span className="text-[#475569]">·</span>
                    <span className="text-[#f59e0b]">{item.dueLabel}</span>
                    <span className="text-[#475569]">·</span>
                    <span className="font-mono text-[#8b98b1] tabular-nums">
                      曾錯 {item.wrongCount} 次
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white">{item.weaknessTag}</p>
                  <p className="text-xs text-[#8b98b1]">{item.promptPreview}</p>
                </div>

                <button
                  type="button"
                  onClick={onStartReviewQueue}
                  className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-lg border border-[#263044] bg-[#0e131d] px-3.5 py-2 text-xs font-medium text-[#cbd5e1] hover:border-[#3b82f6] hover:text-white active:scale-[0.96] whitespace-nowrap"
                >
                  <span>立即重練</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sub-Tab 3: 每週複盤 */}
      {subTab === 'weekly' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-[#1e2636] bg-[#111622] p-5 sm:p-6">
            <h2 className="font-display text-base font-bold text-white">
              每週經驗值累積曲線
            </h2>
            <p className="mt-0.5 text-xs text-[#8b98b1]">
              過去 7 天每日實戰獲得 XP
            </p>
            <div className="mt-4 h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weeklyXpReview" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2636" vertical={false} />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0e131d',
                      borderColor: '#263044',
                      borderRadius: '10px',
                      fontSize: '12px',
                      color: '#e6edf7',
                    }}
                    formatter={(value) => [`${value ?? 0} XP`, '當日經驗']}
                  />
                  <Area type="monotone" dataKey="xp" stroke="#3b82f6" strokeWidth={2} fill="url(#weeklyXpReview)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-2xl border border-[#1e2636] bg-[#111622] p-5 sm:p-6">
            <h2 className="font-display text-base font-bold text-white">
              每日作答正確率分布
            </h2>
            <p className="mt-0.5 text-xs text-[#8b98b1]">
              目標維持 80% 以上即可達成單項精熟獎勵 (+10 XP)
            </p>
            <div className="mt-4 h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2636" vertical={false} />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0e131d',
                      borderColor: '#263044',
                      borderRadius: '10px',
                      fontSize: '12px',
                      color: '#e6edf7',
                    }}
                    formatter={(value) => [`${value ?? 0}%`, '正確率']}
                  />
                  <Bar dataKey="accuracy" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
