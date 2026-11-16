import { Check, Crown, Flame, MapPin, Trophy, Zap } from 'lucide-react';
import { useState } from 'react';
import { DailyProgressDay, RankTier } from '../types/toeic';
import {
  EVOLUTION_STAGES,
  GAME_IMAGE_ASSETS,
  StageAvatar,
} from './PartnerEvolutionBadge';

const STREAK_ACHIEVEMENTS = [
  { id: '3d', days: 3, label: '3 天火花', icon: Flame, reward: '連續 3 日養成起動節奏' },
  { id: '7d', days: 7, label: '7 天閃電', icon: Zap, reward: '達成單週滿勤專注節奏' },
  { id: '14d', days: 14, label: '14 天火炬', icon: Trophy, reward: '常駐雙週專注勳章' },
  { id: '30d', days: 30, label: '30 天殿堂', icon: Crown, reward: '解鎖月度全勤金框榮譽' },
];

export interface RankProgressTrackProps {
  currentXp: number;
  maxCareerXp: number;
  streakDays: number;
  rankTiers: RankTier[];
  weeklyData: DailyProgressDay[];
  todayCompleted: boolean;
  onOpenBlueprint: () => void;
}

export function RankProgressTrack({
  currentXp,
  maxCareerXp,
  streakDays,
  rankTiers,
  weeklyData,
  todayCompleted,
  onOpenBlueprint,
}: RankProgressTrackProps) {
  const [bannerError, setBannerError] = useState(false);

  const currentRankIndex = rankTiers.reduce((acc, tier, idx) => {
    return currentXp >= tier.minXp ? idx : acc;
  }, 0);

  const currentRank = rankTiers[currentRankIndex];
  const nextRank = rankTiers[currentRankIndex + 1] ?? null;
  const currentStage = EVOLUTION_STAGES[currentRankIndex] ?? EVOLUTION_STAGES[0];

  const [selectedTierId, setSelectedTierId] = useState<string>(currentRank.id);
  const [selectedBadgeId, setSelectedBadgeId] = useState<string>('14d');

  const inspectedTier =
    rankTiers.find((t) => t.id === selectedTierId) ?? currentRank;
  const inspectedBadge =
    STREAK_ACHIEVEMENTS.find((b) => b.id === selectedBadgeId) ??
    STREAK_ACHIEVEMENTS[0];

  const progressPercent = Math.min(100, Math.round((currentXp / maxCareerXp) * 100));
  const xpToNext = nextRank ? Math.max(0, nextRank.minXp - currentXp) : 0;

  return (
    <section
      aria-label="TOEIC 800 冒險階梯與連勝進度"
      className="relative overflow-hidden rounded-2xl border border-[#1e2636] bg-[#111622] p-5 sm:p-6"
    >
      {/* Atmospheric 16:9 Game Command Bridge Backdrop with Measured Contrast Scrim */}
      {!bannerError && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <img
            src={GAME_IMAGE_ASSETS.heroBanner}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setBannerError(true)}
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e14]/95 via-[#111622]/85 to-[#0b0e14]/90" />
        </div>
      )}

      <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
        {/* Left 8 cols: 3D Active Partner + 5-Stage Adventure Map Ladder */}
        <div className="flex flex-col justify-between lg:col-span-8 lg:border-r lg:border-[#1e2636] lg:pr-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="animate-shiba-breathe">
                <StageAvatar stageId={currentStage.id} size="lg" />
              </div>
              <div>
                <p className="text-xs font-medium text-[#94a3b8]">
                  目前夥伴 · Lv.{currentRank.level}（{currentRank.targetLabel}）{currentRank.title}
                </p>
                <div className="mt-1 flex items-baseline gap-3">
                  <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl tabular-nums">
                    {currentXp.toLocaleString()}
                    <span className="ml-1.5 text-sm font-medium text-[#94a3b8]">
                      / {maxCareerXp.toLocaleString()} XP
                    </span>
                  </h1>
                  <span className="font-mono text-xs font-semibold text-[#10b981] tabular-nums">
                    總進度 {progressPercent}%
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenBlueprint}
              className="shrink-0 whitespace-nowrap rounded-lg border border-[#263044] bg-[#171d2c]/90 px-3 py-1.5 text-xs font-medium text-[#cbd5e1] transition-all duration-150 hover:border-[#3b82f6]/60 hover:text-white active:scale-[0.95]"
            >
              查看遊戲機制藍圖
            </button>
          </div>

          {/* Shimmering Liquid XP Bar */}
          <div className="mt-6">
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-[#1b2233]/90">
              <div
                className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-[#2563eb] via-[#3b82f6] to-[#f59e0b] transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="animate-xp-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              </div>
            </div>

            {/* 5 Connected Stage Nodes with 3D Avatars */}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {rankTiers.map((tier, idx) => {
                const isUnlocked = currentXp >= tier.minXp;
                const isCurrentStage = idx === currentRankIndex;
                const isSelected = inspectedTier.id === tier.id;
                const isFinal = tier.level === 5;
                const stageMeta = EVOLUTION_STAGES[idx];

                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedTierId(tier.id)}
                    className={`group relative flex min-h-[64px] flex-col justify-between rounded-xl border px-2.5 py-2 text-left transition-all duration-150 active:scale-[0.96] ${
                      isSelected
                        ? 'border-[#3b82f6] bg-[#171d2c]/95 shadow-[0_0_16px_-6px_rgba(59,130,246,0.5)]'
                        : isCurrentStage
                          ? 'border-[#3b82f6]/55 bg-[#141a29]/90'
                          : 'border-[#1e2636] bg-[#0e131d]/85 hover:border-[#2c3850]'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between gap-1">
                      <span
                        className={`font-mono text-xs font-bold tabular-nums ${
                          isFinal && isUnlocked
                            ? 'text-[#f59e0b]'
                            : isUnlocked
                              ? 'text-[#60a5fa]'
                              : 'text-[#64748b]'
                        }`}
                      >
                        Lv.{tier.level} · {tier.targetLabel}
                      </span>

                      {isCurrentStage ? (
                        <MapPin className="h-3.5 w-3.5 text-[#f59e0b]" />
                      ) : isUnlocked ? (
                        <Check className="h-3.5 w-3.5 text-[#10b981]" />
                      ) : (
                        <span className="font-mono text-[10px] text-[#64748b] tabular-nums">
                          {tier.minXp >= 1000 ? `${tier.minXp / 1000}k` : tier.minXp}
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 flex items-center gap-1.5">
                      {stageMeta && (
                        <div className={isUnlocked ? '' : 'opacity-45 grayscale'}>
                          <StageAvatar stageId={stageMeta.id} size="sm" />
                        </div>
                      )}
                      <span
                        className={`truncate text-[11px] font-medium ${
                          isUnlocked ? 'text-[#e6edf7]' : 'text-[#8b98b1]'
                        }`}
                      >
                        {tier.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#94a3b8]">
              <p>
                <span className="font-semibold text-[#e6edf7]">
                  Lv.{inspectedTier.level}（{inspectedTier.targetLabel}）{inspectedTier.title}：
                </span>
                {inspectedTier.perk}
              </p>
              <span className="font-mono text-[#60a5fa] tabular-nums">
                {nextRank
                  ? `距離 Lv.${nextRank.level}（${nextRank.targetLabel}）還差 ${xpToNext.toLocaleString()} XP`
                  : '已抵達 32,000 XP 最終殿堂'}
              </span>
            </div>
          </div>
        </div>

        {/* Right 4 cols: Taipei UTC+8 Consecutive Days Streak & Achievement Badges */}
        <div className="flex flex-col justify-between lg:col-span-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-[#94a3b8]">
                連續專注天數 · 台北時區 (UTC+8)
              </p>
              <div className="mt-1.5 flex items-center gap-2.5">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                    todayCompleted
                      ? 'border-[#f59e0b]/45 bg-[#f59e0b]/15 text-[#f59e0b]'
                      : 'border-[#263044] bg-[#171d2c]/90 text-[#f59e0b]'
                  }`}
                >
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display text-2xl font-bold text-white tabular-nums">
                    {streakDays} 天
                  </div>
                  <p className="text-xs text-[#94a3b8]">
                    {todayCompleted ? '今日已簽到延長連勝' : '完成今日課表即可 +1 天'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Check-in Grid */}
          <div className="mt-4">
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
                            ? 'border-dashed border-[#3b82f6] bg-[#171d2c]/90 text-[#60a5fa]'
                            : 'border-[#1e2636] bg-[#0e131d]/85 text-[#475569]'
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

            {/* 3 / 7 / 14 / 30 Day Dynamic Achievement Badges */}
            <div className="mt-4 border-t border-[#1e2636] pt-3.5">
              <div className="flex items-center justify-between text-[11px] text-[#94a3b8]">
                <span>連續天數成就徽章</span>
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
                      className={`flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-lg border px-1.5 py-1.5 transition-all duration-150 active:scale-95 ${
                        active
                          ? 'border-[#3b82f6] bg-[#171d2c]'
                          : unlocked
                            ? 'border-[#f59e0b]/35 bg-[#f59e0b]/10 hover:border-[#f59e0b]/60'
                            : 'border-[#1e2636] bg-[#0e131d]/85 opacity-60 hover:opacity-85'
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
              <p className="mt-2 text-[11px] text-[#94a3b8]">
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
