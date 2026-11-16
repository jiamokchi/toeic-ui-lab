import { Sparkles, Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { WeaknessItem } from '../types/toeic';
import { playFeedbackTone, speakEnglish } from '../utils/soundAndSpeech';

export interface ShibaCoachMascotProps {
  topWeakness: WeaknessItem;
  muted?: boolean;
}

const TOEIC_800_GRAMMAR_TIPS: { tag: string; tip: string; spokenPhrase: string }[] = [
  {
    tag: 'Part 5 分詞修飾',
    tip: '口訣：先找主詞看主動被動！名詞與修飾動作「主動用 V-ing、被動用 V-ed」，逗點前後主詞要一致喔！',
    spokenPhrase: 'Proposals reviewed by directors. Passive uses V-e-d.',
  },
  {
    tag: 'Part 5 讓步詞性',
    tip: '口訣：介系詞接名詞、連接詞接子句！看到 Despite / In spite of 後面絕不接完整句子，Although 才接 S+V。',
    spokenPhrase: 'Despite the rising cost, although the cost is rising.',
  },
  {
    tag: 'Part 5 假設倒裝',
    tip: '口訣：與過去事實相反省略 If 時，Had 往前搬！看到 Had + S + p.p.，後方主句必配 would have + p.p.。',
    spokenPhrase: 'Had we known earlier, we would have adjusted the plan.',
  },
  {
    tag: 'Part 5 詞性秒殺',
    tip: '口訣：冠詞 (a/the) 與介系詞中間夾名詞！看到「the + ___ + of」別猶豫，0.5 秒直接鎖定名詞選項。',
    spokenPhrase: 'The implementation of the policy.',
  },
  {
    tag: 'Part 2 聽力陷阱',
    tip: '口訣：Wh- 疑問詞開頭絕對不選 Yes / No！聽到重複原字選項先懷疑，同義替換或反問才是正解。',
    spokenPhrase: 'Never choose yes or no for a W-H question.',
  },
  {
    tag: 'Part 7 同義替換',
    tip: '口訣：800 分關鍵在 Paraphrase！題幹問 reimburse 就找原文 refund，問 cap fee 就找 limit increase。',
    spokenPhrase: 'Reimburse equals refund. Cap equals limit.',
  },
];

export function ShibaCoachMascot({
  topWeakness,
  muted = false,
}: ShibaCoachMascotProps) {
  const [isCheering, setIsCheering] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [jumpKey, setJumpKey] = useState(0);
  const [tipIndex, setTipIndex] = useState<number | null>(null);

  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      setIsBlinking(true);
      blinkTimeout = setTimeout(() => setIsBlinking(false), 150);
    }, 3600);
    return () => {
      clearInterval(interval);
      clearTimeout(blinkTimeout);
    };
  }, []);

  useEffect(() => {
    if (!isCheering) return;
    const t = setTimeout(() => setIsCheering(false), 2200);
    return () => clearTimeout(t);
  }, [isCheering, jumpKey]);

  const handleCoachClick = () => {
    setIsCheering(true);
    setJumpKey((k) => k + 1);
    playFeedbackTone('correct', muted);

    setTipIndex((prev) => {
      if (prev === null) {
        return Math.floor(Math.random() * TOEIC_800_GRAMMAR_TIPS.length);
      }
      let next = Math.floor(Math.random() * TOEIC_800_GRAMMAR_TIPS.length);
      if (next === prev && TOEIC_800_GRAMMAR_TIPS.length > 1) {
        next = (prev + 1) % TOEIC_800_GRAMMAR_TIPS.length;
      }
      return next;
    });
  };

  const activeMessage =
    tipIndex === null
      ? {
          tag: `弱項提醒 · ${topWeakness.part}`,
          tip: `目前「${topWeakness.area}」正確率 ${topWeakness.accuracy}%，先練 5 題抓回手感，我陪你穩紮穩打！`,
          spokenPhrase: 'Let us practice participle clauses together!',
        }
      : TOEIC_800_GRAMMAR_TIPS[tipIndex];

  const handleSpeakTip = () => {
    setIsCheering(true);
    setJumpKey((k) => k + 1);
    speakEnglish(activeMessage.spokenPhrase, 0.95);
  };

  return (
    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
      <button
        type="button"
        onClick={handleCoachClick}
        aria-label="點擊多益柴犬教練取得文法小口訣"
        className="group relative shrink-0 cursor-pointer rounded-2xl border border-[#222c40] bg-[#0e131d] p-2.5 transition-all duration-150 hover:border-[#3b82f6]/60 active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
      >
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-2 rounded-full transition-opacity duration-300 ${
            isCheering
              ? 'bg-[#f59e0b]/20 opacity-100 blur-md'
              : 'bg-[#3b82f6]/12 opacity-75 blur-md group-hover:opacity-100'
          }`}
        />

        <div
          key={jumpKey}
          className={`relative h-24 w-24 sm:h-28 sm:w-28 ${
            isCheering ? 'animate-shiba-jump' : 'animate-shiba-breathe'
          }`}
        >
          {isCheering && (
            <div className="pointer-events-none absolute -right-1 -top-1 text-[#f59e0b]">
              <Sparkles className="h-4 w-4" />
            </div>
          )}

          <svg
            viewBox="0 0 120 120"
            className="h-full w-full overflow-visible"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="shibaFur" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f5a64b" />
                <stop offset="100%" stopColor="#d97724" />
              </linearGradient>
              <linearGradient id="shibaBelly" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fff4e3" />
                <stop offset="100%" stopColor="#f5dfc0" />
              </linearGradient>
              <linearGradient id="techBand" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
              <radialGradient id="floorShadow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            </defs>

            <ellipse cx="60" cy="111" rx="34" ry="5.5" fill="url(#floorShadow)" />

            <path
              d="M23 55 C23 23, 97 23, 97 55"
              fill="none"
              stroke="url(#techBand)"
              strokeWidth="4.5"
              strokeLinecap="round"
            />

            <path
              d="M84 95 C103 92, 108 75, 97 69 C90 66, 86 76, 84 85 Z"
              fill="url(#shibaFur)"
              className="animate-tail-wag"
            />

            <path
              d="M34 83 C34 70, 86 70, 86 83 L89 102 C89 107, 81 109, 60 109 C39 109, 31 107, 31 102 Z"
              fill="url(#shibaFur)"
            />
            <path
              d="M44 82 C44 76, 76 76, 76 82 L73 107 C67 109, 53 109, 47 107 Z"
              fill="url(#shibaBelly)"
            />

            <path d="M38 77 Q60 85 82 77 L80 83 Q60 91 40 83 Z" fill="#172554" />
            <circle cx="60" cy="86" r="5" fill="#f59e0b" />
            <circle cx="60" cy="86" r="3.2" fill="#0b0e14" />
            <text
              x="60"
              y="87.8"
              textAnchor="middle"
              fontSize="4.2"
              fontWeight="700"
              fill="#fbbf24"
              fontFamily="JetBrains Mono, monospace"
            >
              800
            </text>

            <path d="M27 42 L24 17 Q26 14 31 16 L44 31 Z" fill="url(#shibaFur)" />
            <path d="M30 37 L28 21 L40 31 Z" fill="#fce7d2" />
            <path d="M93 42 L96 17 Q94 14 89 16 L76 31 Z" fill="url(#shibaFur)" />
            <path d="M90 37 L92 21 L80 31 Z" fill="#fce7d2" />

            <path
              d="M25 56 C25 32, 95 32, 95 56 C95 75, 81 82, 60 82 C39 82, 25 75, 25 56 Z"
              fill="url(#shibaFur)"
            />
            <path
              d="M28 58 C28 52, 41 48, 49 54 C54 48, 66 48, 71 54 C79 48, 92 52, 92 58 C92 73, 79 81, 60 81 C41 81, 28 73, 28 58 Z"
              fill="url(#shibaBelly)"
            />

            <ellipse cx="45" cy="45" rx="4.2" ry="2.6" fill="#fef3e2" />
            <ellipse cx="75" cy="45" rx="4.2" ry="2.6" fill="#fef3e2" />

            <rect x="19" y="47" width="8" height="17" rx="4" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
            <rect x="93" y="47" width="8" height="17" rx="4" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
            <path
              d="M23 62 Q27 72 44 73"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <circle cx="45" cy="73" r="2.2" fill="#3b82f6" />

            {isCheering ? (
              <g stroke="#1e293b" strokeWidth="2.6" strokeLinecap="round" fill="none">
                <path d="M40 55 Q45 49 50 55" />
                <path d="M70 55 Q75 49 80 55" />
              </g>
            ) : (
              <g>
                <ellipse
                  cx="45"
                  cy="54"
                  rx="3.4"
                  ry={isBlinking ? 0.5 : 3.7}
                  fill="#0f172a"
                />
                <ellipse
                  cx="75"
                  cy="54"
                  rx="3.4"
                  ry={isBlinking ? 0.5 : 3.7}
                  fill="#0f172a"
                />
                {!isBlinking && (
                  <>
                    <circle cx="46.2" cy="52.6" r="1.2" fill="#ffffff" />
                    <circle cx="76.2" cy="52.6" r="1.2" fill="#ffffff" />
                  </>
                )}
              </g>
            )}

            <ellipse
              cx="35"
              cy="61"
              rx="4.5"
              ry="2.5"
              fill="#fb7185"
              opacity={isCheering ? 0.45 : 0.2}
            />
            <ellipse
              cx="85"
              cy="61"
              rx="4.5"
              ry="2.5"
              fill="#fb7185"
              opacity={isCheering ? 0.45 : 0.2}
            />

            <ellipse cx="60" cy="61" rx="4" ry="2.8" fill="#1e293b" />
            <ellipse cx="59" cy="60.1" rx="1.2" ry="0.7" fill="#64748b" />
            {isCheering ? (
              <path
                d="M54 65 Q60 73 66 65 Z"
                fill="#f43f5e"
                stroke="#1e293b"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            ) : (
              <path
                d="M54 66 Q57 69 60 66 Q63 69 66 66"
                fill="none"
                stroke="#1e293b"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            )}

            <ellipse cx="44" cy="105" rx="6.5" ry="4" fill="#fff4e3" />
            {isCheering ? (
              <ellipse
                cx="83"
                cy="82"
                rx="6.5"
                ry="5"
                fill="#fff4e3"
                stroke="#d97724"
                strokeWidth="1.2"
              />
            ) : (
              <ellipse cx="76" cy="105" rx="6.5" ry="4" fill="#fff4e3" />
            )}
          </svg>
        </div>

        <span className="mt-1 block text-center font-mono text-[10px] font-medium text-[#60a5fa] group-hover:text-[#93c5fd]">
          {isCheering ? '加油中！' : '點我聽口訣'}
        </span>
      </button>

      {/* Speech Bubble */}
      <div className="relative flex-1 rounded-xl border border-[#222c40] bg-[#0e131d] px-4 py-3 text-left">
        <span
          aria-hidden="true"
          className="hidden sm:block absolute -left-[6px] top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border-b border-l border-[#222c40] bg-[#0e131d]"
        />
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span className="font-semibold text-[#60a5fa]">
            多益柴犬教練 · {activeMessage.tag}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSpeakTip}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#10b981] hover:text-[#34d399]"
            >
              <Volume2 className="h-3 w-3" />
              <span>語音唸口訣</span>
            </button>
            <button
              type="button"
              onClick={handleCoachClick}
              className="text-[11px] font-medium text-[#8b98b1] underline-offset-2 hover:text-white hover:underline"
            >
              換一句
            </button>
          </div>
        </div>

        <p className="mt-1.5 text-xs leading-relaxed text-[#e6edf7] sm:text-[13px]">
          {activeMessage.tip}
        </p>
      </div>
    </div>
  );
}
