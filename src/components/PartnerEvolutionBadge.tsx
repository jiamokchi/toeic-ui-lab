import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useState } from 'react';

export const OWL_COACH_IMAGE_URL = '/src/assets/images/ai_owl_coach_1794818548872.jpg';

interface EvolutionStage {
  id: string;
  level: number;
  name: string;
  species: string;
  minXp: number;
  subtitle: string;
}

const EVOLUTION_STAGES: EvolutionStage[] = [
  {
    id: 'shiba',
    level: 1,
    name: '菜鳥實習生',
    species: '柴犬',
    minXp: 0,
    subtitle: '熟悉高頻商務字根與基礎語態',
  },
  {
    id: 'fox',
    level: 2,
    name: '商務菁英',
    species: '赤狐',
    minXp: 1500,
    subtitle: '掌握職場書信邏輯與文法捷徑',
  },
  {
    id: 'owl',
    level: 3,
    name: '金色貓頭鷹導師',
    species: '貓頭鷹',
    minXp: 3000,
    subtitle: '具備 800+ 全真閱讀與聽力洞悉力',
  },
];

export function OwlCoachPortrait({
  sizeClass = 'h-16 w-16',
}: {
  sizeClass?: string;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-xl border border-[#2a3854] bg-[#0b0e14] ${sizeClass}`}
    >
      {!imgError ? (
        <img
          src={OWL_COACH_IMAGE_URL}
          alt="AI 教練 3D 科技貓頭鷹插畫"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#172554] to-[#0b0e14]">
          <svg viewBox="0 0 64 64" className="h-10 w-10" aria-hidden="true">
            <circle cx="32" cy="34" r="20" fill="#b47b44" />
            <circle cx="24" cy="30" r="6" fill="#fff4e3" />
            <circle cx="40" cy="30" r="6" fill="#fff4e3" />
            <circle cx="24" cy="30" r="2.8" fill="#0f172a" />
            <circle cx="40" cy="30" r="2.8" fill="#0f172a" />
            <polygon points="32,34 29,39 35,39" fill="#f59e0b" />
          </svg>
        </div>
      )}
    </div>
  );
}

function StageAvatar({ stageId }: { stageId: string }) {
  if (stageId === 'owl') {
    return <OwlCoachPortrait sizeClass="h-11 w-11" />;
  }

  if (stageId === 'fox') {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#3b82f6]/40 bg-[#0e131d]">
        <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden="true">
          <path d="M10 18 L14 6 L22 15 Z" fill="#ea580c" />
          <path d="M38 18 L34 6 L26 15 Z" fill="#ea580c" />
          <path d="M12 18 C12 12, 36 12, 36 18 C36 29, 28 36, 24 37 C20 36, 12 29, 12 18 Z" fill="#f97316" />
          <path d="M13 24 C16 24, 21 28, 24 36 C27 28, 32 24, 35 24 C34 31, 28 36, 24 37 C20 36, 14 31, 13 24 Z" fill="#fff7ed" />
          <circle cx="19" cy="22" r="2" fill="#0f172a" />
          <circle cx="29" cy="22" r="2" fill="#0f172a" />
          <circle cx="24" cy="32" r="2.2" fill="#0f172a" />
          <path d="M15 38 L24 41 L33 38" stroke="#3b82f6" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#263044] bg-[#0e131d]">
      <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden="true">
        <path d="M11 19 L10 8 L19 15 Z" fill="#d97724" />
        <path d="M37 19 L38 8 L29 15 Z" fill="#d97724" />
        <path d="M11 22 C11 13, 37 13, 37 22 C37 32, 30 37, 24 37 C18 37, 11 32, 11 22 Z" fill="#f5a64b" />
        <path d="M13 25 C15 22, 21 22, 24 25 C27 22, 33 22, 35 25 C35 32, 29 37, 24 37 C19 37, 13 32, 13 25 Z" fill="#fff4e3" />
        <circle cx="19" cy="23" r="1.9" fill="#0f172a" />
        <circle cx="29" cy="23" r="1.9" fill="#0f172a" />
        <ellipse cx="24" cy="28" rx="2.3" ry="1.6" fill="#1e293b" />
      </svg>
    </div>
  );
}

interface PartnerEvolutionBadgeProps {
  currentXp: number;
  compact?: boolean;
}

export function PartnerEvolutionBadge({
  currentXp,
  compact = false,
}: PartnerEvolutionBadgeProps) {
  const [expanded, setExpanded] = useState(false);

  const stageIndex = EVOLUTION_STAGES.reduce(
    (acc, stage, idx) => (currentXp >= stage.minXp ? idx : acc),
    0
  );
  const currentStage = EVOLUTION_STAGES[stageIndex];
  const nextStage = EVOLUTION_STAGES[stageIndex + 1] ?? null;
  const xpRemaining = nextStage ? Math.max(0, nextStage.minXp - currentXp) : 0;
  const stageSpan = nextStage ? nextStage.minXp - currentStage.minXp : 1;
  const stageProgress = nextStage
    ? Math.min(100, Math.round(((currentXp - currentStage.minXp) / stageSpan) * 100))
    : 100;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={`group flex w-full items-center gap-3 rounded-xl border border-[#222c40] bg-[#0e131d] text-left transition-all duration-150 hover:border-[#3b82f6]/60 active:scale-[0.97] ${
          compact ? 'px-3 py-2' : 'px-3.5 py-2.5'
        }`}
      >
        <StageAvatar stageId={currentStage.id} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-xs font-semibold text-white">
              Lv.{currentStage.level} {currentStage.name}（{currentStage.species}）
            </span>
            <ChevronRight
              className={`h-3.5 w-3.5 shrink-0 text-[#64748b] transition-transform ${
                expanded ? 'rotate-90 text-[#60a5fa]' : ''
              }`}
            />
          </div>

          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#1b2233]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] to-[#f59e0b] transition-all duration-500"
                style={{ width: `${stageProgress}%` }}
              />
            </div>
            <span className="shrink-0 font-mono text-[10px] text-[#60a5fa] tabular-nums">
              {nextStage
                ? `差 ${xpRemaining} XP 進化`
                : '已達最終形態'}
            </span>
          </div>
        </div>
      </button>

      {/* Expandable Evolution Path Preview */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
            className="mt-2 rounded-xl border border-[#263044] bg-[#0b0e14] p-3 text-xs"
          >
            <div className="flex items-center justify-between text-[11px] text-[#8b98b1]">
              <span className="inline-flex items-center gap-1 font-medium text-[#fbbf24]">
                <Sparkles className="h-3 w-3" />
                夥伴進化路線
              </span>
              <span className="font-mono tabular-nums">{currentXp.toLocaleString()} XP</span>
            </div>
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              {EVOLUTION_STAGES.map((stage, idx) => {
                const unlocked = currentXp >= stage.minXp;
                const isCurrent = idx === stageIndex;
                return (
                  <div
                    key={stage.id}
                    className={`flex flex-col items-center rounded-lg border p-2 text-center ${
                      isCurrent
                        ? 'border-[#3b82f6]/60 bg-[#151c2c]'
                        : unlocked
                          ? 'border-[#1e2636] bg-[#111622]'
                          : 'border-[#1e2636] bg-[#0e131d] opacity-55'
                    }`}
                  >
                    <StageAvatar stageId={stage.id} />
                    <span className="mt-1.5 text-[11px] font-semibold text-white">
                      {stage.name}
                    </span>
                    <span className="font-mono text-[10px] text-[#8b98b1] tabular-nums">
                      {stage.minXp} XP
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function WeaknessIllustration({ id }: { id: string }) {
  if (id === 'w-1') {
    // Grammar Structure: Syntax Bracket & Highlighted Clause Nodes
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#222c40] bg-[#0e131d]">
        <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden="true">
          <rect x="8" y="10" width="32" height="28" rx="5" fill="#131b2e" stroke="#263554" strokeWidth="1.5" />
          <path d="M14 18 H24" stroke="#60a5fa" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M28 18 H34" stroke="#f59e0b" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M14 25 H34" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          <path d="M14 31 H26" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          <circle cx="34" cy="31" r="4" fill="#f59e0b" fillOpacity="0.22" stroke="#f59e0b" strokeWidth="1.4" />
          <path d="M32.6 31 L33.7 32.2 L35.6 29.8" stroke="#fbbf24" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>
    );
  }

  if (id === 'w-2') {
    // Business Reading: Document + Magnifying Glass Scan
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#222c40] bg-[#0e131d]">
        <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden="true">
          <path d="M12 9 H27 L34 16 V37 C34 38.5 33 39 31.5 39 H12 C10.5 39 10 38 10 37 V11 C10 9.8 10.8 9 12 9 Z" fill="#131b2e" stroke="#263554" strokeWidth="1.5" />
          <path d="M27 9 V16 H34" fill="none" stroke="#263554" strokeWidth="1.5" />
          <path d="M15 20 H26" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          <path d="M15 26 H23" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
          <circle cx="29" cy="29" r="6.5" fill="#0b0e14" stroke="#3b82f6" strokeWidth="2" />
          <path d="M34 34 L39 39" stroke="#60a5fa" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // Listening: Tech Headphones & Soundwave
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#222c40] bg-[#0e131d]">
      <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden="true">
        <path
          d="M12 26 V22 C12 14.5 17.5 10 24 10 C30.5 10 36 14.5 36 22 V26"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <rect x="9" y="23" width="5.5" height="11" rx="2.75" fill="#1e293b" stroke="#60a5fa" strokeWidth="1.4" />
        <rect x="33.5" y="23" width="5.5" height="11" rx="2.75" fill="#1e293b" stroke="#60a5fa" strokeWidth="1.4" />
        <path d="M19 28 V24 M24 31 V21 M29 28 V24" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
