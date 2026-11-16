import { Check, Crown, Flame, Shield, Trophy, Zap } from 'lucide-react';
import { useState } from 'react';
import { DailyProgressDay, RankTier } from '../types/toeic';

const STREAK_ACHIEVEMENTS = [
  { id: '3d', days: 3, label: '3 天火花', icon: Flame, reward: '連續 3 日養成起動節奏' },
  { id: '7d', days: 7, label: '7 天閃電', icon: Zap, reward: '解鎖連勝凍結護盾 ×1' },
  { id: '14d', days: 14, label: '14 天火炬', icon: Trophy, reward: '常駐雙週專注勳章' },
  { id: '30d', days: 30, label: '30 天殿堂', icon: Crown, reward: '解鎖衝刺金框成就' },
];

interface RankProgressTrackProps {
  currentXp: number;
  estimatedScore: number;
  streakDays: number;
  freezeShields: number;
  rankTiers: RankTier[];
  weeklyData: DailyProgressDay[];
  todayCompleted: boolean;
  onOpenBlueprint: () => void;
}

export function RankProgressTrack({
  currentXp,
  estimatedScore,
  streakDays,
  freezeShields,
  rankTiers,
  weeklyData,
  todayCompleted,
  onOpenBlueprint,
}: RankProgressTrackProps) {
  const maxXp = rankTiers[rankTiers.length - 1].minXp; // 5000 XP -> TOEIC 800
  const currentRankIndex = rankTiers.reduce((acc, tier, idx) => {
    return currentXp >= tier.minXp ? idx : acc;
  }, 0);

  const currentRank = rankTiers[currentRankIndex];
  const nextRank = rankTiers[currentRankIndex + 1] ?? null;

  const [selectedTierId, setSelectedTierId] = useState<string>(currentRank.id);
  const [selectedBadgeId, setSelectedBadgeId] = useState<string>('14d');
  const inspectedTier =
    rankTiers.find((t) => t.id === selectedTierId) ?? currentRank;
  const inspectedBadge =
    STREAK_ACHIEVEMENTS.find((b) => b.id === selectedBadgeId) ??
    STREAK_ACHIEVEMENTS[0];

  const progressPercent = Math.min(100, Math.round((currentXp / maxXp) * 100));
  const xpToNext = nextRank ? Math.max(0, nextRank.minXp - currentXp) : 0;

  return (
    <section
      aria-label="TOEIC 800 等級與連勝進度"
      className="rounded-2xl border border-[#1e2636] bg-[#111622] p-5 sm:p-6"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
        {/* Left 8 cols: TOEIC 800 Ladder XP Progress */}
        <div className="flex flex-col justify-between lg:col-span-8 lg:pr-6 lg:border-r lg:border-[#1e2636]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-[#8b98b1]">
                目前目標階段 · {currentRank.targetScore} 分階級 · {currentRank.title}
              </p>
              <div className="mt-1.5 flex items-baseline gap-3">
                <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl tabular-nums">
                  {currentXp.toLocaleString()}
                  <span className="ml-1.5 text-sm font-medium text-[#8b98b1]">
                    / {maxXp.toLocaleString()} XP
                  </span>
                </h1>
                <span className="text-xs font-mono text-[#60a5fa] tabular-nums">
                  預估實力 {estimatedScore} 分
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenBlueprint}
              className="shrink-0 whitespace-nowrap rounded-lg border border-[#263044] bg-[#171d2c] px-3 py-1.5 text-xs font-medium text-[#cbd5e1] transition-colors hover:border-[#3b82f6]/60 hover:text-white active:scale-[0.98]"
            >
              查看遊戲機制藍圖
            </button>
          </div>

          {/* Interactive Tier Track (500 -> 650 -> 750 -> 800) */}
          <div className="mt-6">
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[#1b2233]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#2563eb] via-[#3b82f6] to-[#f59e0b] transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Interactive Milestone Nodes */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {rankTiers.map((tier, idx) => {
                const isUnlocked = currentXp >= tier.minXp;
                const isSelected = inspectedTier.id === tier.id;
                const isGoal = tier.targetScore === 800;

                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedTierId(tier.id)}
                    className={`group flex min-h-[44px] flex-col items-start rounded-xl border px-2.5 py-2 text-left transition-all duration-150 active:scale-[0.98] sm:px-3 ${
                      isSelected
                        ? 'border-[#3b82f6] bg-[#171d2c]'
                        : 'border-[#1e2636] bg-[#0e131d] hover:border-[#2c3850]'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between gap-1">
                      <span
                        className={`font-mono text-xs font-semibold tabular-nums ${
                          isGoal && isUnlocked
                            ? 'text-[#f59e0b]'
                            : isUnlocked
                              ? 'text-[#60a5fa]'
                              : 'text-[#64748b]'
                        }`}
                      >
                        {tier.targetScore}
                      </span>
                      {isUnlocked ? (
                        <Check className="h-3.5 w-3.5 text-[#10b981]" />
                      ) : isGoal ? (
                        <Trophy className="h-3.5 w-3.5 text-[#f59e0b]/70" />
                      ) : (
                        <span className="font-mono text-[10px] text-[#64748b] tabular-nums">
                          {idx === 0 ? '0' : `${tier.minXp}`}
                        </span>
                      )}
                    </div>
                    <span
                      className={`mt-0.5 truncate text-xs font-medium w-full ${
                        isUnlocked ? 'text-[#e6edf7]' : 'text-[#8b98b1]'
                      }`}
                    >
                      {tier.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Inspected Milestone Detail Strip (Unboxed clean line) */}
            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#8b98b1]">
              <p>
                <span className="font-semibold text-[#e6edf7]">
                  TOEIC {inspectedTier.targetScore} · {inspectedTier.title}：
                </span>
                {inspectedTier.perk}
              </p>
              <span className="font-mono text-[#60a5fa] tabular-nums">
                {nextRank
                  ? `距離 ${nextRank.targetScore} 門檻還差 ${xpToNext.toLocaleString()} XP`
                  : '已解鎖全部 800+ 等級稱號'}
              </span>
            </div>
          </div>
        </div>

        {/* Right 4 cols: Consecutive Days Streak & 7-Day Check-in */}
        <div className="flex flex-col justify-between lg:col-span-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-[#8b98b1]">
                連續專注連勝紀錄
              </p>
              <div className="mt-1.5 flex items-center gap-2.5">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                    todayCompleted
                      ? 'border-[#f59e0b]/40 bg-[#f59e0b]/15 text-[#f59e0b]'
                      : 'border-[#263044] bg-[#171d2c] text-[#f59e0b]'
                  }`}
                >
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display text-2xl font-bold text-white tabular-nums">
                    {streakDays} 天
                  </div>
                  <p className="text-xs text-[#8b98b1]">
                    {todayCompleted ? '今日已簽到延長連勝' : '完成今日任務即可 +1 天'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
              <Shield className="h-3.5 w-3.5 text-[#3b82f6]" />
              <span className="tabular-nums">凍結保護 ×{freezeShields}</span>
            </div>
          </div>

          {/* 7-Day Minimalist Streak Strip */}
          <div className="mt-5">
            <div className="grid grid-cols-7 gap-1.5">
              {weeklyData.map((d) => {
                const isToday = d.day === '今日';
                return (
                  <div
                    key={d.day}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div
                      className={`flex h-9 w-full items-center justify-center rounded-lg border font-mono text-xs tabular-nums transition-colors ${
                        d.completed
                          ? 'border-[#f59e0b]/40 bg-[#f59e0b]/15 text-[#fbbf24]'
                          : isToday
                            ? 'border-dashed border-[#3b82f6] bg-[#171d2c] text-[#60a5fa]'
                            : 'border-[#1e2636] bg-[#0e131d] text-[#475569]'
                      }`}
                    >
                      {d.completed ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <span>{isToday ? '今' : '·'}</span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] ${
                        isToday ? 'font-semibold text-[#e6edf7]' : 'text-[#64748b]'
                      }`}
                    >
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Dynamic Unlockable Streak Achievement Badges */}
            <div className="mt-4 border-t border-[#1e2636] pt-3.5">
              <div className="flex items-center justify-between text-[11px] text-[#8b98b1]">
                <span>連勝成就徽章</span>
                <span className="font-mono text-[#cbd5e1] tabular-nums">
                  已解鎖 {STREAK_ACHIEVEMENTS.filter((b) => streakDays >= b.days).length} / {STREAK_ACHIEVEMENTS.length}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {STREAK_ACHIEVEMENTS.map((badge) => {
                  const Icon = badge.icon;
                  const unlocked = streakDays >= badge.days;
                  const active = inspectedBadge.id === badge.id;
                  return (
                    <button
                      key={badge.id}
                      type="button"
                      onClick={() => setSelectedBadgeId(badge.id)}
                      className={`flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-lg border px-1.5 py-1.5 transition-all active:scale-95 ${
                        active
                          ? 'border-[#3b82f6] bg-[#171d2c]'
                          : unlocked
                            ? 'border-[#f59e0b]/35 bg-[#f59e0b]/10 hover:border-[#f59e0b]/60'
                            : 'border-[#1e2636] bg-[#0e131d] opacity-60 hover:opacity-85'
                      }`}
                    >
                      <Icon
                        className={`h-3.5 w-3.5 ${
                          unlocked ? 'text-[#fbbf24]' : 'text-[#64748b]'
                        }`}
                      />
                      <span
                        className={`text-[10px] font-medium whitespace-nowrap ${
                          unlocked ? 'text-[#e6edf7]' : 'text-[#64748b]'
                        }`}
                      >
                        {badge.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] text-[#8b98b1]">
                <span className="font-medium text-[#e6edf7]">
                  {inspectedBadge.label}：
                </span>
                {inspectedBadge.reward}
                {streakDays >= inspectedBadge.days
                  ? '（已達成）'
                  : `（還差 ${inspectedBadge.days - streakDays} 天）`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
