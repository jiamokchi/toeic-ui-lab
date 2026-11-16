import { AnimatePresence, motion } from 'motion/react';
import {
  Check,
  CheckCircle2,
  RotateCw,
  Volume2,
  XCircle,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { QUESTION_BANK } from '../data/toeicData';
import { VocabCard } from '../types/toeic';
import { playFeedbackTone, speakEnglish } from '../utils/soundAndSpeech';

type VocabMode = 'flashcard' | 'cloze' | 'audio-choice' | 'spelling';

interface VocabLabProps {
  cards: VocabCard[];
  muted: boolean;
  onToggleMastered: (id: string) => void;
  onEarnXp: (xp: number) => void;
}

export function VocabLab({
  cards,
  muted,
  onToggleMastered,
  onEarnXp,
}: VocabLabProps) {
  const [mode, setMode] = useState<VocabMode>('flashcard');
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Quiz states for Cloze / Audio-Choice / Spelling
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [spellingInput, setSpellingInput] = useState('');
  const [spellingState, setSpellingState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [vocabCombo, setVocabCombo] = useState(0);

  const currentCard = cards[cardIndex % cards.length];
  const masteredCount = cards.filter((c) => c.mastered).length;

  const clozeQuestions = useMemo(
    () => QUESTION_BANK.filter((q) => q.category === 'vocab' && q.format === 'cloze'),
    []
  );
  const audioQuestions = useMemo(
    () =>
      QUESTION_BANK.filter(
        (q) => q.category === 'vocab' && q.format === 'listening-choice'
      ),
    []
  );

  const activeQuizList = mode === 'cloze' ? clozeQuestions : audioQuestions;
  const activeQuizQ = activeQuizList[quizIndex % activeQuizList.length];

  const handlePlayWord = useCallback((text: string) => {
    speakEnglish(text, 0.9);
  }, []);

  const handleNextCard = useCallback(() => {
    setFlipped(false);
    setCardIndex((prev) => (prev + 1) % cards.length);
  }, [cards.length]);

  const handleQuizSelect = useCallback(
    (idx: number) => {
      if (selectedOpt !== null || !activeQuizQ?.options) return;
      if (idx < 0 || idx >= activeQuizQ.options.length) return;
      setSelectedOpt(idx);
      const ok = idx === activeQuizQ.correctIndex;
      if (ok) {
        const nextC = vocabCombo + 1;
        setVocabCombo(nextC);
        playFeedbackTone(nextC >= 3 ? 'combo' : 'correct', muted);
        onEarnXp(nextC >= 2 ? 15 : 10);
      } else {
        setVocabCombo(0);
        playFeedbackTone('wrong', muted);
      }
    },
    [activeQuizQ, muted, onEarnXp, selectedOpt, vocabCombo]
  );

  const handleNextQuiz = useCallback(() => {
    setSelectedOpt(null);
    setQuizIndex((i) => i + 1);
  }, []);

  const handleSpellingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (spellingState !== 'idle') {
      setSpellingInput('');
      setSpellingState('idle');
      setCardIndex((prev) => (prev + 1) % cards.length);
      return;
    }
    const normalized = spellingInput.trim().toLowerCase();
    if (!normalized) return;

    if (normalized === currentCard.word.toLowerCase()) {
      setSpellingState('correct');
      const nextC = vocabCombo + 1;
      setVocabCombo(nextC);
      playFeedbackTone(nextC >= 3 ? 'combo' : 'correct', muted);
      onEarnXp(20);
    } else {
      setSpellingState('wrong');
      setVocabCombo(0);
      playFeedbackTone('wrong', muted);
    }
  };

  // Keyboard shortcuts for Flashcard & 1-4 Quiz
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
          if (!currentCard.mastered) onToggleMastered(currentCard.id);
          onEarnXp(5);
          handleNextCard();
        } else if (e.key === '2') {
          e.preventDefault();
          handleNextCard();
        } else if (e.key.toLowerCase() === 'r') {
          e.preventDefault();
          handlePlayWord(currentCard.word);
        }
      } else if (mode === 'cloze' || mode === 'audio-choice') {
        if (['1', '2', '3', '4'].includes(e.key)) {
          e.preventDefault();
          handleQuizSelect(Number(e.key) - 1);
        } else if ((e.key === 'Enter' || e.key === ' ') && selectedOpt !== null) {
          e.preventDefault();
          handleNextQuiz();
        } else if (e.key.toLowerCase() === 'r' && activeQuizQ?.audioScript) {
          e.preventDefault();
          handlePlayWord(activeQuizQ.audioScript);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    activeQuizQ,
    currentCard,
    handleNextCard,
    handleNextQuiz,
    handlePlayWord,
    handleQuizSelect,
    mode,
    onEarnXp,
    onToggleMastered,
    selectedOpt,
  ]);

  const MODES: { id: VocabMode; label: string }[] = [
    { id: 'flashcard', label: '字卡記憶' },
    { id: 'cloze', label: '克漏字' },
    { id: 'audio-choice', label: '聽音選字' },
    { id: 'spelling', label: '聽音拼字' },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20 md:pb-6">
      {/* Header & Mode Segmented Switch */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium text-[#8b98b1]">
            800 分高頻商務字庫 · 已熟記 {masteredCount} / {cards.length} 字
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-white">
            單字背誦與測驗室
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {vocabCombo >= 2 && (
            <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[#f59e0b] tabular-nums">
              <Zap className="h-3.5 w-3.5" />
              COMBO ×{vocabCombo}
            </span>
          )}
          <div
            role="tablist"
            aria-label="單字訓練模式"
            className="grid grid-cols-4 gap-1 rounded-xl border border-[#1e2636] bg-[#111622] p-1"
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
                className={`min-h-[36px] whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 ${
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
            className="mt-6 flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border border-[#222b3e] bg-[#0e131d] p-6 text-center transition-colors hover:border-[#3b82f6]/40"
          >
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

            <AnimatePresence mode="wait">
              {flipped ? (
                <motion.div
                  key="back"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.16 }}
                  className="mt-6 max-w-lg border-t border-[#1e2636] pt-5"
                >
                  <p className="text-lg font-semibold text-[#10b981]">
                    {currentCard.meaning}
                  </p>
                  <p className="mt-2.5 text-sm text-[#e6edf7]">
                    {currentCard.exampleEn}
                  </p>
                  <p className="mt-1 text-xs text-[#8b98b1]">
                    {currentCard.exampleZh}
                  </p>
                </motion.div>
              ) : (
                <motion.p
                  key="front-hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8 inline-flex items-center gap-1.5 text-xs text-[#64748b]"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  點擊卡片或按 Space 查看釋義與例句
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* One-handed + Keyboard Actions */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                if (!currentCard.mastered) onToggleMastered(currentCard.id);
                onEarnXp(5);
                handleNextCard();
              }}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[#10b981]/40 bg-[#10b981]/10 px-4 py-3 text-sm font-semibold text-[#34d399] transition-all hover:bg-[#10b981]/20 active:scale-[0.98]"
            >
              <kbd className="hidden rounded border border-[#10b981]/40 px-1.5 py-0.5 font-mono text-[11px] sm:inline">
                1
              </kbd>
              <Check className="h-4 w-4" />
              <span>已掌握 (+5 XP)</span>
            </button>

            <button
              type="button"
              onClick={handleNextCard}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[#263044] bg-[#171d2c] px-4 py-3 text-sm font-semibold text-[#e6edf7] transition-all hover:border-[#3b82f6]/60 active:scale-[0.98]"
            >
              <kbd className="hidden rounded border border-[#2c3850] px-1.5 py-0.5 font-mono text-[11px] text-[#8b98b1] sm:inline">
                2
              </kbd>
              <span>需再複習 · 下一張</span>
            </button>
          </div>
        </div>
      )}

      {/* Mode 2 & 3: Cloze & Audio-Choice with 1-4 Hotkeys */}
      {(mode === 'cloze' || mode === 'audio-choice') && activeQuizQ && (
        <div className="rounded-2xl border border-[#1e2636] bg-[#111622] p-5 sm:p-8">
          <div className="flex items-center justify-between text-xs text-[#8b98b1]">
            <span>{activeQuizQ.partLabel} · 支援 1–4 快捷鍵</span>
            <span className="font-mono tabular-nums">
              第 {(quizIndex % activeQuizList.length) + 1} / {activeQuizList.length} 題
            </span>
          </div>

          {activeQuizQ.audioScript && (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-[#222c40] bg-[#0e131d] px-4 py-3">
              <button
                type="button"
                onClick={() => handlePlayWord(activeQuizQ.audioScript!)}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2563eb] active:scale-[0.97]"
              >
                <Volume2 className="h-4 w-4" />
                <span>播放單字例句</span>
              </button>
              <span className="text-xs text-[#8b98b1]">快捷鍵 [R]</span>
            </div>
          )}

          <h3 className="mt-5 text-base font-medium leading-relaxed text-white sm:text-lg">
            {activeQuizQ.prompt}
          </h3>

          <div className="mt-5 space-y-2.5">
            {activeQuizQ.options?.map((opt, idx) => {
              const answered = selectedOpt !== null;
              const isCorrect = idx === activeQuizQ.correctIndex;
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
                  className={`flex min-h-[50px] w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all active:scale-[0.99] ${cls}`}
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

          {selectedOpt !== null && (
            <div className="mt-5 border-t border-[#1e2636] pt-4">
              <p className="text-sm text-[#cbd5e1]">{activeQuizQ.explanation}</p>
              <button
                type="button"
                onClick={handleNextQuiz}
                className="mt-4 min-h-[46px] w-full rounded-xl bg-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2563eb] sm:w-auto"
              >
                下一題 (Enter)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mode 4: Audio Spelling */}
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
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#3b82f6] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#2563eb] active:scale-[0.97]"
            >
              <Volume2 className="h-4 w-4" />
              <span>播放單字發音</span>
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
                    拼寫完全正確：{currentCard.word} (+20 XP)
                  </p>
                ) : (
                  <p className="font-semibold text-[#fb7185]">
                    正確拼寫為：<span className="font-mono text-white">{currentCard.word}</span>
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              className="min-h-[48px] w-full rounded-xl bg-[#3b82f6] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2563eb] active:scale-[0.98] sm:w-auto"
            >
              {spellingState === 'idle' ? '送出驗證 (Enter)' : '繼續下一個單字'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
