import { ArrowRight, BookText, CheckCircle2, Clock, Headphones, Sparkles, Zap } from 'lucide-react';
import { MissionTier, MissionTierId } from '../types/toeic';

export interface DailyMissionDeckProps {
  tiers: MissionTier[];
  selectedTierId: MissionTierId;
  onSelectTier: (id: MissionTierId) => void;
  completedCountToday: number;
  todayCompleted: boolean;
  onStartMission: (tier: MissionTier) => void;
  onTriggerCelebrationDemo: (tier: MissionTier) => void;
}

export function DailyMissionDeck({
  tiers,
  selectedTierId,
  onSelectTier,
  completedCountToday,
  todayCompleted,
  onStartMission,
  onTriggerCelebrationDemo,
}: DailyMissionDeckProps) {
  const activeTier = tiers.find((t) => t.id === selectedTierId) ?? tiers[1];
  const progressRatio = Math.min(
    100,
    Math.round((completedCountToday / activeTier.totalQuestions) * 100)
  );

  return (
    <section
      aria-label="每日任務強度與課表"
      className="rounded-2xl border border-[#1e2636] bg-[#111622] p-5 sm:p-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#8b98b1]">
            每日混合課表 · 閱讀 / 聽力 / 單字 · 完賽全勤獎勵 +25 XP（每日限 1 次）
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-white">
            選擇今日任務強度
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#94a3b8]">
          {todayCompleted ? (
            <span className="flex items-center gap-1.5 font-medium text-[#10b981]">
              <CheckCircle2 className="h-4 w-4" />
              今日課表全勤已領取 (+25 XP)
            </span>
          ) : (
            <span className="font-mono tabular-nums">
              今日進度 {completedCountToday} / {activeTier.totalQuestions} 題
            </span>
          )}
        </div>
      </div>

      {/* 3-Column Intensity Cards */}
      <div className="mt-5 grid grid-cols-1 gap-3.5 md:grid-cols-3">
        {tiers.map((tier) => {
          const isSelected = tier.id === selectedTierId;
          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => onSelectTier(tier.id)}
              className={`group relative flex min-h-[132px] flex-col justify-between rounded-xl border p-4 text-left transition-all duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] ${
                isSelected
                  ? 'border-[#3b82f6] bg-[#161d2f] shadow-[0_0_0_1px_rgba(59,130,246,0.25)]'
                  : 'border-[#1e2636] bg-[#0e131d] hover:border-[#2d3952] hover:bg-[#131926]'
              }`}
            >
              <div className="flex w-full items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Clock
                    className={`h-4 w-4 ${
                      isSelected ? 'text-[#60a5fa]' : 'text-[#64748b]'
                    }`}
                  />
                  <span className="font-display text-base font-bold text-white whitespace-nowrap">
                    {tier.title}
                  </span>
                </div>
                <span
                  className={`font-mono text-xs font-semibold tabular-nums whitespace-nowrap ${
                    isSelected ? 'text-[#f59e0b]' : 'text-[#8b98b1]'
                  }`}
                >
                  最高 +{tier.maxXp} XP
                </span>
              </div>

              <p className="mt-2 text-xs leading-relaxed text-[#8b98b1]">
                {tier.subtitle}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-[#1e2636]/80 pt-3 text-xs text-[#94a3b8]">
                <span className="font-mono text-[#cbd5e1] tabular-nums">
                  上限 {tier.totalQuestions} 題
                </span>
                <span className="truncate text-[11px] text-[#8b98b1]">
                  單字 {tier.breakdown.vocab} · 閱讀 {tier.breakdown.reading} · 聽力 {tier.breakdown.listening}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Action Bar */}
      <div className="mt-5 flex flex-col gap-4 border-t border-[#1e2636] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#cbd5e1]">
              已選模式：{activeTier.title}（上限 {activeTier.totalQuestions} 題 · 最高 +{activeTier.maxXp} XP）
            </span>
            <span className="font-mono text-[#60a5fa] tabular-nums">
              {todayCompleted ? '100%' : `${progressRatio}%`}
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#1b2233]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                todayCompleted ? 'bg-[#10b981]' : 'bg-[#3b82f6]'
              }`}
              style={{ width: `${todayCompleted ? 100 : progressRatio}%` }}
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8b98b1]">
            <span className="inline-flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-[#f59e0b]" />
              獨立答對 +5 · 提示 +2 · 努力 +1 XP
            </span>
            <span className="inline-flex items-center gap-1">
              <BookText className="h-3.5 w-3.5 text-[#60a5fa]" />
              1–4 選答 / Enter 下一題 / Space 播音
            </span>
            <span className="inline-flex items-center gap-1">
              <Headphones className="h-3.5 w-3.5 text-[#10b981]" />
              0.9x / 1.0x / 1.15x 語速
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => onTriggerCelebrationDemo(activeTier)}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#263044] bg-[#171d2c] px-4 py-2.5 text-xs font-medium text-[#cbd5e1] transition-all duration-150 hover:border-[#f59e0b]/60 hover:text-white active:scale-[0.95] whitespace-nowrap"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#f59e0b]" />
            預覽開箱慶祝動畫
          </button>

          <button
            type="button"
            onClick={() => onStartMission(activeTier)}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#3b82f6] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-6px_rgba(59,130,246,0.45)] transition-all duration-150 hover:bg-[#2563eb] active:scale-[0.95] whitespace-nowrap"
          >
            <span>{todayCompleted ? '進入自由練習 / 重刷' : '開始實戰課表'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
