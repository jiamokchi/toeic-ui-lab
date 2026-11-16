import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Volume2,
  VolumeX,
  XCircle,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SessionResult, ToeicQuestion } from '../types/toeic';
import {
  playFeedbackTone,
  speakEnglish,
  stopSpeaking,
} from '../utils/soundAndSpeech';

interface PracticeRunnerProps {
  title: string;
  questions: ToeicQuestion[];
  isDailyMission: boolean;
  timeLimitSeconds?: number;
  muted: boolean;
  onToggleMute: () => void;
  onExit: () => void;
  onComplete: (result: SessionResult) => void;
}

function getComboMultiplier(combo: number): number {
  if (combo >= 5) return 2.0;
  if (combo >= 3) return 1.5;
  if (combo >= 2) return 1.2;
  return 1.0;
}

export function PracticeRunner({
  title,
  questions,
  isDailyMission,
  timeLimitSeconds,
  muted,
  onToggleMute,
  onExit,
  onComplete,
}: PracticeRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [combo, setCombo] = useState(0);
  const [peakCombo, setPeakCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [baseXpEarned, setBaseXpEarned] = useState(0);
  const [comboBonusXp, setComboBonusXp] = useState(0);
  const [lastXpGain, setLastXpGain] = useState<{
    amount: number;
    key: number;
    isCombo: boolean;
  } | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isAnswered = selectedIndex !== null;
  const isLast = currentIndex === questions.length - 1;

  // Timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Stop speech on unmount or question change
  useEffect(() => {
    stopSpeaking();
    setIsSpeaking(false);
    return () => stopSpeaking();
  }, [currentIndex]);

  const handlePlayAudio = useCallback(() => {
    if (!currentQuestion?.audioScript) return;
    speakEnglish(
      currentQuestion.audioScript,
      0.94,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  }, [currentQuestion]);

  const handleSelectOption = useCallback(
    (optionIdx: number) => {
      if (isAnswered || !currentQuestion?.options) return;
      if (optionIdx < 0 || optionIdx >= currentQuestion.options.length) return;

      setSelectedIndex(optionIdx);
      const isCorrect = optionIdx === currentQuestion.correctIndex;

      if (isCorrect) {
        const nextCombo = combo + 1;
        const multiplier = getComboMultiplier(nextCombo);
        const base = 15;
        const gained = Math.round(base * multiplier);
        const bonus = gained - base;

        setCombo(nextCombo);
        setPeakCombo((p) => Math.max(p, nextCombo));
        setCorrectCount((c) => c + 1);
        setBaseXpEarned((b) => b + base);
        setComboBonusXp((cb) => cb + bonus);
        setLastXpGain({
          amount: gained,
          key: Date.now(),
          isCombo: nextCombo >= 2,
        });

        playFeedbackTone(nextCombo >= 3 ? 'combo' : 'correct', muted);
      } else {
        setCombo(0);
        setBaseXpEarned((b) => b + 5); // participation effort XP
        setLastXpGain({ amount: 5, key: Date.now(), isCombo: false });
        playFeedbackTone('wrong', muted);
      }
    },
    [combo, currentQuestion, isAnswered, muted]
  );

  const handleNext = useCallback(() => {
    if (!isAnswered) return;
    if (isLast) {
      const completionBonusXp = isDailyMission ? 30 : 15;
      playFeedbackTone('complete', muted);
      onComplete({
        missionTitle: title,
        totalAnswered: questions.length,
        correctCount,
        peakCombo,
        baseXpEarned,
        comboBonusXp,
        completionBonusXp,
        totalXpEarned: baseXpEarned + comboBonusXp + completionBonusXp,
        elapsedSeconds,
        isDailyMission,
      });
    } else {
      setSelectedIndex(null);
      setCurrentIndex((i) => i + 1);
    }
  }, [
    baseXpEarned,
    comboBonusXp,
    correctCount,
    elapsedSeconds,
    isAnswered,
    isDailyMission,
    isLast,
    muted,
    onComplete,
    peakCombo,
    questions.length,
    title,
  ]);

  // Keep latest handlers in refs for clean keyboard listener
  const selectRef = useRef(handleSelectOption);
  const nextRef = useRef(handleNext);
  const audioRef = useRef(handlePlayAudio);
  selectRef.current = handleSelectOption;
  nextRef.current = handleNext;
  audioRef.current = handlePlayAudio;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        selectRef.current(Number(e.key) - 1);
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (isAnswered) {
          e.preventDefault();
          nextRef.current();
        }
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        audioRef.current();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isAnswered]);

  const formattedTime = useMemo(() => {
    const displaySecs = timeLimitSeconds
      ? Math.max(0, timeLimitSeconds - elapsedSeconds)
      : elapsedSeconds;
    const mins = Math.floor(displaySecs / 60);
    const secs = displaySecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [elapsedSeconds, timeLimitSeconds]);

  const multiplier = getComboMultiplier(combo);
  const progressPct = Math.round(((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100);

  if (!currentQuestion) return null;

  return (
    <div className="mx-auto max-w-3xl pb-24 md:pb-8">
      {/* Top Tactical Header */}
      <div className="flex items-center justify-between gap-3 border-b border-[#1e2636] pb-4">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#263044] bg-[#111622] px-3 py-1.5 text-xs font-medium text-[#cbd5e1] transition-colors hover:border-[#3b82f6]/50 hover:text-white active:scale-[0.98]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>離開練習</span>
        </button>

        <div className="flex items-center gap-4 text-xs">
          {/* Combo Multiplier Display */}
          <div className="relative flex items-center gap-1.5">
            <motion.div
              key={combo}
              initial={combo >= 2 ? { scale: 1.18 } : false}
              animate={{ scale: 1 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 font-mono font-semibold tabular-nums transition-colors ${
                combo >= 3
                  ? 'border-[#f59e0b]/60 bg-[#f59e0b]/15 text-[#fbbf24]'
                  : combo >= 2
                    ? 'border-[#3b82f6]/60 bg-[#3b82f6]/15 text-[#60a5fa]'
                    : 'border-[#1e2636] bg-[#111622] text-[#8b98b1]'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>
                {combo >= 2
                  ? `COMBO ×${combo} (${multiplier.toFixed(1)}×)`
                  : `連擊 ${combo}`}
              </span>
            </motion.div>

            {/* Micro XP Float Pop */}
            <AnimatePresence>
              {lastXpGain && (
                <motion.span
                  key={lastXpGain.key}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: -14 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.65 }}
                  className={`pointer-events-none absolute -top-3 right-0 font-mono text-xs font-bold tabular-nums ${
                    lastXpGain.isCombo ? 'text-[#f59e0b]' : 'text-[#10b981]'
                  }`}
                >
                  +{lastXpGain.amount} XP
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[#94a3b8] tabular-nums">
            <Clock className="h-3.5 w-3.5 text-[#64748b]" />
            <span>{formattedTime}</span>
          </div>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? '開啟音效' : '靜音音效'}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1e2636] bg-[#111622] text-[#8b98b1] hover:text-white"
          >
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Progress Strip */}
      <div className="mt-4 flex items-center justify-between text-xs text-[#8b98b1]">
        <span>
          {title} · {currentQuestion.partLabel} · 難度 {currentQuestion.difficulty}
        </span>
        <span className="font-mono text-[#cbd5e1] tabular-nums">
          第 {currentIndex + 1} / {questions.length} 題
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#1a2030]">
        <div
          className="h-full rounded-full bg-[#3b82f6] transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Main Question Stage — Distraction-Free Reading Surface */}
      <div
        className={`mt-5 rounded-2xl border bg-[#111622] p-5 sm:p-7 transition-colors duration-200 ${
          combo >= 3 && isAnswered && selectedIndex === currentQuestion.correctIndex
            ? 'border-[#f59e0b]/45'
            : 'border-[#1e2636]'
        }`}
      >
        {/* Reading Passage if Part 7 */}
        {currentQuestion.passage && (
          <div className="mb-5 border-b border-[#1e2636] pb-5">
            {currentQuestion.passageHeader && (
              <p className="mb-2 font-mono text-[11px] font-medium text-[#60a5fa]">
                {currentQuestion.passageHeader}
              </p>
            )}
            <p className="text-sm leading-relaxed text-[#cbd5e1] sm:text-[15px]">
              {currentQuestion.passage}
            </p>
          </div>
        )}

        {/* Audio Player if Listening */}
        {currentQuestion.audioScript && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#222c40] bg-[#0e131d] px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePlayAudio}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#3b82f6] px-3.5 py-2 text-xs font-semibold text-white transition-all hover:bg-[#2563eb] active:scale-[0.97]"
              >
                <Volume2 className="h-4 w-4" />
                <span>{isSpeaking ? '朗讀中...' : '播放題目語音'}</span>
              </button>
              <span className="hidden text-xs text-[#8b98b1] sm:inline">
                快捷鍵 [R] 重播
              </span>
            </div>

            {/* Subtle Equalizer Bars */}
            <div className="flex h-5 items-end gap-1" aria-hidden="true">
              {[0.4, 0.9, 0.6, 1, 0.5].map((h, i) => (
                <span
                  key={i}
                  className={`w-1 rounded-full transition-all duration-200 ${
                    isSpeaking ? 'bg-[#60a5fa]' : 'bg-[#2a344a]'
                  }`}
                  style={{
                    height: isSpeaking ? `${Math.round(h * 18)}px` : '5px',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Question Prompt */}
        <h3 className="text-base font-medium leading-relaxed text-white sm:text-lg">
          {currentQuestion.prompt}
        </h3>

        {/* 1-4 Ergonomic Options Stack */}
        <div className="mt-6 space-y-2.5">
          {currentQuestion.options?.map((opt, idx) => {
            const isSelected = selectedIndex === idx;
            const isCorrectOpt = idx === currentQuestion.correctIndex;

            let optionClass =
              'border-[#232c3f] bg-[#0e131d] text-[#e6edf7] hover:border-[#3b82f6]/60 hover:bg-[#151c2c]';
            if (isAnswered) {
              if (isCorrectOpt) {
                optionClass =
                  'border-[#10b981] bg-[#10b981]/12 text-white';
              } else if (isSelected && !isCorrectOpt) {
                optionClass =
                  'border-[#f43f5e] bg-[#f43f5e]/12 text-[#fecdd3]';
              } else {
                optionClass =
                  'border-[#1b2232] bg-[#0d111a] text-[#64748b] opacity-70';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] ${optionClass}`}
              >
                <div className="flex items-center gap-3.5">
                  <kbd
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-semibold tabular-nums ${
                      isAnswered && isCorrectOpt
                        ? 'border-[#10b981] bg-[#10b981]/20 text-[#34d399]'
                        : isAnswered && isSelected && !isCorrectOpt
                          ? 'border-[#f43f5e] bg-[#f43f5e]/20 text-[#fb7185]'
                          : 'border-[#263044] bg-[#141a28] text-[#94a3b8]'
                    }`}
                  >
                    {idx + 1}
                  </kbd>
                  <span className="leading-snug">{opt}</span>
                </div>

                {isAnswered && isCorrectOpt && (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#10b981]" />
                )}
                {isAnswered && isSelected && !isCorrectOpt && (
                  <XCircle className="h-4 w-4 shrink-0 text-[#f43f5e]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Instant Explanation Drawer */}
        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 border-t border-[#1e2636] pt-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span
                  className={`font-semibold ${
                    selectedIndex === currentQuestion.correctIndex
                      ? 'text-[#10b981]'
                      : 'text-[#fb7185]'
                  }`}
                >
                  {selectedIndex === currentQuestion.correctIndex
                    ? '答對了 · 思路正確'
                    : `答錯了 · 正確答案為選項 (${(currentQuestion.correctIndex ?? 0) + 1})`}
                </span>
                <span className="text-[#8b98b1]">
                  考點：{currentQuestion.weaknessTag}
                </span>
              </div>

              {currentQuestion.audioScript && (
                <p className="mt-2 font-mono text-xs text-[#94a3b8]">
                  原文：{currentQuestion.audioScript}
                </p>
              )}

              <p className="mt-2.5 text-sm leading-relaxed text-[#cbd5e1]">
                {currentQuestion.explanation}
              </p>

              <div className="mt-5 flex items-center justify-between gap-4">
                <span className="hidden text-xs text-[#64748b] sm:inline">
                  按 Enter 或 Space 進入下一題
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="ml-auto inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#3b82f6] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#2563eb] active:scale-[0.98] sm:w-auto"
                >
                  <span>{isLast ? '完成任務並結算 XP' : '下一題'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
