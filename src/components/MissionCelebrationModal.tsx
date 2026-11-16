import { AnimatePresence, motion } from 'motion/react';
import { Award, CheckCircle2, Flame, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { RankTier, SessionResult } from '../types/toeic';

interface MissionCelebrationModalProps {
  result: SessionResult | null;
  previousXp: number;
  newXp: number;
  streakDays: number;
  rankTiers: RankTier[];
  onClose: () => void;
  onPracticeWeakness: () => void;
}

export function MissionCelebrationModal({
  result,
  previousXp,
  newXp,
  streakDays,
  rankTiers,
  onClose,
  onPracticeWeakness,
}: MissionCelebrationModalProps) {
  const [animatedXp, setAnimatedXp] = useState(previousXp);

  const prevRank = rankTiers.reduce(
    (acc, tier) => (previousXp >= tier.minXp ? tier : acc),
    rankTiers[0]
  );
  const currentRank = rankTiers.reduce(
    (acc, tier) => (newXp >= tier.minXp ? tier : acc),
    rankTiers[0]
  );
  const rankedUp = currentRank.targetScore > prevRank.targetScore;
  const maxXp = rankTiers[rankTiers.length - 1].minXp;

  useEffect(() => {
    if (!result) return;
    setAnimatedXp(previousXp);
    const timer = setTimeout(() => {
      setAnimatedXp(newXp);
    }, 260);
    return () => clearTimeout(timer);
  }, [result, previousXp, newXp]);

  if (!result) return null;

  const accuracy =
    result.totalAnswered > 0
      ? Math.round((result.correctCount / result.totalAnswered) * 100)
      : 100;
  const progressPct = Math.min(100, Math.round((animatedXp / maxXp) * 100));

const CONFETTI_PARTICLES = [
  { x: -120, y: -78, rotate: -45, color: '#3b82f6', w: 8, h: 4 },
  { x: -86, y: -108, rotate: 30, color: '#f59e0b', w: 6, h: 6 },
  { x: -42, y: -116, rotate: -25, color: '#10b981', w: 9, h: 4 },
  { x: 18, y: -120, rotate: 55, color: '#60a5fa', w: 7, h: 4 },
  { x: 64, y: -104, rotate: -35, color: '#fbbf24', w: 8, h: 5 },
  { x: 112, y: -84, rotate: 42, color: '#10b981', w: 6, h: 6 },
  { x: -135, y: -24, rotate: 68, color: '#fbbf24', w: 7, h: 4 },
  { x: 132, y: -30, rotate: -62, color: '#3b82f6', w: 8, h: 4 },
  { x: -102, y: 22, rotate: -20, color: '#60a5fa', w: 6, h: 6 },
  { x: 105, y: 18, rotate: 28, color: '#f59e0b', w: 7, h: 4 },
  { x: -64, y: -62, rotate: 18, color: '#10b981', w: 5, h: 5 },
  { x: 70, y: -58, rotate: -48, color: '#60a5fa', w: 6, h: 4 },
];

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="celebration-title"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#263044] bg-[#111622] p-6 shadow-2xl"
        >
          {/* Subtle Precision Orbital Light Accent */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[#3b82f6]/15 blur-3xl"
          />

          {/* Confetti Ribbon Burst */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-16 h-0 w-0"
          >
            {CONFETTI_PARTICLES.map((p, i) => (
              <motion.span
                key={i}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
                animate={{
                  x: p.x,
                  y: [0, p.y, p.y + 38],
                  scale: [0, 1.1, 0.85],
                  opacity: [1, 1, 0],
                  rotate: p.rotate * 2,
                }}
                transition={{
                  duration: 1.25,
                  delay: i * 0.02,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  width: `${p.w}px`,
                  height: `${p.h}px`,
                  backgroundColor: p.color,
                }}
                className="absolute block rounded-[2px]"
              />
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="關閉結算視窗"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-[#8b98b1] transition-all hover:bg-[#171d2c] hover:text-white active:scale-90"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Animated Emblem */}
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
            <motion.svg
              viewBox="0 0 80 80"
              className="absolute inset-0 h-20 w-20"
              initial={{ rotate: -30, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="#1e293b"
                strokeWidth="2"
              />
              <motion.circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke={rankedUp ? '#f59e0b' : '#10b981'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="226"
                initial={{ strokeDashoffset: 226 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              />
            </motion.svg>

            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`flex h-12 w-12 items-center justify-center rounded-full ${
                rankedUp
                  ? 'bg-[#f59e0b]/20 text-[#f59e0b]'
                  : 'bg-[#10b981]/20 text-[#10b981]'
              }`}
            >
              {rankedUp ? (
                <Award className="h-6 w-6" />
              ) : (
                <CheckCircle2 className="h-6 w-6" />
              )}
            </motion.div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs font-medium text-[#60a5fa]">
              {rankedUp
                ? `進階稱號解鎖 · TOEIC ${currentRank.targetScore} ${currentRank.title}`
                : `${result.missionTitle} · 完成結算`}
            </p>
            <h2
              id="celebration-title"
              className="mt-1 font-display text-2xl font-bold text-white"
            >
              {rankedUp ? '恭喜突破分數門檻' : '今日實戰目標達成'}
            </h2>
          </div>

          {/* 3 Clean Metrics Row (No nested bordered cards) */}
          <div className="mt-6 grid grid-cols-3 divide-x divide-[#1e2636] border-y border-[#1e2636] py-3.5 text-center">
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
              <div className="text-[11px] text-[#8b98b1]">連勝紀錄</div>
              <div className="mt-1 inline-flex items-center gap-1 font-mono text-lg font-bold text-[#fbbf24] tabular-nums">
                <Flame className="h-4 w-4" />
                {streakDays} 天
              </div>
            </div>
          </div>

          {/* XP Breakdown + Animated Progress Fill */}
          <div className="mt-5 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-[#94a3b8]">
              <span>基礎任務經驗值</span>
              <span className="font-mono text-[#e6edf7] tabular-nums">
                +{result.baseXpEarned} XP
              </span>
            </div>
            <div className="flex items-center justify-between text-[#94a3b8]">
              <span>Combo 連擊加成</span>
              <span className="font-mono text-[#f59e0b] tabular-nums">
                +{result.comboBonusXp} XP
              </span>
            </div>
            <div className="flex items-center justify-between text-[#94a3b8]">
              <span>每日完賽獎勵</span>
              <span className="font-mono text-[#10b981] tabular-nums">
                +{result.completionBonusXp} XP
              </span>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">
                  累計經驗 {newXp.toLocaleString()} XP
                </span>
                <span className="font-mono font-bold text-[#60a5fa] tabular-nums">
                  總獲得 +{result.totalXpEarned} XP
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

          {/* Bottom Actions */}
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={onPracticeWeakness}
              className="flex-1 min-h-[44px] rounded-xl border border-[#263044] bg-[#171d2c] px-4 py-2.5 text-xs font-semibold text-[#e6edf7] transition-colors hover:border-[#3b82f6] active:scale-[0.98]"
            >
              檢視弱項診斷
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[44px] rounded-xl bg-[#3b82f6] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#2563eb] active:scale-[0.98]"
            >
              回到儀表板
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
