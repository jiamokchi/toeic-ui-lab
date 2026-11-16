import { ArrowRight, CheckCircle2, Clock, Headphones, BookText, Sparkles, Zap } from 'lucide-react';
import { MissionTier, MissionTierId } from '../types/toeic';

interface DailyMissionDeckProps {
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
      aria-label="每日任務選擇與進度"
      className="rounded-2xl border border-[#1e2636] bg-[#111622] p-5 sm:p-6"
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#8b98b1]">
            每日混合實戰 · 閱讀 / 聽力 / 高頻單字
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-white">
            選擇今日訓練強度
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#94a3b8]">
          {todayCompleted ? (
            <span className="flex items-center gap-1.5 font-medium text-[#10b981]">
              <CheckCircle2 className="h-4 w-4" />
              今日任務已完成
            </span>
          ) : (
            <span className="font-mono tabular-nums">
              今日進度 {completedCountToday} / {activeTier.totalQuestions} 題
            </span>
          )}
        </div>
      </div>

      {/* 3-Column Interactive Tier Cards */}
      <div className="mt-5 grid grid-cols-1 gap-3.5 md:grid-cols-3">
        {tiers.map((tier) => {
          const isSelected = tier.id === selectedTierId;
          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => onSelectTier(tier.id)}
              className={`group relative flex min-h-[132px] flex-col justify-between rounded-xl border p-4 text-left transition-all duration-150 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] ${
                isSelected
                  ? 'border-[#3b82f6] bg-[#161d2f] shadow-[0_0_0_1px_rgba(59,130,246,0.25)]'
                  : 'border-[#1e2636] bg-[#0e131d] hover:border-[#2d3952] hover:bg-[#131926]'
              }`}
            >
              <div className="flex items-start justify-between gap-2 w-full">
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
                  +{tier.baseXp} XP
                </span>
              </div>

              <p className="mt-2 text-xs leading-relaxed text-[#8b98b1]">
                {tier.subtitle}
              </p>

              {/* Unboxed Metadata Breakdown */}
              <div className="mt-4 flex items-center justify-between border-t border-[#1e2636]/80 pt-3 text-xs text-[#94a3b8]">
                <span className="font-mono tabular-nums text-[#cbd5e1]">
                  共 {tier.totalQuestions} 題
                </span>
                <span className="truncate text-[11px] text-[#8b98b1]">
                  單字 {tier.breakdown.vocab} · 閱讀 {tier.breakdown.reading} · 聽力 {tier.breakdown.listening}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Mission Action Bar — Ergonomic & High Feedback */}
      <div className="mt-5 flex flex-col gap-4 border-t border-[#1e2636] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#cbd5e1]">
              已選模式：{activeTier.title}（預計 {activeTier.durationMinutes} 分鐘）
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
              連續答對最高 2.0× Combo 加成
            </span>
            <span className="inline-flex items-center gap-1">
              <BookText className="h-3.5 w-3.5 text-[#60a5fa]" />
              支援桌機 1–4 快捷鍵
            </span>
            <span className="inline-flex items-center gap-1">
              <Headphones className="h-3.5 w-3.5 text-[#10b981]" />
              內建語音朗讀
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center shrink-0">
          <button
            type="button"
            onClick={() => onTriggerCelebrationDemo(activeTier)}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#263044] bg-[#171d2c] px-4 py-2.5 text-xs font-medium text-[#cbd5e1] transition-all duration-150 hover:border-[#f59e0b]/60 hover:text-white active:scale-[0.97] whitespace-nowrap"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#f59e0b]" />
            預覽任務完成慶祝動畫
          </button>

          <button
            type="button"
            onClick={() => onStartMission(activeTier)}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#3b82f6] px-6 py-3 text-sm font-semibold text-white transition-all duration-150 hover:bg-[#2563eb] active:scale-[0.97] whitespace-nowrap shadow-[0_8px_24px_-6px_rgba(59,130,246,0.45)]"
          >
            <span>{todayCompleted ? '再練一組實戰題' : '開始實戰任務'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
