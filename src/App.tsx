/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArrowRight, BookOpen, Compass, Target, Timer, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import { DailyMissionDeck } from './components/DailyMissionDeck';
import { DiagnosticCoachView } from './components/DiagnosticCoachView';
import { GamificationBlueprintModal } from './components/GamificationBlueprintModal';
import { MissionCelebrationModal } from './components/MissionCelebrationModal';
import {
  OwlCoachPortrait,
  PartnerEvolutionBadge,
} from './components/PartnerEvolutionBadge';
import { PracticeRunner } from './components/PracticeRunner';
import { RankProgressTrack } from './components/RankProgressTrack';
import { TopNav } from './components/TopNav';
import { VocabLab } from './components/VocabLab';
import {
  INITIAL_WEEKLY_DATA,
  MISSION_TIERS,
  QUESTION_BANK,
  RANK_TIERS,
  VOCAB_DECK,
  WEAKNESS_ITEMS,
} from './data/toeicData';
import {
  DailyProgressDay,
  MissionTier,
  MissionTierId,
  NavTab,
  QuestionCategory,
  SessionResult,
  ToeicQuestion,
  VocabCard,
} from './types/toeic';
import { playFeedbackTone } from './utils/soundAndSpeech';

interface ActiveSession {
  title: string;
  questions: ToeicQuestion[];
  isDailyMission: boolean;
  timeLimitSeconds?: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [selectedTierId, setSelectedTierId] = useState<MissionTierId>('15m');

  // Gamification State (Starts at 2,840 XP -> just 160 XP away from unlocking 750 rank!)
  const [xp, setXp] = useState<number>(2840);
  const [previousXpSnapshot, setPreviousXpSnapshot] = useState<number>(2840);
  const [streakDays, setStreakDays] = useState<number>(14);
  const [freezeShields] = useState<number>(2);
  const [todayCompleted, setTodayCompleted] = useState<boolean>(false);
  const [completedCountToday, setCompletedCountToday] = useState<number>(4);
  const [weeklyData, setWeeklyData] = useState<DailyProgressDay[]>(INITIAL_WEEKLY_DATA);
  const [vocabCards, setVocabCards] = useState<VocabCard[]>(VOCAB_DECK);

