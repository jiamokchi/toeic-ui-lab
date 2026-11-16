import { BarChart3, BookOpen, LayoutDashboard, Target } from 'lucide-react';
import { NavTab } from '../types/toeic';

interface TopNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onStartPrimaryMission: () => void;
  dailyCompleted: boolean;
}

const NAV_ITEMS: { id: NavTab; label: string; shortLabel: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: '總覽儀表板', shortLabel: '總覽', icon: LayoutDashboard },
  { id: 'mission', label: '每日任務實戰', shortLabel: '實戰', icon: Target },
  { id: 'vocab', label: '單字測驗室', shortLabel: '單字', icon: BookOpen },
  { id: 'diagnostic', label: '診斷與弱項', shortLabel: '分析', icon: BarChart3 },
];

export function TopNav({
  activeTab,
  onSelectTab,
  onStartPrimaryMission,
  dailyCompleted,
}: TopNavProps) {
  return (
    <>
      {/* Desktop & Mobile Top Header — Strict 3-Zone Contract */}
      <header className="sticky top-0 z-30 border-b border-[#1e2636] bg-[#0b0e14]/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6">
          {/* Zone 1: Single-line brand wordmark */}
          <button
            type="button"
            onClick={() => onSelectTab('overview')}
            className="font-display shrink-0 whitespace-nowrap text-base font-bold tracking-tight text-white transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] rounded-md px-1"
          >
            TOEIC 800 練習室
          </button>

          {/* Zone 2: 4 single-line text nav links (Desktop) */}
          <nav
            aria-label="主導覽"
            className="hidden md:flex items-center gap-7 text-sm font-medium"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`relative shrink-0 whitespace-nowrap py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] rounded-sm ${
                    isActive
                      ? 'text-white'
                      : 'text-[#8b98b1] hover:text-[#e6edf7]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-[15px] h-[2px] bg-[#3b82f6]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary CTA Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onStartPrimaryMission}
              className="shrink-0 whitespace-nowrap rounded-lg bg-[#3b82f6] px-4 py-2 text-xs font-semibold text-white transition-all duration-150 hover:bg-[#2563eb] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60a5fa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0e14]"
            >
              {dailyCompleted ? '加練一組題目' : '開始今日任務'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Ergonomic Thumb Bar (< md) */}
      <nav
        aria-label="行動版底部導覽"
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#1e2636] bg-[#0b0e14]/95 backdrop-blur-md md:hidden"
      >
        <div className="grid h-14 grid-cols-4 items-center">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 transition-colors active:scale-95 ${
                  isActive ? 'text-[#60a5fa]' : 'text-[#8b98b1]'
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="text-[11px] font-medium whitespace-nowrap">
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
