import { ArrowDown, ArrowRight, Award, Flame, Layers, Sparkles, X, Zap } from 'lucide-react';

interface GamificationBlueprintModalProps {
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
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#263044] bg-[#111622] p-5 sm:p-7 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="關閉設計藍圖"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-[#8b98b1] hover:bg-[#171d2c] hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div>
          <p className="text-xs font-medium text-[#60a5fa]">
            輕度遊戲化系統架構 · System Architecture
          </p>
          <h2
            id="blueprint-title"
            className="mt-1 font-display text-xl font-bold text-white sm:text-2xl"
          >
            TOEIC 800 核心激勵循環與數值設計圖
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-[#8b98b1]">
            設計原則：回饋感強但不干擾題目閱讀。所有動畫僅在「答題瞬間微反饋」與「結算時刻」觸發，閱讀題幹時保持零雜訊。
          </p>
        </div>

        {/* Visual Flowchart Diagram */}
        <div className="mt-6 space-y-4">
          {/* Step 1 -> Step 2 -> Step 3 */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-[#222c40] bg-[#0e131d] p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-[#60a5fa]">
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="h-4 w-4" />
                  01. 每日任務入口
                </span>
                <ArrowRight className="hidden h-3.5 w-3.5 text-[#475569] md:block" />
              </div>
              <p className="mt-2 text-xs font-medium text-white">
                低門檻選擇訓練負荷
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-[#8b98b1]">
                5 分鐘 (6題/+60XP)、15 分鐘 (12題/+150XP)、30 分鐘 (20題/+280XP)，忙碌日也能用 5 分鐘保住連勝。
              </p>
            </div>

            <div className="rounded-xl border border-[#222c40] bg-[#0e131d] p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-[#f59e0b]">
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="h-4 w-4" />
                  02. 實戰連擊 Combo
                </span>
                <ArrowRight className="hidden h-3.5 w-3.5 text-[#475569] md:block" />
              </div>
              <p className="mt-2 text-xs font-medium text-white">
                精準反應放大 XP 倍率
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-[#8b98b1]">
                連續答對 2 題 ×1.2、3 題 ×1.5、5 題達上限 ×2.0。答錯不扣分僅重置連擊，保持學習心理安全感。
              </p>
            </div>

            <div className="rounded-xl border border-[#222c40] bg-[#0e131d] p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-[#10b981]">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  03. 完賽慶祝結算
                </span>
              </div>
              <p className="mt-2 text-xs font-medium text-white">
                儀式感動畫＋多巴胺閉環
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-[#8b98b1]">
                軌道環精準描邊動畫 + XP 進度條平滑推進 + 完賽額外獎勵 (+30 XP)，讓大腦記住完成任務的正向收尾。
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="h-4 w-4 text-[#475569]" />
          </div>

          {/* Step 4: Dual Retention Engine (Streak + Rank Ladder) */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-[#f59e0b]/30 bg-[#f59e0b]/5 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#fbbf24]">
                <Flame className="h-4 w-4" />
                <span>04A. 連續天數 Streak 與防斷機制</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#cbd5e1]">
                每日完成任一任務即點亮火焰 (+1 天)。每連續達標 7 天自動發放 1 枚「凍結護盾」，避免偶發加班斷線導致放棄。
              </p>
            </div>

            <div className="rounded-xl border border-[#3b82f6]/35 bg-[#3b82f6]/5 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#60a5fa]">
                <Award className="h-4 w-4" />
                <span>04B. TOEIC 800 階梯經驗條解鎖</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#cbd5e1]">
                0 XP (500 築底) → 1,500 XP (650 職場) → 3,000 XP (750 實戰) → 5,000 XP (800 金色候選)，每階段解鎖對應高階功能與診斷報告。
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[42px] rounded-xl bg-[#3b82f6] px-5 py-2 text-xs font-semibold text-white hover:bg-[#2563eb]"
          >
            關閉並回到練習室
          </button>
        </div>
      </div>
    </div>
  );
}