  // Interactive Session & Modals
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [celebrationResult, setCelebrationResult] = useState<SessionResult | null>(null);
  const [blueprintOpen, setBlueprintOpen] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);

  const estimatedScore = useMemo(() => {
    const base = 500 + Math.round((xp / 5000) * 320);
    return Math.min(990, base);
  }, [xp]);

  const buildQuestionsForTier = (tier: MissionTier): ToeicQuestion[] => {
    const count = Math.min(tier.totalQuestions, QUESTION_BANK.length);
    return QUESTION_BANK.slice(0, count);
  };

  const startMission = (tier: MissionTier) => {
    setActiveSession({
      title: tier.title,
      questions: buildQuestionsForTier(tier),
      isDailyMission: true,
    });
    setActiveTab('mission');
  };

  const startTimedDiagnostic = () => {
    setActiveSession({
      title: '8 分鐘限時模擬診斷',
      questions: QUESTION_BANK.slice(0, 8),
      isDailyMission: false,
      timeLimitSeconds: 8 * 60,
    });
    setActiveTab('mission');
  };

  const startWeaknessDrill = (category: QuestionCategory, title: string) => {
    const filtered = QUESTION_BANK.filter((q) => q.category === category);
    const pool = filtered.length >= 4 ? filtered : QUESTION_BANK.slice(0, 5);
    setActiveSession({
      title,
      questions: pool,
      isDailyMission: false,
    });
    setActiveTab('mission');
  };

  const handleSessionComplete = (result: SessionResult) => {
    setPreviousXpSnapshot(xp);
    const nextXp = xp + result.totalXpEarned;
    setXp(nextXp);

    if (result.isDailyMission && !todayCompleted) {
      setTodayCompleted(true);
      setStreakDays((s) => s + 1);
      setCompletedCountToday(result.totalAnswered);
      setWeeklyData((prev) =>
        prev.map((d) =>
          d.day === '今日'
            ? {
                ...d,
                xp: d.xp + result.totalXpEarned,
                accuracy: Math.round(
                  (result.correctCount / Math.max(1, result.totalAnswered)) * 100
                ),
                minutes: Math.max(5, Math.round(result.elapsedSeconds / 60)),
                completed: true,
              }
            : d
        )
      );
    } else if (result.isDailyMission) {
      setWeeklyData((prev) =>
        prev.map((d) =>
          d.day === '今日' ? { ...d, xp: d.xp + result.totalXpEarned } : d
        )
      );
    }

    setActiveSession(null);
    setCelebrationResult(result);
    setActiveTab('overview');
  };

  const handleTriggerCelebrationDemo = (tier: MissionTier) => {
    const demoXp = tier.baseXp + 45 + 30;
    const demoResult: SessionResult = {
      missionTitle: tier.title,
      totalAnswered: tier.totalQuestions,
      correctCount: Math.max(1, tier.totalQuestions - 1),
      peakCombo: 5,
      baseXpEarned: tier.baseXp,
      comboBonusXp: 45,
      completionBonusXp: 30,
      totalXpEarned: demoXp,
      elapsedSeconds: tier.durationMinutes * 52,
      isDailyMission: true,
    };
    playFeedbackTone('complete', muted);
    handleSessionComplete(demoResult);
  };

  const handleToggleMastered = (id: string) => {
    setVocabCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, mastered: !c.mastered } : c))
    );
  };

  const handleEarnVocabXp = (amount: number) => {
    setXp((prev) => prev + amount);
  };

  const selectedTier =
    MISSION_TIERS.find((t) => t.id === selectedTierId) ?? MISSION_TIERS[1];
  const masteredVocabCount = vocabCards.filter((c) => c.mastered).length;
  const topWeakness = WEAKNESS_ITEMS[0];

  return (
    <div className="min-h-screen bg-[#0b0e14] text-[#e6edf7]">
      <TopNav
        activeTab={activeSession ? 'mission' : activeTab}
        onSelectTab={(tab) => {
          if (tab === 'mission' && !activeSession) {
            startMission(selectedTier);
            return;
          }
          setActiveSession(null);
          setActiveTab(tab);
        }}
        onStartPrimaryMission={() => startMission(selectedTier)}
        dailyCompleted={todayCompleted}
      />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Active Practice Session View */}
        {activeTab === 'mission' && activeSession ? (
          <PracticeRunner
            title={activeSession.title}
            questions={activeSession.questions}
            isDailyMission={activeSession.isDailyMission}
            timeLimitSeconds={activeSession.timeLimitSeconds}
            muted={muted}
            onToggleMute={() => setMuted((m) => !m)}
            onExit={() => {
              setActiveSession(null);
              setActiveTab('overview');
            }}
            onComplete={handleSessionComplete}
          />
        ) : activeTab === 'vocab' ? (
          <VocabLab
            cards={vocabCards}
            muted={muted}
            onToggleMastered={handleToggleMastered}
            onEarnXp={handleEarnVocabXp}
          />
        ) : activeTab === 'diagnostic' ? (
          <DiagnosticCoachView
            weeklyData={weeklyData}
            currentXp={xp}
            muted={muted}
            onStartTimedDiagnostic={startTimedDiagnostic}
            onPracticeWeakness={startWeaknessDrill}
          />
        ) : (
          /* Overview Dashboard: Daily Mission + Gamification Hub */
          <div className="space-y-6 pb-20 md:pb-6">
            {/* 1. TOEIC 800 Ladder XP + Streak Module */}
            <RankProgressTrack
              currentXp={xp}
              estimatedScore={estimatedScore}
              streakDays={streakDays}
              freezeShields={freezeShields}
              rankTiers={RANK_TIERS}
              weeklyData={weeklyData}
              todayCompleted={todayCompleted}
              onOpenBlueprint={() => setBlueprintOpen(true)}
            />

            {/* 2. Daily Mission Selector & Progress */}
            <DailyMissionDeck
              tiers={MISSION_TIERS}
              selectedTierId={selectedTierId}
              onSelectTier={setSelectedTierId}
              completedCountToday={completedCountToday}
              todayCompleted={todayCompleted}
              onStartMission={startMission}
              onTriggerCelebrationDemo={handleTriggerCelebrationDemo}
            />

            {/* 3. Secondary Row: Weekly Trend + Quick Modules (Vocab & Diagnostic) */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left 7 cols: Recharts Mini Trend + Partner Badge + AI Owl Coach */}
              <section className="flex flex-col justify-between rounded-2xl border border-[#1e2636] bg-[#111622] p-5 sm:p-6 lg:col-span-7">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-xs font-medium text-[#8b98b1]">
                      本週學習節奏與夥伴進化
                    </p>
                    <h2 className="mt-1 font-display text-lg font-bold text-white">
                      7 日實戰經驗累積
                    </h2>
                  </div>
                  <div className="flex flex-col items-end gap-2 sm:w-64">
                    <PartnerEvolutionBadge currentXp={xp} compact />
                  </div>
                </div>

                <div className="mt-4 h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={weeklyData}
                      margin={{ top: 6, right: 6, left: 6, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="overviewXp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.32} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#1e2636"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="day"
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0e131d',
                          borderColor: '#263044',
                          borderRadius: '10px',
                          fontSize: '12px',
                          color: '#e6edf7',
                        }}
                        formatter={(value) => [`${value ?? 0} XP`, '當日獲得']}
                      />
                      <Area
                        type="monotone"
                        dataKey="xp"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#overviewXp)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* AI Owl Coach Block with Generated 3D Tech Owl Illustration */}
                <div className="mt-4 flex flex-col justify-between gap-4 border-t border-[#1e2636] pt-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3.5">
                    <OwlCoachPortrait sizeClass="h-14 w-14" />
                    <div className="text-xs">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-[#f59e0b]">
                        <TrendingUp className="h-3.5 w-3.5" />
                        AI 貓頭鷹教練建議補強：{topWeakness.area}
                      </span>
                      <p className="mt-0.5 text-[#8b98b1]">
                        {topWeakness.part} · 正確率 {topWeakness.accuracy}% · 建議優先練習
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('diagnostic')}
                        className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-[#60a5fa] hover:text-[#93c5fd]"
                      >
                        <span>檢視完整弱項與柴犬教練</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      startWeaknessDrill(
                        topWeakness.categoryFilter,
                        `弱項特訓：${topWeakness.area}`
                      )
                    }
                    className="inline-flex min-h-[42px] shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[#263044] bg-[#171d2c] px-4 py-2 text-xs font-semibold text-[#e6edf7] transition-all duration-150 hover:border-[#3b82f6] active:scale-[0.95] whitespace-nowrap"
                  >
                    <Target className="h-3.5 w-3.5 text-[#60a5fa]" />
                    <span>針對弱項練 4 題</span>
                  </button>
                </div>
              </section>

              {/* Right 5 cols: Vocab Lab & Timed Diagnostic Quick Launcher */}
              <section className="flex flex-col justify-between rounded-2xl border border-[#1e2636] bg-[#111622] p-5 sm:p-6 lg:col-span-5">
                <div>
                  <p className="text-xs font-medium text-[#8b98b1]">
                    專項訓練與限時檢定
                  </p>
                  <h2 className="mt-1 font-display text-lg font-bold text-white">
                    核心功能快捷切換
                  </h2>

                  <div className="mt-5 divide-y divide-[#1e2636]">
                    {/* Vocab Shortcut Row */}
                    <div className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <BookOpen className="h-4 w-4 text-[#60a5fa]" />
                          <span className="text-sm font-semibold text-white">
                            單字背誦與測驗室
                          </span>
                        </div>
                        <span className="font-mono text-xs text-[#10b981] tabular-nums">
                          {masteredVocabCount} / {vocabCards.length} 已熟記
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-[#8b98b1]">
                        字卡記憶、克漏字、聽音選字與聽音拼字，全程支援 1–4 鍵快速作答。
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('vocab')}
                        className="mt-3 inline-flex min-h-[42px] w-full items-center justify-between rounded-xl border border-[#263044] bg-[#0e131d] px-4 py-2 text-xs font-semibold text-[#e6edf7] transition-colors hover:border-[#3b82f6]/60 hover:bg-[#151c2c] active:scale-[0.99]"
                      >
                        <span>進入單字測驗室</span>
                        <ArrowRight className="h-3.5 w-3.5 text-[#60a5fa]" />
                      </button>
                    </div>

                    {/* Diagnostic Shortcut Row */}
                    <div className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Timer className="h-4 w-4 text-[#f59e0b]" />
                          <span className="text-sm font-semibold text-white">
                            限時模擬診斷
                          </span>
                        </div>
                        <span className="font-mono text-xs text-[#8b98b1] tabular-nums">
                          8 分鐘 · 8 題
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-[#8b98b1]">
                        模擬實戰時間壓力，精準抓出 Part 5 文法與 Part 7 閱讀的時間瓶頸。
                      </p>
                      <button
                        type="button"
                        onClick={startTimedDiagnostic}
                        className="mt-3 inline-flex min-h-[42px] w-full items-center justify-between rounded-xl border border-[#263044] bg-[#0e131d] px-4 py-2 text-xs font-semibold text-[#e6edf7] transition-colors hover:border-[#f59e0b]/60 hover:bg-[#151c2c] active:scale-[0.99]"
                      >
                        <span>立即開始限時診斷</span>
                        <ArrowRight className="h-3.5 w-3.5 text-[#f59e0b]" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#1e2636] pt-4 text-xs text-[#8b98b1]">
                  <span className="inline-flex items-center gap-1.5">
                    <Compass className="h-3.5 w-3.5 text-[#60a5fa]" />
                    建議優先：先完成今日 15 分鐘任務
                  </span>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <MissionCelebrationModal
        result={celebrationResult}
        previousXp={previousXpSnapshot}
        newXp={xp}
        streakDays={streakDays}
        rankTiers={RANK_TIERS}
        onClose={() => setCelebrationResult(null)}
        onPracticeWeakness={() => {
          setCelebrationResult(null);
          setActiveTab('diagnostic');
        }}
      />

      <GamificationBlueprintModal
        open={blueprintOpen}
        onClose={() => setBlueprintOpen(false)}
      />
    </div>
  );
}
