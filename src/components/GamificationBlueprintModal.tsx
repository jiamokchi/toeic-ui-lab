import { ArrowDown, ArrowRight, Award, Flame, Layers, Sparkles, X, Zap } from 'lucide-react';

export interface GamificationBlueprintModalProps {
  open: boolean;
  onClose: () => void;
}

export function GamificationBlueprintModal({
  open,
  onClose,
}: GamificationBlueprintModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="blueprint-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
    >
      <div className="animate-modal-pop relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#263044] bg-[#111622] p-5 shadow-2xl sm:p-7">
        <button
          type="button"
          onClick={onClose}
          aria-label="關閉設計藍圖"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-[#8b98b1] hover:bg-[#171d2c] hover:text-white active:scale-90"
        >
          <X className="h-4 w-4" />
        </button>

        <div>
          <p className="text-xs font-medium text-[#60a5fa]">
            1 年期 32,000 XP 輕度遊戲化架構 · 正式網站數值規則
          </p>
          <h2
            id="blueprint-title"
            className="mt-1 font-display text-xl font-bold text-white sm:text-2xl"
          >
            TOEIC 800 練習室核心激勵循環
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-[#8b98b1]">
            採用「低負擔純視覺呈現＋防刷 XP 守門機制」，閱讀文章區域保持零動畫干擾，只在對戰進度條與完賽開箱時釋放正向視覺回饋。
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-[#222c40] bg-[#0e131d] p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-[#60a5fa]">
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="h-4 w-4" />
                  01. 每日課表強度
                </span>
                <ArrowRight className="hidden h-3.5 w-3.5 text-[#475569] md:block" />
              </div>
              <p className="mt-2 text-xs font-medium text-white">
                5 / 15 / 30 分鐘彈性門檻
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-[#8b98b1]">
                5 分鐘（6題，最高 +55 XP）、15 分鐘（12題，最高 +85 XP）、30 分鐘（20題，最高 +125 XP）。
              </p>
            </div>

            <div className="rounded-xl border border-[#222c40] bg-[#0e131d] p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-[#f59e0b]">
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="h-4 w-4" />
                  02. 防刷 XP 取得公式
                </span>
                <ArrowRight className="hidden h-3.5 w-3.5 text-[#475569] md:block" />
              </div>
              <p className="mt-2 text-xs font-medium text-white">
                獨立作答優先，同日重複 +0 XP
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-[#8b98b1]">
                獨立答對 +5 XP、提示後答對 +2 XP、答錯努力 +1 XP；字卡熟記 +2 XP、模糊 +1 XP。同日同題／同字不重複給分。
              </p>
            </div>

            <div className="rounded-xl border border-[#222c40] bg-[#0e131d] p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-[#10b981]">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  03. 精熟與開箱獎勵
                </span>
              </div>
              <p className="mt-2 text-xs font-medium text-white">
                每日全勤 +25 XP ＋ 補給箱
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-[#8b98b1]">
                單項達精熟門檻 +10 XP；完成每日課表領取全勤 +25 XP（每日限 1 次）並開啟科技補給箱。
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="h-4 w-4 text-[#475569]" />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-[#f59e0b]/30 bg-[#f59e0b]/5 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#fbbf24]">
                <Flame className="h-4 w-4" />
                <span>04A. 台北時區 (UTC+8) 連勝與成就徽章</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#cbd5e1]">
                以台灣時間為日界線計算連續專注天數，累積解鎖 3 天、7 天、14 天與 30 天實戰成就徽章，真實反映學習毅力。
              </p>
            </div>

            <div className="rounded-xl border border-[#3b82f6]/35 bg-[#3b82f6]/5 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#60a5fa]">
                <Award className="h-4 w-4" />
                <span>04B. 5 階段全年 32,000 XP 進化路線</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#cbd5e1]">
                0 XP (500 築底) → 2,500 XP (650 職場) → 8,000 XP (750 實戰) → 18,000 XP (800 金證候選) → 32,000 XP (800+ 金色貓頭鷹導師)。
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[42px] rounded-xl bg-[#3b82f6] px-5 py-2 text-xs font-semibold text-white hover:bg-[#2563eb] active:scale-[0.96]"
          >
            關閉並回到練習室
          </button>
        </div>
      </div>
    </div>
  );
}
