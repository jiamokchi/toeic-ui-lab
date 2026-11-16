import { AnimatePresence, motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { WeaknessItem } from '../types/toeic';
import { playFeedbackTone } from '../utils/soundAndSpeech';

interface ShibaCoachMascotProps {
  topWeakness: WeaknessItem;
  muted?: boolean;
}

const TOEIC_800_GRAMMAR_TIPS: { tag: string; tip: string }[] = [
  {
    tag: 'Part 5 分詞修飾',
    tip: '口訣：先找主詞看主動被動！名詞與修飾動作「主動用 V-ing、被動用 V-ed」，逗點前後主詞要一致喔！',
  },
  {
    tag: 'Part 5 讓步詞性',
    tip: '口訣：介系詞接名詞、連接詞接子句！看到 Despite / In spite of 後面絕不接完整句子，Although 才接 S+V。',
  },
  {
    tag: 'Part 5 假設倒裝',
    tip: '口訣：與過去事實相反省略 If 時，Had 往前搬！看到 Had + S + p.p.，後方主句必配 would have + p.p.。',
  },
  {
    tag: 'Part 5 詞性秒殺',
    tip: '口訣：冠詞 (a/the) 與介系詞中間夾名詞！看到「the + ___ + of」別猶豫，0.5 秒直接鎖定名詞選項。',
  },
  {
    tag: 'Part 2 聽力陷阱',
    tip: '口訣：Wh- 疑問詞開頭絕對不選 Yes / No！聽到重複原字選項先懷疑，同義替換或反問才是正解。',
  },
  {
    tag: 'Part 7 同義替換',
    tip: '口訣：800 分關鍵在 Paraphrase！題幹問 reimburse 就找原文 refund，問 cap fee 就找 limit increase。',
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

  // Periodic natural eye blink
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

  // Reset cheering pose back to attentive coach pose after 2.2s
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
          tip: `目前「${topWeakness.area}」正確率 ${topWeakness.accuracy}%，別急！先練 5 題抓回手感，我陪你一起衝上 800！`,
        }
      : TOEIC_800_GRAMMAR_TIPS[tipIndex];

  return (
    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
      {/* Interactive Shiba Inu Coach Button */}
      <button
        type="button"
        onClick={handleCoachClick}
        aria-label="點擊多益柴犬教練取得文法小口訣"
        className="group relative shrink-0 cursor-pointer rounded-2xl border border-[#222c40] bg-[#0e131d] p-2.5 transition-colors hover:border-[#3b82f6]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
      >
        {/* Subtle Tech Ring Glow behind Shiba */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-2 rounded-full transition-opacity duration-300 ${
            isCheering
              ? 'bg-[#f59e0b]/20 opacity-100 blur-md'
              : 'bg-[#3b82f6]/12 opacity-75 blur-md group-hover:opacity-100'
          }`}
        />

        <motion.div
          key={jumpKey}
          animate={
            isCheering
              ? { y: [0, -14, 0, -6, 0], scale: [1, 1.05, 0.98, 1.02, 1] }
              : { y: [0, -2.5, 0], scaleY: [1, 1.015, 1] }
          }
          transition={
            isCheering
              ? { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
              : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }
          }
          className="relative h-24 w-24 sm:h-28 sm:w-28"
        >
          {/* Cheer Sparkles on Click */}
          <AnimatePresence>
            {isCheering && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: -4 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute -right-1 -top-1 text-[#f59e0b]"
              >
                <Sparkles className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3D Flat Vector Shiba Inu Coach SVG */}
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

            {/* Ground Shadow */}
            <ellipse cx="60" cy="111" rx="34" ry="5.5" fill="url(#floorShadow)" />

            {/* Left & Right Tech Headset Band */}
            <path
              d="M23 55 C23 23, 97 23, 97 55"
              fill="none"
              stroke="url(#techBand)"
              strokeWidth="4.5"
              strokeLinecap="round"
            />

            {/* Tail (wagging subtly when cheering) */}
            <motion.path
              d="M84 95 C103 92, 108 75, 97 69 C90 66, 86 76, 84 85 Z"
              fill="url(#shibaFur)"
              animate={isCheering ? { rotate: [0, 12, -8, 10, 0] } : { rotate: [0, 3, 0] }}
              transition={
                isCheering
                  ? { duration: 0.45, repeat: 2 }
                  : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
              }
              style={{ originX: '84px', originY: '90px' }}
            />

            {/* Body */}
            <path
              d="M34 83 C34 70, 86 70, 86 83 L89 102 C89 107, 81 109, 60 109 C39 109, 31 107, 31 102 Z"
              fill="url(#shibaFur)"
            />
            {/* Chest Cream Patch */}
            <path
              d="M44 82 C44 76, 76 76, 76 82 L73 107 C67 109, 53 109, 47 107 Z"
              fill="url(#shibaBelly)"
            />

            {/* Navy Tech Collar + 800 Gold Tag */}
            <path
              d="M38 77 Q60 85 82 77 L80 83 Q60 91 40 83 Z"
              fill="#172554"
            />
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

            {/* Left & Right Ears */}
            <motion.g
              animate={isCheering ? { rotate: [-4, 4, 0] } : undefined}
              transition={{ duration: 0.35 }}
              style={{ originX: '34px', originY: '38px' }}
            >
              <path d="M27 42 L24 17 Q26 14 31 16 L44 31 Z" fill="url(#shibaFur)" />
              <path d="M30 37 L28 21 L40 31 Z" fill="#fce7d2" />
            </motion.g>

            <motion.g
              animate={isCheering ? { rotate: [4, -4, 0] } : undefined}
              transition={{ duration: 0.35 }}
              style={{ originX: '86px', originY: '38px' }}
            >
              <path d="M93 42 L96 17 Q94 14 89 16 L76 31 Z" fill="url(#shibaFur)" />
              <path d="M90 37 L92 21 L80 31 Z" fill="#fce7d2" />
            </motion.g>

            {/* Head Base (3D-flat shaded) */}
            <path
              d="M25 56 C25 32, 95 32, 95 56 C95 75, 81 82, 60 82 C39 82, 25 75, 25 56 Z"
              fill="url(#shibaFur)"
            />

            {/* Cream Cheek & Snout Mask */}
            <path
              d="M28 58 C28 52, 41 48, 49 54 C54 48, 66 48, 71 54 C79 48, 92 52, 92 58 C92 73, 79 81, 60 81 C41 81, 28 73, 28 58 Z"
              fill="url(#shibaBelly)"
            />

            {/* Iconic Shiba Cream Eyebrow Dots */}
            <ellipse cx="45" cy="45" rx="4.2" ry="2.6" fill="#fef3e2" />
            <ellipse cx="75" cy="45" rx="4.2" ry="2.6" fill="#fef3e2" />

            {/* Tech Earcups on Sides */}
            <rect x="19" y="47" width="8" height="17" rx="4" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
            <rect x="93" y="47" width="8" height="17" rx="4" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
            {/* Mic boom */}
            <path
              d="M23 62 Q27 72 44 73"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <circle cx="45" cy="73" r="2.2" fill="#3b82f6" />

            {/* Eyes: Happy Crescent when cheering, Blinking/Attentive otherwise */}
            {isCheering ? (
              <g stroke="#1e293b" strokeWidth="2.6" strokeLinecap="round" fill="none">
                <path d="M40 55 Q45 49 50 55" />
                <path d="M70 55 Q75 49 80 55" />
              </g>
            ) : (
              <g>
                <motion.ellipse
                  cx="45"
                  cy="54"
                  rx="3.4"
                  ry={isBlinking ? 0.5 : 3.7}
                  fill="#0f172a"
                  transition={{ duration: 0.08 }}
                />
                <motion.ellipse
                  cx="75"
                  cy="54"
                  rx="3.4"
                  ry={isBlinking ? 0.5 : 3.7}
                  fill="#0f172a"
                  transition={{ duration: 0.08 }}
                />
                {!isBlinking && (
                  <>
                    <circle cx="46.2" cy="52.6" r="1.2" fill="#ffffff" />
                    <circle cx="76.2" cy="52.6" r="1.2" fill="#ffffff" />
                  </>
                )}
              </g>
            )}

            {/* Cheek Blush */}
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

            {/* Nose & Mouth */}
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

            {/* Paws (Right paw raises to cheer when clicked!) */}
            <ellipse cx="44" cy="105" rx="6.5" ry="4" fill="#fff4e3" />
            {isCheering ? (
              <motion.g
                initial={{ rotate: 0 }}
                animate={{ rotate: [-18, 8, -14, 0] }}
                transition={{ duration: 0.6 }}
                style={{ originX: '77px', originY: '92px' }}
              >
                <ellipse cx="83" cy="82" rx="6.5" ry="5" fill="#fff4e3" stroke="#d97724" strokeWidth="1.2" />
              </motion.g>
            ) : (
              <ellipse cx="76" cy="105" rx="6.5" ry="4" fill="#fff4e3" />
            )}
          </svg>
        </motion.div>

        <span className="mt-1 block text-center font-mono text-[10px] font-medium text-[#60a5fa] group-hover:text-[#93c5fd]">
          {isCheering ? '加油中！' : '點我聽口訣'}
        </span>
      </button>

      {/* Speech Bubble */}
      <div className="relative flex-1 rounded-xl border border-[#222c40] bg-[#0e131d] px-4 py-3 text-left">
        {/* Speech Tail on Desktop Left */}
        <span
          aria-hidden="true"
          className="hidden sm:block absolute -left-[6px] top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border-b border-l border-[#222c40] bg-[#0e131d]"
        />
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="font-semibold text-[#60a5fa]">
            多益柴犬教練 · {activeMessage.tag}
          </span>
          <button
            type="button"
            onClick={handleCoachClick}
            className="text-[11px] font-medium text-[#8b98b1] underline-offset-2 hover:text-white hover:underline"
          >
            換一句口訣
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={tipIndex === null ? 'weakness' : `tip-${tipIndex}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
            className="mt-1.5 text-xs leading-relaxed text-[#e6edf7] sm:text-[13px]"
          >
            {activeMessage.tip}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
