import { Award, CheckCircle2, Flame, Sparkles, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { RankTier, SessionResult } from '../types/toeic';
import { CanvasConfetti } from './CanvasConfetti';
import { GAME_IMAGE_ASSETS, GameImageFrame } from './PartnerEvolutionBadge';

export interface MissionCelebrationModalProps {
  result: SessionResult | null;
  previousXp: number;
  newXp: number;
  maxCareerXp: number;
  streakDays: number;
  rankTiers: RankTier[];
  onClose: () => void;
  onPracticeWeakness: () => void;
}

export function MissionCelebrationModal({
  result,
  previousXp,
  newXp,
  maxCareerXp,
  streakDays,
  rankTiers,
  onClose,
  onPracticeWeakness,
}: MissionCelebrationModalProps) {
  const [boxOpened, setBoxOpened] = useState(false);
  const [animatedXp, setAnimatedXp] = useState(previousXp);

  useEffect(() => {
    if (!result) return;
    setBoxOpened(false);
    setAnimatedXp(previousXp);
  }, [result, previousXp]);

  useEffect(() => {
    if (!boxOpened) return;
    const t = setTimeout(() => setAnimatedXp(newXp), 180);
    return () => clearTimeout(t);
  }, [boxOpened, newXp]);

  if (!result) return null;

  const prevRank = rankTiers.reduce(
    (acc, tier) => (previousXp >= tier.minXp ? tier : acc),
    rankTiers[0]
  );
  const currentRank = rankTiers.reduce(
    (acc, tier) => (newXp >= tier.minXp ? tier : acc),
    rankTiers[0]
  );
  const rankedUp = currentRank.level > prevRank.level;

  const accuracy =
    result.totalAnswered > 0
      ? Math.round((result.correctCount / result.totalAnswered) * 100)
      : 100;
  const progressPct = Math.min(100, Math.round((animatedXp / maxCareerXp) * 100));

  return (
    <>
      <CanvasConfetti active={boxOpened} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="celebration-title"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      >
        <div className="animate-modal-pop relative w-full max-w-md overflow-hidden rounded-2xl border border-[#263044] bg-[#111622] p-6 shadow-2xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[#3b82f6]/15 blur-3xl"
          />

          <button
            type="button"
            onClick={onClose}
            aria-label="關閉結算視窗"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-[#8b98b1] transition-all hover:bg-[#171d2c] hover:text-white active:scale-90"
          >
            <X className="h-4 w-4" />
          </button>

          {!boxOpened ? (
            /* Step 1: 3D Tech Supply Drop Crate */
            <div className="py-3 text-center">
              <p className="text-xs font-medium text-[#60a5fa]">
                {result.missionTitle} · 關卡突破
              </p>
              <h2
                id="celebration-title"
                className="mt-1 font-display text-2xl font-bold text-white"
              >
                獲得 3D 科技補給箱
              </h2>
              <p className="mt-1.5 text-xs text-[#8b98b1]">
                點擊補給箱開啟全螢幕彩帶慶祝與 XP 入帳結算
              </p>

              <button
                type="button"
                onClick={() => setBoxOpened(true)}
                className="animate-crate-float group mx-auto mt-6 block rounded-2xl border border-[#f59e0b]/50 p-1 shadow-[0_0_36px_-8px_rgba(245,158,11,0.5)] transition-transform duration-150 hover:scale-105 active:scale-95"
              >
                <GameImageFrame
                  src={GAME_IMAGE_ASSETS.supplyCrate}
                  alt="3D 科技補給箱"
                  className="h-32 w-32 rounded-xl border-0"
                  fallbackLabel="BOX"
                />
              </button>

              <button
                type="button"
                onClick={() => setBoxOpened(true)}
                className="mt-6 min-h-[48px] w-full rounded-xl bg-[#3b82f6] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-6px_rgba(59,130,246,0.5)] hover:bg-[#2563eb] active:scale-[0.95]"
              >
                點擊開箱領取 +{result.totalXpEarned} XP
              </button>
            </div>
          ) : (
            /* Step 2: Opened Supply Drop + Full-Screen Canvas Confetti */
            <div>
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                <svg viewBox="0 0 80 80" className="absolute inset-0 h-20 w-20">
                  <circle cx="40" cy="40" r="36" fill="none" stroke="#1e293b" strokeWidth="2" />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke={rankedUp ? '#f59e0b' : '#10b981'}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="animate-ring-draw"
                  />
                </svg>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    rankedUp
                      ? 'bg-[#f59e0b]/20 text-[#f59e0b]'
                      : 'bg-[#10b981]/20 text-[#10b981]'
                  }`}
                >
                  {rankedUp ? <Award className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="inline-flex items-center gap-1 text-xs font-medium text-[#60a5fa]">
                  <Sparkles className="h-3.5 w-3.5 text-[#f59e0b]" />
                  {rankedUp
                    ? `階級提升 · Lv.${currentRank.level}（${currentRank.targetLabel}）${currentRank.title}`
                    : result.supplyRewardLabel}
                </p>
                <h2
                  id="celebration-title"
                  className="mt-1 font-display text-2xl font-bold text-white"
                >
                  {rankedUp ? '解鎖全新夥伴階級' : '今日實戰獎勵已入帳'}
                </h2>
              </div>

              <div className="mt-5 grid grid-cols-3 divide-x divide-[#1e2636] border-y border-[#1e2636] py-3 text-center">
                <div>
                  <div className="text-[11px] text-[#8b98b1]">正確率</div>
                  <div className="mt-1 font-mono text-lg font-bold text-white tabular-nums">
                    {accuracy}%
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#8b98b1]">最高連擊</div>
                  <div className="mt-1 inline-flex items-center gap-1 font-mono text-lg font-bold text-[#f59e0b] tabular-nums">
                    <Zap className="h-4 w-4" />
                    {result.peakCombo}×
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#8b98b1]">台北連勝</div>
                  <div className="mt-1 inline-flex items-center gap-1 font-mono text-lg font-bold text-[#fbbf24] tabular-nums">
                    <Flame className="h-4 w-4" />
                    {streakDays} 天
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#94a3b8]">
                  <span>題目作答經驗（獨立 +5 / 提示 +2 / 努力 +1）</span>
                  <span className="font-mono text-[#e6edf7] tabular-nums">
                    +{result.questionXpEarned} XP
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#94a3b8]">
                  <span>單項達成精熟獎勵</span>
                  <span className="font-mono text-[#f59e0b] tabular-nums">
                    +{result.masteryBonusXp} XP
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#94a3b8]">
                  <span>每日課表全勤獎勵（每日限 1 次）</span>
                  <span className="font-mono text-[#10b981] tabular-nums">
                    +{result.fullAttendanceBonusXp} XP
                  </span>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white tabular-nums">
                      累計 {newXp.toLocaleString()} / {maxCareerXp.toLocaleString()} XP
                    </span>
                    <span className="font-mono font-bold text-[#60a5fa] tabular-nums">
                      本次 +{result.totalXpEarned} XP
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#1b2233]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] to-[#f59e0b] transition-all duration-700 ease-out"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={onPracticeWeakness}
                  className="min-h-[44px] flex-1 rounded-xl border border-[#263044] bg-[#171d2c] px-4 py-2.5 text-xs font-semibold text-[#e6edf7] transition-all hover:border-[#3b82f6] active:scale-[0.96]"
                >
                  前往診斷與弱項
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[44px] flex-1 rounded-xl bg-[#3b82f6] px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-[#2563eb] active:scale-[0.96]"
                >
                  回到總覽儀表板
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
