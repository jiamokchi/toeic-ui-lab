import { ChevronRight, Sparkles } from 'lucide-react';
import { useState } from 'react';

export const GAME_IMAGE_ASSETS = {
  shiba: '/src/assets/images/partner_lv1_shiba_1794840173479.jpg',
  fox: '/src/assets/images/partner_lv2_fox_1794840175680.jpg',
  falcon: '/src/assets/images/partner_lv3_falcon_1794840174788.jpg',
  owl: '/src/assets/images/ai_owl_coach_1794818548872.jpg',
  heroBanner: '/src/assets/images/hero_arena_banner_1794840175184.jpg',
  bossGuardian: '/src/assets/images/boss_grammar_guardian_1794840175827.jpg',
  supplyCrate: '/src/assets/images/supply_drop_crate_1794840175462.jpg',
} as const;

export const OWL_COACH_IMAGE_URL = GAME_IMAGE_ASSETS.owl;

export interface EvolutionStage {
  id: 'shiba' | 'fox' | 'falcon' | 'griffin' | 'owl';
  level: number;
  name: string;
  species: string;
  minXp: number;
  targetLabel: string;
  imageUrl: string;
}

export const EVOLUTION_STAGES: EvolutionStage[] = [
  {
    id: 'shiba',
    level: 1,
    name: '菜鳥實習生',
    species: '柴犬',
    minXp: 0,
    targetLabel: '500',
    imageUrl: GAME_IMAGE_ASSETS.shiba,
  },
  {
    id: 'fox',
    level: 2,
    name: '商務菁英',
    species: '赤狐',
    minXp: 2500,
    targetLabel: '650',
    imageUrl: GAME_IMAGE_ASSETS.fox,
  },
  {
    id: 'falcon',
    level: 3,
    name: '實戰蒼鷹',
    species: '蒼鷹',
    minXp: 8000,
    targetLabel: '750',
    imageUrl: GAME_IMAGE_ASSETS.falcon,
  },
  {
    id: 'griffin',
    level: 4,
    name: '黃金領航員',
    species: '金鷹',
    minXp: 18000,
    targetLabel: '800',
    imageUrl: GAME_IMAGE_ASSETS.falcon,
  },
  {
    id: 'owl',
    level: 5,
    name: '金色貓頭鷹導師',
    species: '貓頭鷹',
    minXp: 32000,
    targetLabel: '800+',
    imageUrl: GAME_IMAGE_ASSETS.owl,
  },
];

export function GameImageFrame({
  src,
  alt,
  className = 'h-14 w-14',
  fallbackLabel = 'AI',
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-xl border border-[#2a3854] bg-[#0b0e14] ${className}`}
    >
      {!failed ? (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#172554] to-[#0b0e14] font-mono text-xs font-bold text-[#60a5fa]">
          {fallbackLabel}
        </div>
      )}
    </div>
  );
}

export function OwlCoachPortrait({
  sizeClass = 'h-14 w-14',
}: {
  sizeClass?: string;
}) {
  return (
    <GameImageFrame
      src={GAME_IMAGE_ASSETS.owl}
      alt="AI 教練 3D 科技貓頭鷹插畫"
      className={sizeClass}
      fallbackLabel="OWL"
    />
  );
}

export function StageAvatar({
  stageId,
  size = 'md',
}: {
  stageId: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const stage =
    EVOLUTION_STAGES.find((s) => s.id === stageId) ?? EVOLUTION_STAGES[0];
  const boxClass =
    size === 'lg'
      ? 'h-16 w-16'
      : size === 'sm'
        ? 'h-8 w-8 rounded-lg'
        : 'h-11 w-11';

  return (
    <GameImageFrame
      src={stage.imageUrl}
      alt={`${stage.name} ${stage.species} 3D 角色立繪`}
      className={`${boxClass} ${
        stageId === 'griffin' ? 'border-[#f59e0b]/60 ring-1 ring-[#f59e0b]/30' : ''
      }`}
      fallbackLabel={stage.species}
    />
  );
}

export interface PartnerEvolutionBadgeProps {
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
              className={`h-3.5 w-3.5 shrink-0 text-[#64748b] transition-transform duration-150 ${
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
              {nextStage ? `差 ${xpRemaining.toLocaleString()} XP` : '最終形態'}
            </span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="animate-modal-pop mt-2 rounded-xl border border-[#263044] bg-[#0b0e14] p-3 text-xs">
          <div className="flex items-center justify-between text-[11px] text-[#8b98b1]">
            <span className="inline-flex items-center gap-1 font-medium text-[#fbbf24]">
              <Sparkles className="h-3 w-3" />
              5 階段 3D 夥伴進化路線
            </span>
            <span className="font-mono tabular-nums">{currentXp.toLocaleString()} XP</span>
          </div>
          <div className="mt-2.5 grid grid-cols-5 gap-1.5">
            {EVOLUTION_STAGES.map((stage, idx) => {
              const unlocked = currentXp >= stage.minXp;
              const isCurrent = idx === stageIndex;
              return (
                <div
                  key={stage.id}
                  className={`flex flex-col items-center rounded-lg border p-1.5 text-center ${
                    isCurrent
                      ? 'border-[#3b82f6]/70 bg-[#151c2c]'
                      : unlocked
                        ? 'border-[#1e2636] bg-[#111622]'
                        : 'border-[#1e2636] bg-[#0e131d] opacity-45 grayscale'
                  }`}
                >
                  <StageAvatar stageId={stage.id} size="sm" />
                  <span className="mt-1 w-full truncate text-[10px] font-semibold text-white">
                    {stage.species}
                  </span>
                  <span className="font-mono text-[9px] text-[#8b98b1] tabular-nums">
                    {stage.minXp.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function WeaknessIllustration({ id }: { id: string }) {
  if (id === 'w-1') {
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
