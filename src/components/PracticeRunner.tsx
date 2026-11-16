import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Flag,
  Heart,
  Lightbulb,
  ShieldAlert,
  Volume2,
  VolumeX,
  XCircle,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PlaybackRate, SessionResult, ToeicQuestion } from '../types/toeic';
import {
  playFeedbackTone,
  speakEnglish,
  stopSpeaking,
} from '../utils/soundAndSpeech';

export interface PracticeRunnerProps {
  title: string;
  questions: ToeicQuestion[];
  isDailyMission: boolean;
  answeredTodayIds: string[];
  timeLimitSeconds?: number;
  muted: boolean;
  onToggleMute: () => void;
  onReportIssue?: (questionId: string) => void;
  onExit: () => void;
  onComplete: (result: SessionResult, newlyAnsweredIds: string[]) => void;
}

export function PracticeRunner({
  title,
  questions,
  isDailyMission,
  answeredTodayIds,
  timeLimitSeconds,
  muted,
  onToggleMute,
  onReportIssue,
  onExit,
  onComplete,
}: PracticeRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [usedHint, setUsedHint] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<PlaybackRate>(1.0);
  const [reportedIds, setReportedIds] = useState<string[]>([]);

  // Battle Arena Game States
  const [combo, setCombo] = useState(0);
  const [peakCombo, setPeakCombo] = useState(0);
  const [shields, setShields] = useState(3);
  const [bossHpRemaining, setBossHpRemaining] = useState(questions.length);
  const [bossShaking, setBossShaking] = useState(false);

  // Exact 1-Year XP Accumulators (+5 / +2 / +1 / +0 duplicate)
  const [correctCount, setCorrectCount] = useState(0);
  const [independentCorrectCount, setIndependentCorrectCount] = useState(0);
  const [hintedCorrectCount, setHintedCorrectCount] = useState(0);
  const [questionXpEarned, setQuestionXpEarned] = useState(0);
  const [sessionAnsweredIds, setSessionAnsweredIds] = useState<string[]>([]);
  const [lastXpPop, setLastXpPop] = useState<{
    label: string;
    key: number;
    tone: 'gold' | 'green' | 'muted';
  } | null>(null);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isAnswered = selectedIndex !== null;
  const isLast = currentIndex === questions.length - 1;
  const isFever = combo >= 3;
  const isDuplicateToday = currentQuestion
    ? answeredTodayIds.includes(currentQuestion.id)
    : false;

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    stopSpeaking();
    setIsSpeaking(false);
    setShowTranscript(false);
    return () => stopSpeaking();
  }, [currentIndex]);

  const handlePlayAudio = useCallback(() => {
    if (!currentQuestion?.audioScript) return;
    speakEnglish(
      currentQuestion.audioScript,
      playbackRate,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  }, [currentQuestion, playbackRate]);

  const handleSelectOption = useCallback(
    (optionIdx: number) => {
      if (isAnswered || !currentQuestion?.options) return;
      if (optionIdx < 0 || optionIdx >= currentQuestion.options.length) return;

      setSelectedIndex(optionIdx);
      const isCorrect = optionIdx === currentQuestion.correctIndex;
      const alreadyAnsweredToday = answeredTodayIds.includes(currentQuestion.id);

      if (!alreadyAnsweredToday) {
        setSessionAnsweredIds((prev) =>
          prev.includes(currentQuestion.id) ? prev : [...prev, currentQuestion.id]
        );
      }

      if (isCorrect) {
        const nextCombo = combo + 1;
        setCombo(nextCombo);
        setPeakCombo((p) => Math.max(p, nextCombo));
        setCorrectCount((c) => c + 1);
        setBossHpRemaining((hp) => Math.max(0, hp - 1));
        setBossShaking(true);
        setTimeout(() => setBossShaking(false), 340);

        if (usedHint) {
          setHintedCorrectCount((h) => h + 1);
        } else {
          setIndependentCorrectCount((ind) => ind + 1);
        }

        const xpDelta = alreadyAnsweredToday ? 0 : usedHint ? 2 : 5;
        setQuestionXpEarned((prev) => prev + xpDelta);
        setLastXpPop({
          label: alreadyAnsweredToday ? '+0 XP (今日已答)' : `+${xpDelta} XP`,
          key: Date.now(),
          tone: alreadyAnsweredToday ? 'muted' : nextCombo >= 3 ? 'gold' : 'green',
        });

        playFeedbackTone(nextCombo >= 3 ? 'combo' : 'correct', muted);
      } else {
        setCombo(0);
        setShields((s) => Math.max(0, s - 1));

        const xpDelta = alreadyAnsweredToday ? 0 : 1;
        setQuestionXpEarned((prev) => prev + xpDelta);
        setLastXpPop({
          label: alreadyAnsweredToday ? '+0 XP (今日已答)' : '+1 XP 努力值',
          key: Date.now(),
          tone: 'muted',
        });

        playFeedbackTone('wrong', muted);
      }
    },
    [answeredTodayIds, combo, currentQuestion, isAnswered, muted, usedHint]
  );

  const handleNext = useCallback(() => {
    if (!isAnswered) return;
    if (isLast) {
      const achievedMastery = correctCount >= Math.ceil(questions.length * 0.8);
      const masteryBonusXp = achievedMastery ? 10 : 0;
      const fullAttendanceBonusXp = isDailyMission ? 25 : 0;
      const totalXpEarned =
        questionXpEarned + masteryBonusXp + fullAttendanceBonusXp;

      playFeedbackTone('complete', muted);
      onComplete(
        {
          missionTitle: title,
          totalAnswered: questions.length,
          correctCount,
          independentCorrectCount,
          hintedCorrectCount,
          peakCombo,
          questionXpEarned,
          masteryBonusXp,
          fullAttendanceBonusXp,
          totalXpEarned,
          elapsedSeconds,
          isDailyMission,
          supplyRewardLabel: achievedMastery
            ? '精熟補給箱 · +10 XP 精熟加成'
            : '每日完賽補給箱 · 高頻單字複習券',
        },
        sessionAnsweredIds
      );
    } else {
      setSelectedIndex(null);
      setUsedHint(false);
      setCurrentIndex((i) => i + 1);
    }
  }, [
    correctCount,
    elapsedSeconds,
    hintedCorrectCount,
    independentCorrectCount,
    isAnswered,
    isDailyMission,
    isLast,
    muted,
    onComplete,
    peakCombo,
    questionXpEarned,
    questions.length,
    sessionAnsweredIds,
    title,
  ]);

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
      } else if (e.key === 'Enter') {
        if (isAnswered) {
          e.preventDefault();
          nextRef.current();
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        if (currentQuestion?.audioScript) {
          audioRef.current();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentQuestion, isAnswered]);

  const formattedTime = useMemo(() => {
    const displaySecs = timeLimitSeconds
      ? Math.max(0, timeLimitSeconds - elapsedSeconds)
      : elapsedSeconds;
    const mins = Math.floor(displaySecs / 60);
    const secs = displaySecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [elapsedSeconds, timeLimitSeconds]);

  const bossHpPct = Math.round((bossHpRemaining / Math.max(1, questions.length)) * 100);
  const isReported = currentQuestion ? reportedIds.includes(currentQuestion.id) : false;

  if (!currentQuestion) return null;

  return (
    <div className="mx-auto max-w-3xl pb-24 md:pb-8">
      {/* Top Tactical Controls */}
      <div className="flex items-center justify-between gap-3 pb-3">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#263044] bg-[#111622] px-3 py-1.5 text-xs font-medium text-[#cbd5e1] transition-all duration-150 hover:border-[#3b82f6]/50 hover:text-white active:scale-[0.95]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>離開對戰</span>
        </button>

        <div className="flex items-center gap-3 text-xs">
          {/* Combo / Fever Status */}
          <div className="relative flex items-center">
            <div
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono font-semibold tabular-nums transition-all duration-200 ${
                isFever
                  ? 'border-[#f59e0b]/70 bg-[#f59e0b]/15 text-[#fbbf24]'
                  : combo >= 2
                    ? 'border-[#3b82f6]/60 bg-[#3b82f6]/15 text-[#60a5fa]'
                    : 'border-[#1e2636] bg-[#111622] text-[#8b98b1]'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>{isFever ? `FEVER ×${combo}` : `連擊 ${combo}`}</span>
            </div>

            {lastXpPop && (
              <span
                key={lastXpPop.key}
                className={`animate-float-xp pointer-events-none absolute -top-3 right-0 whitespace-nowrap font-mono text-xs font-bold tabular-nums ${
                  lastXpPop.tone === 'gold'
                    ? 'text-[#fbbf24]'
                    : lastXpPop.tone === 'green'
                      ? 'text-[#10b981]'
                      : 'text-[#8b98b1]'
                }`}
              >
                {lastXpPop.label}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[#94a3b8] tabular-nums">
            <Clock className="h-3.5 w-3.5 text-[#64748b]" />
            <span>{formattedTime}</span>
          </div>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? '開啟音效' : '靜音音效'}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1e2636] bg-[#111622] text-[#8b98b1] transition-colors hover:text-white active:scale-90"
          >
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Battle Arena Stage Bar: Partner Shields vs. Stage Boss HP */}
      <div
        className={`rounded-xl border bg-[#111622] px-4 py-3 transition-all duration-300 ${
          isFever
            ? 'animate-fever-glow border-[#f59e0b]/60'
            : 'border-[#1e2636]'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Partner Energy Hearts */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-[#cbd5e1]">夥伴護盾</span>
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((idx) => (
                <Heart
                  key={idx}
                  className={`h-4 w-4 transition-all duration-200 ${
                    idx < shields
                      ? 'fill-[#3b82f6] text-[#60a5fa]'
                      : 'text-[#2a344a]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Center / Right: Stage Boss HP */}
          <div className={`flex flex-1 items-center justify-end gap-3 ${bossShaking ? 'animate-boss-shake' : ''}`}>
            <span className="text-xs font-medium text-[#94a3b8] whitespace-nowrap">
              關卡目標 · {title}
            </span>
            <div className="h-2.5 w-28 overflow-hidden rounded-full bg-[#1b2233] sm:w-40">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#f43f5e] to-[#f59e0b] transition-all duration-300"
                style={{ width: `${bossHpPct}%` }}
              />
            </div>
            <span className="font-mono text-xs font-semibold text-[#fbbf24] tabular-nums">
              {bossHpRemaining}/{questions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Question Metadata Row */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#8b98b1]">
        <span>
          {currentQuestion.partLabel} · 階級 {currentQuestion.difficulty}
          {isDuplicateToday ? ' · 今日已答 (+0 XP 防刷)' : ''}
        </span>
        <span className="font-mono text-[#cbd5e1] tabular-nums">
          第 {currentIndex + 1} / {questions.length} 題 · 本場 +{questionXpEarned} XP
        </span>
      </div>

      {/* Main Question Card — Reading Area Stays Pure & Distraction-Free */}
      <div className="mt-2.5 rounded-2xl border border-[#1e2636] bg-[#111622] p-5 sm:p-7">
        {/* Reading Passage (No effects inside reading zone) */}
        {currentQuestion.passage && (
          <div className="mb-5 border-b border-[#1e2636] pb-5">
            {currentQuestion.passageHeader && (
              <p className="mb-2 font-mono text-[11px] font-medium text-[#60a5fa]">
                {currentQuestion.passageHeader}
              </p>
            )}
            <p className="text-sm leading-relaxed text-[#e2e8f0] sm:text-[15px]">
              {currentQuestion.passage}
            </p>
          </div>
        )}

        {/* Audio Player + 0.9x / 1.0x / 1.15x Speed Switcher */}
        {currentQuestion.audioScript && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#222c40] bg-[#0e131d] px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePlayAudio}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#3b82f6] px-3.5 py-2 text-xs font-semibold text-white transition-all hover:bg-[#2563eb] active:scale-[0.95]"
              >
                <Volume2 className="h-4 w-4" />
                <span>{isSpeaking ? '朗讀中...' : '播放題目語音'}</span>
              </button>
              <span className="hidden text-xs text-[#8b98b1] sm:inline">
                Space 重播
              </span>
            </div>

            {/* Playback Speed Toggle (0.9x / 1.0x / 1.15x) */}
            <div className="flex items-center gap-1 rounded-lg border border-[#263044] bg-[#111622] p-0.5">
              {([0.9, 1.0, 1.15] as PlaybackRate[]).map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setPlaybackRate(rate)}
                  className={`rounded-md px-2 py-1 font-mono text-[11px] font-medium transition-colors ${
                    playbackRate === rate
                      ? 'bg-[#3b82f6] text-white'
                      : 'text-[#8b98b1] hover:text-white'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Question Prompt */}
        <h3 className="text-base font-medium leading-relaxed text-white sm:text-lg">
          {currentQuestion.prompt}
        </h3>

        {/* Hint Trigger (+2 XP instead of +5 XP) */}
        {!isAnswered && (
          <div className="mt-3">
            {!usedHint ? (
              <button
                type="button"
                onClick={() => setUsedHint(true)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#fbbf24] hover:text-[#fcd34d]"
              >
                <Lightbulb className="h-3.5 w-3.5" />
                <span>需要提示？（提示後答對 +2 XP）</span>
              </button>
            ) : (
              <div className="rounded-xl border border-[#f59e0b]/35 bg-[#f59e0b]/10 px-3.5 py-2.5 text-xs text-[#fde68a]">
                <span className="font-semibold">解題提示：</span>
                {currentQuestion.hint}
              </div>
            )}
          </div>
        )}

        {/* 1-4 Ergonomic Options */}
        <div className="mt-5 space-y-2.5">
          {currentQuestion.options?.map((opt, idx) => {
            const isSelected = selectedIndex === idx;
            const isCorrectOpt = idx === currentQuestion.correctIndex;

            let optionClass =
              'border-[#232c3f] bg-[#0e131d] text-[#e6edf7] hover:border-[#3b82f6]/60 hover:bg-[#151c2c]';
            if (isAnswered) {
              if (isCorrectOpt) {
                optionClass = 'border-[#10b981] bg-[#10b981]/12 text-white';
              } else if (isSelected && !isCorrectOpt) {
                optionClass = 'border-[#f43f5e] bg-[#f43f5e]/12 text-[#fecdd3]';
              } else {
                optionClass = 'border-[#1b2232] bg-[#0d111a] text-[#64748b] opacity-70';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] ${optionClass}`}
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

        {/* Footer Utility: Question Issue Report */}
        <div className="mt-4 flex items-center justify-between border-t border-[#1e2636]/70 pt-3 text-xs">
          <span className="text-[#64748b]">
            考點：{currentQuestion.weaknessTag}
          </span>
          <button
            type="button"
            disabled={isReported}
            onClick={() => {
              setReportedIds((prev) => [...prev, currentQuestion.id]);
              onReportIssue?.(currentQuestion.id);
            }}
            className={`inline-flex items-center gap-1 transition-colors ${
              isReported
                ? 'text-[#10b981]'
                : 'text-[#8b98b1] hover:text-[#f59e0b]'
            }`}
          >
            <Flag className="h-3.5 w-3.5" />
            <span>{isReported ? '已送出疑義回報' : '題目或答案有疑義？'}</span>
          </button>
        </div>

        {/* Post-Answer Explanation & Listening Transcript */}
        {isAnswered && (
          <div className="animate-modal-pop mt-5 border-t border-[#1e2636] pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span
                className={`font-semibold ${
                  selectedIndex === currentQuestion.correctIndex
                    ? 'text-[#10b981]'
                    : 'text-[#fb7185]'
                }`}
              >
                {selectedIndex === currentQuestion.correctIndex
                  ? usedHint
                    ? '提示後答對 · +2 XP'
                    : '獨立答對 · +5 XP'
                  : `答錯了（+1 XP 努力值）· 正確答案為選項 (${(currentQuestion.correctIndex ?? 0) + 1})`}
              </span>

              {currentQuestion.audioScript && (
                <button
                  type="button"
                  onClick={() => setShowTranscript((v) => !v)}
                  className="inline-flex items-center gap-1 font-medium text-[#60a5fa] hover:text-[#93c5fd]"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>{showTranscript ? '隱藏聽力逐字稿' : '顯示聽力逐字稿'}</span>
                </button>
              )}
            </div>

            {currentQuestion.audioScript && showTranscript && (
              <div className="mt-2.5 rounded-xl border border-[#222c40] bg-[#0e131d] px-3.5 py-2.5 font-mono text-xs leading-relaxed text-[#e2e8f0]">
                {currentQuestion.audioScript}
              </div>
            )}

            <p className="mt-2.5 text-sm leading-relaxed text-[#cbd5e1]">
              {currentQuestion.explanation}
            </p>

            <div className="mt-5 flex items-center justify-between gap-4">
              <span className="hidden items-center gap-1.5 text-xs text-[#64748b] sm:inline-flex">
                <ShieldAlert className="h-3.5 w-3.5" />
                按 Enter 進入下一題
              </span>
              <button
                type="button"
                onClick={handleNext}
                className="ml-auto inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#3b82f6] px-6 py-3 text-sm font-semibold text-white transition-all duration-150 hover:bg-[#2563eb] active:scale-[0.95] sm:w-auto"
              >
                <span>{isLast ? '完成關卡並領取補給箱' : '下一題'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
