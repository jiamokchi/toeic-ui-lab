import {
  Check,
  CheckCircle2,
  Flag,
  RotateCw,
  Volume2,
  XCircle,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PlaybackRate, VocabCard, VocabQuizMode } from '../types/toeic';
import { playFeedbackTone, speakEnglish } from '../utils/soundAndSpeech';

export interface VocabLabProps {
  cards: VocabCard[];
  answeredTodayIds: string[];
  muted: boolean;
  onToggleMastered: (id: string, mastered: boolean) => void;
  onEarnXp: (xp: number, itemId: string) => void;
  onReportIssue?: (itemId: string) => void;
}

const MODES: { id: VocabQuizMode; label: string }[] = [
  { id: 'flashcard', label: '單字字卡' },
  { id: 'cloze', label: '例句克漏字' },
  { id: 'en-to-zh', label: '英選中' },
  { id: 'zh-to-en', label: '中選英' },
  { id: 'audio-choice', label: '聽音選字' },
  { id: 'spelling', label: '聽音拼字' },
];

export function VocabLab({
  cards,
  answeredTodayIds,
  muted,
  onToggleMastered,
  onEarnXp,
  onReportIssue,
}: VocabLabProps) {
  const [mode, setMode] = useState<VocabQuizMode>('flashcard');
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<PlaybackRate>(1.0);
  const [reportedIds, setReportedIds] = useState<string[]>([]);

  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [spellingInput, setSpellingInput] = useState('');
  const [spellingState, setSpellingState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [vocabCombo, setVocabCombo] = useState(0);

  const currentCard = cards[cardIndex % cards.length];
  const masteredCount = cards.filter((c) => c.mastered).length;
  const quizItemKey = `${mode}-${currentCard.id}`;
  const alreadyAwardedToday = answeredTodayIds.includes(quizItemKey);

  // Build deterministic 4 options for quiz modes
  const quizOptions = useMemo(() => {
    const shift = cardIndex % 4;
    if (mode === 'en-to-zh') {
      const pool = [currentCard.meaning, ...currentCard.zhDistractors.slice(0, 3)];
      return [...pool.slice(shift), ...pool.slice(0, shift)];
    }
    const pool = [currentCard.word, ...currentCard.enDistractors.slice(0, 3)];
    return [...pool.slice(shift), ...pool.slice(0, shift)];
  }, [cardIndex, currentCard, mode]);

  const correctOptIndex = useMemo(() => {
    const target = mode === 'en-to-zh' ? currentCard.meaning : currentCard.word;
    return quizOptions.indexOf(target);
  }, [currentCard, mode, quizOptions]);

  const handlePlayWord = useCallback(
    (text: string) => {
      speakEnglish(text, playbackRate);
    },
    [playbackRate]
  );

  const handleNextCard = useCallback(() => {
    setFlipped(false);
    setSelectedOpt(null);
    setSpellingInput('');
    setSpellingState('idle');
    setCardIndex((prev) => (prev + 1) % cards.length);
  }, [cards.length]);

  const handleQuizSelect = useCallback(
    (idx: number) => {
      if (selectedOpt !== null || idx < 0 || idx >= quizOptions.length) return;
      setSelectedOpt(idx);
      const ok = idx === correctOptIndex;
      if (ok) {
        const nextC = vocabCombo + 1;
        setVocabCombo(nextC);
        playFeedbackTone(nextC >= 3 ? 'combo' : 'correct', muted);
        if (!alreadyAwardedToday) {
          onEarnXp(5, quizItemKey); // 題目獨立答對 +5 XP
        }
      } else {
        setVocabCombo(0);
        playFeedbackTone('wrong', muted);
        if (!alreadyAwardedToday) {
          onEarnXp(1, quizItemKey); // 答錯努力 +1 XP
        }
      }
    },
    [
      alreadyAwardedToday,
      correctOptIndex,
      muted,
      onEarnXp,
      quizItemKey,
      quizOptions.length,
      selectedOpt,
      vocabCombo,
    ]
  );

  const handleSpellingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (spellingState !== 'idle') {
      handleNextCard();
      return;
    }
    const normalized = spellingInput.trim().toLowerCase();
    if (!normalized) return;

    if (normalized === currentCard.word.toLowerCase()) {
      setSpellingState('correct');
      const nextC = vocabCombo + 1;
      setVocabCombo(nextC);
      playFeedbackTone(nextC >= 3 ? 'combo' : 'correct', muted);
      if (!alreadyAwardedToday) onEarnXp(5, quizItemKey);
    } else {
      setSpellingState('wrong');
      setVocabCombo(0);
      playFeedbackTone('wrong', muted);
      if (!alreadyAwardedToday) onEarnXp(1, quizItemKey);
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (mode === 'flashcard') {
        if (e.key === ' ') {
          e.preventDefault();
          setFlipped((f) => !f);
        } else if (e.key === '1') {
          e.preventDefault();
          onToggleMastered(currentCard.id, true);
          if (!answeredTodayIds.includes(`flash-${currentCard.id}`)) {
            onEarnXp(2, `flash-${currentCard.id}`); // 單字熟記 +2 XP
          }
          handleNextCard();
        } else if (e.key === '2') {
          e.preventDefault();
          onToggleMastered(currentCard.id, false);
          if (!answeredTodayIds.includes(`flash-${currentCard.id}`)) {
            onEarnXp(1, `flash-${currentCard.id}`); // 模糊/不熟 +1 XP
          }
          handleNextCard();
        }
      } else if (mode !== 'spelling') {
        if (['1', '2', '3', '4'].includes(e.key)) {
          e.preventDefault();
          handleQuizSelect(Number(e.key) - 1);
        } else if (e.key === 'Enter' && selectedOpt !== null) {
          e.preventDefault();
          handleNextCard();
        } else if (e.key === ' ') {
          e.preventDefault();
          handlePlayWord(currentCard.word);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    answeredTodayIds,
    currentCard,
    handleNextCard,
    handlePlayWord,
    handleQuizSelect,
    mode,
    onEarnXp,
    onToggleMastered,
    selectedOpt,
  ]);

  const isReported = reportedIds.includes(currentCard.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20 md:pb-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-[#8b98b1]">
              商務字彙系統 · 已熟記 {masteredCount} / {cards.length} 字 · 熟記 +2 / 模糊 +1 XP
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-white">
              單字測驗室
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {vocabCombo >= 2 && (
              <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[#fbbf24] tabular-nums">
                <Zap className="h-3.5 w-3.5" />
                連擊 ×{vocabCombo}
              </span>
            )}
            {/* Speed Switcher 0.9x / 1.0x / 1.15x */}
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
        </div>

        {/* 6 Modes: Flashcard + 5 Quizzes */}
        <div
          role="tablist"
          aria-label="單字測驗模式"
          className="grid grid-cols-3 gap-1.5 rounded-xl border border-[#1e2636] bg-[#111622] p-1 sm:grid-cols-6"
        >
          {MODES.map((m) => (
            <button
              key={m.id}
              role="tab"
              type="button"
              aria-selected={mode === m.id}
              onClick={() => {
                setMode(m.id);
                setSelectedOpt(null);
                setSpellingState('idle');
                setSpellingInput('');
              }}
              className={`min-h-[38px] whitespace-nowrap rounded-lg px-2 py-1.5 text-xs font-medium transition-all active:scale-[0.97] ${
                mode === m.id
                  ? 'bg-[#3b82f6] text-white'
                  : 'text-[#8b98b1] hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mode 1: Flashcard */}
      {mode === 'flashcard' && (
        <div className="rounded-2xl border border-[#1e2636] bg-[#111622] p-5 sm:p-8">
          <div className="flex items-center justify-between text-xs text-[#8b98b1]">
            <span>
              TOEIC {currentCard.level} 核心字 · {currentCard.partOfSpeech}
            </span>
            <span className="font-mono tabular-nums">
              {cardIndex + 1} / {cards.length}
            </span>
          </div>

          <div
            onClick={() => setFlipped((f) => !f)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setFlipped((f) => !f);
            }}
            className="perspective-1000 mt-6 cursor-pointer"
          >
            <div
              className={`transform-style-3d relative min-h-[240px] w-full transition-transform duration-500 ${
                flipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* Front Face */}
              <div className="backface-hidden absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-[#222b3e] bg-[#0e131d] p-6 text-center transition-colors hover:border-[#3b82f6]/50">
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    {currentCard.word}
                  </h2>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayWord(currentCard.word);
                    }}
                    aria-label="播放單字發音"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#263044] bg-[#171d2c] text-[#60a5fa] hover:bg-[#1f283d] active:scale-95"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 font-mono text-xs text-[#8b98b1]">
                  {currentCard.phonetic}
                </p>
                <p className="mt-7 inline-flex items-center gap-1.5 text-xs text-[#64748b]">
                  <RotateCw className="h-3.5 w-3.5" />
                  點擊卡片或按 Space 3D 翻面查看釋義
                </p>
              </div>

              {/* Back Face */}
              <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-[#3b82f6]/45 bg-[#121827] p-6 text-center">
                <span className="font-mono text-xs text-[#60a5fa]">
                  {currentCard.word} · {currentCard.partOfSpeech}
                </span>
                <p className="mt-2 text-xl font-bold text-[#10b981]">
                  {currentCard.meaning}
                </p>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#e6edf7]">
                  {currentCard.exampleEn}
                </p>
                <p className="mt-1.5 text-xs text-[#8b98b1]">
                  {currentCard.exampleZh}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                onToggleMastered(currentCard.id, true);
                if (!answeredTodayIds.includes(`flash-${currentCard.id}`)) {
                  onEarnXp(2, `flash-${currentCard.id}`);
                }
                handleNextCard();
              }}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[#10b981]/40 bg-[#10b981]/10 px-4 py-3 text-sm font-semibold text-[#34d399] transition-all hover:bg-[#10b981]/20 active:scale-[0.96]"
            >
              <kbd className="hidden rounded border border-[#10b981]/40 px-1.5 py-0.5 font-mono text-[11px] sm:inline">
                1
              </kbd>
              <Check className="h-4 w-4" />
              <span>熟記 (+2 XP)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onToggleMastered(currentCard.id, false);
                if (!answeredTodayIds.includes(`flash-${currentCard.id}`)) {
                  onEarnXp(1, `flash-${currentCard.id}`);
                }
                handleNextCard();
              }}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[#263044] bg-[#171d2c] px-4 py-3 text-sm font-semibold text-[#e6edf7] transition-all hover:border-[#3b82f6]/60 active:scale-[0.96]"
            >
              <kbd className="hidden rounded border border-[#2c3850] px-1.5 py-0.5 font-mono text-[11px] text-[#8b98b1] sm:inline">
                2
              </kbd>
              <span>模糊 / 不熟 (+1 XP)</span>
            </button>
          </div>
        </div>
      )}

      {/* Modes 2-5: Cloze / En->Zh / Zh->En / Audio-Choice */}
      {mode !== 'flashcard' && mode !== 'spelling' && (
        <div className="rounded-2xl border border-[#1e2636] bg-[#111622] p-5 sm:p-8">
          <div className="flex items-center justify-between text-xs text-[#8b98b1]">
            <span>
              {MODES.find((m) => m.id === mode)?.label} · 1–4 選答 / Space 播音
              {alreadyAwardedToday ? ' · 今日已作答 (+0 XP)' : ''}
            </span>
            <span className="font-mono tabular-nums">
              {(cardIndex % cards.length) + 1} / {cards.length}
            </span>
          </div>

          {mode === 'audio-choice' && (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-[#222c40] bg-[#0e131d] px-4 py-3">
              <button
                type="button"
                onClick={() => handlePlayWord(currentCard.word)}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2563eb] active:scale-[0.95]"
              >
                <Volume2 className="h-4 w-4" />
                <span>播放單字發音 ({playbackRate}x)</span>
              </button>
              <span className="text-xs text-[#8b98b1]">Space 重播</span>
            </div>
          )}

          <div className="mt-5">
            {mode === 'cloze' && (
              <>
                <p className="text-xs text-[#8b98b1]">中文提示：{currentCard.meaning}</p>
                <h3 className="mt-2 text-base font-medium leading-relaxed text-white sm:text-lg">
                  {currentCard.exampleCloze}
                </h3>
              </>
            )}
            {mode === 'en-to-zh' && (
              <div className="flex items-center gap-3">
                <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">
                  {currentCard.word}
                </h3>
                <button
                  type="button"
                  onClick={() => handlePlayWord(currentCard.word)}
                  aria-label="播放發音"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#263044] bg-[#0e131d] text-[#60a5fa] hover:text-white"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>
            )}
            {mode === 'zh-to-en' && (
              <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
                {currentCard.meaning}（{currentCard.partOfSpeech}）
              </h3>
            )}
            {mode === 'audio-choice' && (
              <h3 className="text-base font-medium text-white">
                請聆聽語音，選出聽到的正確英文單字：
              </h3>
            )}
          </div>

          <div className="mt-5 space-y-2.5">
            {quizOptions.map((opt, idx) => {
              const answered = selectedOpt !== null;
              const isCorrect = idx === correctOptIndex;
              const isChosen = idx === selectedOpt;

              let cls =
                'border-[#232c3f] bg-[#0e131d] text-[#e6edf7] hover:border-[#3b82f6]/60';
              if (answered) {
                if (isCorrect) cls = 'border-[#10b981] bg-[#10b981]/12 text-white';
                else if (isChosen) cls = 'border-[#f43f5e] bg-[#f43f5e]/12 text-[#fecdd3]';
                else cls = 'border-[#1b2232] bg-[#0d111a] text-[#64748b] opacity-70';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={answered}
                  onClick={() => handleQuizSelect(idx)}
                  className={`flex min-h-[50px] w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-150 active:scale-[0.97] ${cls}`}
                >
                  <div className="flex items-center gap-3">
                    <kbd className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#263044] bg-[#141a28] font-mono text-xs text-[#94a3b8]">
                      {idx + 1}
                    </kbd>
                    <span>{opt}</span>
                  </div>
                  {answered && isCorrect && (
                    <CheckCircle2 className="h-4 w-4 text-[#10b981]" />
                  )}
                  {answered && isChosen && !isCorrect && (
                    <XCircle className="h-4 w-4 text-[#f43f5e]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Issue Report Footer */}
          <div className="mt-4 flex items-center justify-between border-t border-[#1e2636]/70 pt-3 text-xs">
            <span className="text-[#64748b]">例句：{currentCard.exampleZh}</span>
            <button
              type="button"
              disabled={isReported}
              onClick={() => {
                setReportedIds((prev) => [...prev, currentCard.id]);
                onReportIssue?.(currentCard.id);
              }}
              className={`inline-flex items-center gap-1 ${
                isReported ? 'text-[#10b981]' : 'text-[#8b98b1] hover:text-[#f59e0b]'
              }`}
            >
              <Flag className="h-3.5 w-3.5" />
              <span>{isReported ? '已送出回報' : '題目或答案有疑義？'}</span>
            </button>
          </div>

          {selectedOpt !== null && (
            <div className="animate-modal-pop mt-4 border-t border-[#1e2636] pt-4">
              <p className="text-sm text-[#cbd5e1]">
                <span className="font-mono font-semibold text-white">{currentCard.word}</span>{' '}
                {currentCard.phonetic} — {currentCard.exampleEn}
              </p>
              <button
                type="button"
                onClick={handleNextCard}
                className="mt-4 min-h-[46px] w-full rounded-xl bg-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2563eb] active:scale-[0.96] sm:w-auto"
              >
                下一題 (Enter)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mode 6: Audio Spelling */}
      {mode === 'spelling' && (
        <div className="rounded-2xl border border-[#1e2636] bg-[#111622] p-5 sm:p-8">
          <div className="flex items-center justify-between text-xs text-[#8b98b1]">
            <span>聽音拼字特訓 · TOEIC {currentCard.level}</span>
            <span className="font-mono tabular-nums">
              {cardIndex + 1} / {cards.length}
            </span>
          </div>

          <div className="mt-5 flex flex-col items-start gap-4 rounded-xl border border-[#222c40] bg-[#0e131d] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-[#8b98b1]">中文提示 ({currentCard.partOfSpeech})</p>
              <p className="mt-1 text-lg font-semibold text-white">
                {currentCard.meaning}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handlePlayWord(currentCard.word)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#3b82f6] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#2563eb] active:scale-[0.95]"
            >
              <Volume2 className="h-4 w-4" />
              <span>播放單字發音 ({playbackRate}x)</span>
            </button>
          </div>

          <form onSubmit={handleSpellingSubmit} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="spelling-input"
                className="block text-xs font-medium text-[#8b98b1]"
              >
                輸入聽到的英文單字（字首提示：{currentCard.word[0]}___ · 共 {currentCard.word.length} 字母）
              </label>
              <input
                id="spelling-input"
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={spellingInput}
                onChange={(e) => setSpellingInput(e.target.value)}
                disabled={spellingState !== 'idle'}
                placeholder="輸入英文單字後按 Enter..."
                className="mt-2 h-12 w-full rounded-xl border border-[#263044] bg-[#0b0e14] px-4 font-mono text-base text-white placeholder-[#475569] focus:border-[#3b82f6] focus:outline-none"
              />
            </div>

            {spellingState !== 'idle' && (
              <div className="text-sm">
                {spellingState === 'correct' ? (
                  <p className="font-semibold text-[#10b981]">
                    拼寫完全正確：{currentCard.word} ({alreadyAwardedToday ? '+0 XP' : '+5 XP'})
                  </p>
                ) : (
                  <p className="font-semibold text-[#fb7185]">
                    正確拼寫為：<span className="font-mono text-white">{currentCard.word}</span> ({alreadyAwardedToday ? '+0 XP' : '+1 XP'})
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              className="min-h-[48px] w-full rounded-xl bg-[#3b82f6] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2563eb] active:scale-[0.96] sm:w-auto"
            >
              {spellingState === 'idle' ? '送出驗證 (Enter)' : '繼續下一個單字'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
