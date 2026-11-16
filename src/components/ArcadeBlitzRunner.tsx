import { ArrowLeft, Flame, Heart, Trophy, Zap } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArcadeResult, VocabCard } from '../types/toeic';
import { playFeedbackTone } from '../utils/soundAndSpeech';

export interface ArcadeBlitzRunnerProps {
  cards: VocabCard[];
  bestScore: number;
  muted: boolean;
  onExit: () => void;
  onFinish: (result: ArcadeResult) => void;
}

export function ArcadeBlitzRunner({
  cards,
  bestScore,
  muted,
  onExit,
  onFinish,
}: ArcadeBlitzRunnerProps) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [lives, setLives] = useState(3);
  const [index, setIndex] = useState(0);
  const [combo, setCombo] = useState(0);
  const [peakCombo, setPeakCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [flashTone, setFlashTone] = useState<'none' | 'hit' | 'miss'>('none');
  const [finished, setFinished] = useState(false);

  const currentCard = cards[index % cards.length];

  const options = useMemo(() => {
    const raw = [currentCard.meaning, ...currentCard.zhDistractors.slice(0, 3)];
    // Deterministic rotation by index so it's stable per render
    const shift = index % 4;
    return [...raw.slice(shift), ...raw.slice(0, shift)];
  }, [currentCard, index]);

  const correctOptIdx = options.indexOf(currentCard.meaning);

  const finalizeGame = useCallback(
    (finalScore: number, finalAnswered: number, finalCorrect: number, finalPeak: number) => {
      setFinished(true);
      playFeedbackTone('complete', muted);
      onFinish({
        totalAnswered: finalAnswered,
        correctCount: finalCorrect,
        peakCombo: finalPeak,
        score: finalScore,
        isNewBest: finalScore > bestScore,
      });
    },
    [bestScore, muted, onFinish]
  );

  useEffect(() => {
    if (finished) return;
    if (timeLeft <= 0 || lives <= 0) {
      finalizeGame(score, answered, correct, peakCombo);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [answered, correct, finalizeGame, finished, lives, peakCombo, score, timeLeft]);

  const handlePick = useCallback(
    (optIdx: number) => {
      if (finished || optIdx < 0 || optIdx >= options.length) return;
      const nextAnswered = answered + 1;
      setAnswered(nextAnswered);

      if (optIdx === correctOptIdx) {
        const nextCombo = combo + 1;
        const nextPeak = Math.max(peakCombo, nextCombo);
        const points = 100 + nextCombo * 25;
        setCombo(nextCombo);
        setPeakCombo(nextPeak);
        setCorrect((c) => c + 1);
        setScore((s) => s + points);
        setTimeLeft((t) => Math.min(90, t + 2)); // +2s reward
        setFlashTone('hit');
        playFeedbackTone(nextCombo >= 3 ? 'combo' : 'correct', muted);
      } else {
        const nextLives = lives - 1;
        setCombo(0);
        setLives(nextLives);
        setFlashTone('miss');
        playFeedbackTone('wrong', muted);
        if (nextLives <= 0) {
          finalizeGame(score, nextAnswered, correct, peakCombo);
          return;
        }
      }

      setTimeout(() => setFlashTone('none'), 220);
      setIndex((i) => i + 1);
    },
    [
      answered,
      combo,
      correct,
      correctOptIdx,
      finalizeGame,
      finished,
      lives,
      muted,
      options.length,
      peakCombo,
      score,
    ]
  );

  const pickRef = useRef(handlePick);
  pickRef.current = handlePick;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        pickRef.current(Number(e.key) - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  if (finished) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-[#263044] bg-[#111622] p-6 text-center animate-modal-pop">
        <Trophy className="mx-auto h-10 w-10 text-[#f59e0b]" />
        <p className="mt-3 text-xs font-medium text-[#60a5fa]">
          60 秒單字快打生存戰 · 結束結算
        </p>
        <h2 className="mt-1 font-display text-3xl font-bold text-white tabular-nums">
          {score.toLocaleString()} 分
        </h2>
        <p className="mt-1 text-xs text-[#8b98b1]">
          {score > bestScore ? '突破個人最高紀錄！' : `個人紀錄：${bestScore.toLocaleString()} 分`}
        </p>

        <div className="mt-6 grid grid-cols-3 divide-x divide-[#1e2636] border-y border-[#1e2636] py-3.5">
          <div>
            <div className="text-[11px] text-[#8b98b1]">答對題數</div>
            <div className="mt-1 font-mono text-lg font-bold text-[#10b981] tabular-nums">
              {correct} / {answered}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[#8b98b1]">最高連擊</div>
            <div className="mt-1 font-mono text-lg font-bold text-[#f59e0b] tabular-nums">
              {peakCombo}×
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[#8b98b1]">節奏獎勵</div>
            <div className="mt-1 font-mono text-lg font-bold text-[#60a5fa] tabular-nums">
              +{Math.min(10, Math.floor(correct / 2))} XP
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onExit}
          className="mt-6 min-h-[46px] w-full rounded-xl bg-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2563eb] active:scale-[0.96]"
        >
          返回每日實戰中心
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl pb-20 md:pb-6">
      <div className="flex items-center justify-between pb-3">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#263044] bg-[#111622] px-3 py-1.5 text-xs font-medium text-[#cbd5e1] hover:text-white active:scale-[0.95]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>結束快打</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <Heart
                key={i}
                className={`h-4 w-4 ${
                  i < lives ? 'fill-[#f43f5e] text-[#fb7185]' : 'text-[#2a344a]'
                }`}
              />
            ))}
          </div>
          <span
            className={`font-mono text-lg font-bold tabular-nums ${
              timeLeft <= 10 ? 'text-[#f43f5e]' : 'text-[#fbbf24]'
            }`}
          >
            {timeLeft}s
          </span>
        </div>
      </div>

      <div
        className={`rounded-2xl border bg-[#111622] p-6 transition-colors duration-150 ${
          flashTone === 'hit'
            ? 'border-[#10b981]'
            : flashTone === 'miss'
              ? 'border-[#f43f5e]'
              : combo >= 3
                ? 'animate-fever-glow border-[#f59e0b]/60'
                : 'border-[#1e2636]'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-[#8b98b1]">
          <span className="inline-flex items-center gap-1 text-[#fbbf24]">
            <Flame className="h-3.5 w-3.5" />
            60 秒街機快打（答對 +2s）
          </span>
          <span className="inline-flex items-center gap-2 font-mono text-white tabular-nums">
            <Zap className="h-3.5 w-3.5 text-[#60a5fa]" />
            {combo}× Combo · {score.toLocaleString()} 分
          </span>
        </div>

        <div className="my-7 text-center">
          <p className="font-mono text-xs text-[#64748b]">{currentCard.partOfSpeech} · {currentCard.phonetic}</p>
          <h2 className="mt-1 font-display text-3xl font-bold text-white sm:text-4xl">
            {currentCard.word}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {options.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePick(idx)}
              className="flex min-h-[54px] items-center gap-3 rounded-xl border border-[#232c3f] bg-[#0e131d] px-4 py-3 text-left text-sm text-[#e6edf7] transition-all duration-100 hover:border-[#3b82f6] hover:bg-[#151c2c] active:scale-[0.96]"
            >
              <kbd className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#263044] bg-[#141a28] font-mono text-xs text-[#94a3b8]">
                {idx + 1}
              </kbd>
              <span>{opt}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
