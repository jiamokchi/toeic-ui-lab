/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ArrowRight,
  BookOpen,
  Compass,
  Flame,
  Headphones,
  RefreshCw,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import { ArcadeBlitzRunner } from './components/ArcadeBlitzRunner';
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
  INITIAL_REVIEW_QUEUE,
  INITIAL_WEEKLY_DATA,
  MAX_CAREER_XP,
  MISSION_TIERS,
  QUESTION_BANK,
  RANK_TIERS,
  SKILL_RADAR_BARS,
  VOCAB_DECK,
  WEAKNESS_ITEMS,
} from './data/toeicData';
import {
  ArcadeResult,
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
  mode: 'standard' | 'arcade';
  title: string;
  questions: ToeicQuestion[];
  isDailyMission: boolean;
  timeLimitSeconds?: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [selectedTierId, setSelectedTierId] = useState<MissionTierId>('15m');

  // Prototype Harness State (Formal site injects these from D1 via Props)
  const [xp, setXp] = useState<number>(6820);
  const [previousXpSnapshot, setPreviousXpSnapshot] = useState<number>(6820);
  const [streakDays, setStreakDays] = useState<number>(14);
  const [todayCompleted, setTodayCompleted] = useState<boolean>(false);
  const [completedCountToday, setCompletedCountToday] = useState<number>(4);
  const [answeredTodayIds, setAnsweredTodayIds] = useState<string[]>([]);
  const [weeklyData, setWeeklyData] = useState<DailyProgressDay[]>(INITIAL_WEEKLY_DATA);
  const [vocabCards, setVocabCards] = useState<VocabCard[]>(VOCAB_DECK);
  const [arcadeBestScore, setArcadeBestScore] = useState<number>(1450);

  // Free Practice Mode Filter inside Mission Tab
  const [freePracticeCategory, setFreePracticeCategory] =
    useState<QuestionCategory>('reading');

  // Active Runners & Modals
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [celebrationResult, setCelebrationResult] = useState<SessionResult | null>(null);
  const [blueprintOpen, setBlueprintOpen] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);

  const selectedTier =
    MISSION_TIERS.find((t) => t.id === selectedTierId) ?? MISSION_TIERS[1];

  const startMission = (tier: MissionTier) => {
    const count = Math.min(tier.totalQuestions, QUESTION_BANK.length);
    setActiveSession({
      mode: 'standard',
      title: tier.title,
      questions: QUESTION_BANK.slice(0, count),
      isDailyMission: true,
    });
    setActiveTab('mission');
  };

  const startReadingBaselineCheck = () => {
    setActiveSession({
      mode: 'standard',
      title: '10 題閱讀起點檢查',
      questions: QUESTION_BANK.slice(0, 10),
      isDailyMission: false,
    });
    setActiveTab('mission');
  };

  const startTimedDiagnostic = () => {
    setActiveSession({
      mode: 'standard',
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
      mode: 'standard',
      title,
      questions: pool,
      isDailyMission: false,
    });
    setActiveTab('mission');
  };

  const startReviewQueueDrill = () => {
    const reviewIds = INITIAL_REVIEW_QUEUE.map((r) => r.questionId);
    const pool = QUESTION_BANK.filter((q) => reviewIds.includes(q.id));
    setActiveSession({
      mode: 'standard',
      title: '到期錯題複習',
      questions: pool.length > 0 ? pool : QUESTION_BANK.slice(0, 3),
      isDailyMission: false,
    });
    setActiveTab('mission');
  };

  const startArcadeBlitz = () => {
    setActiveSession({
      mode: 'arcade',
      title: '60 秒街機單字快打',
      questions: [],
      isDailyMission: false,
    });
    setActiveTab('mission');
  };

  const handleSessionComplete = (
    result: SessionResult,
    newlyAnsweredIds: string[]
  ) => {
    setPreviousXpSnapshot(xp);
    // Respect daily 1x limit for +25 XP full-attendance bonus
    const effectiveFullBonus =
      result.isDailyMission && !todayCompleted ? result.fullAttendanceBonusXp : 0;
    const effectiveTotal =
      result.questionXpEarned + result.masteryBonusXp + effectiveFullBonus;

    const adjustedResult: SessionResult = {
      ...result,
      fullAttendanceBonusXp: effectiveFullBonus,
      totalXpEarned: effectiveTotal,
    };

    setXp((prev) => prev + effectiveTotal);
    setAnsweredTodayIds((prev) =>
      Array.from(new Set([...prev, ...newlyAnsweredIds]))
    );

    if (result.isDailyMission && !todayCompleted) {
      setTodayCompleted(true);
      setStreakDays((s) => s + 1);
      setCompletedCountToday(result.totalAnswered);
    }

    setWeeklyData((prev) =>
      prev.map((d) =>
        d.day === '今日'
          ? {
              ...d,
              xp: d.xp + effectiveTotal,
              answered: d.answered + result.totalAnswered,
              accuracy: Math.round(
                (result.correctCount / Math.max(1, result.totalAnswered)) * 100
              ),
              minutes: Math.max(5, Math.round(result.elapsedSeconds / 60)),
              completed: d.completed || result.isDailyMission,
            }
          : d
      )
    );

    setActiveSession(null);
    setCelebrationResult(adjustedResult);
    setActiveTab('overview');
  };

  const handleTriggerCelebrationDemo = (tier: MissionTier) => {
    const questionXp = tier.totalQuestions * 5;
    const masteryBonus = 10;
    const fullAttendance = todayCompleted ? 0 : 25;
    const total = questionXp + masteryBonus + fullAttendance;

    const demoResult: SessionResult = {
      missionTitle: tier.title,
      totalAnswered: tier.totalQuestions,
      correctCount: tier.totalQuestions,
      independentCorrectCount: tier.totalQuestions,
      hintedCorrectCount: 0,
      peakCombo: 6,
      questionXpEarned: questionXp,
      masteryBonusXp: masteryBonus,
      fullAttendanceBonusXp: fullAttendance,
      totalXpEarned: total,
      elapsedSeconds: tier.durationMinutes * 50,
      isDailyMission: true,
      supplyRewardLabel: '精熟補給箱 · 單項 +10 XP 獎勵達成',
    };
    playFeedbackTone('complete', muted);
    handleSessionComplete(demoResult, []);
  };

  const handleArcadeFinish = (res: ArcadeResult) => {
    if (res.score > arcadeBestScore) {
      setArcadeBestScore(res.score);
    }
    const bonusXp = Math.min(10, Math.floor(res.correctCount / 2));
    if (bonusXp > 0) {
      setXp((prev) => prev + bonusXp);
    }
  };

  const handleToggleMastered = (id: string, mastered: boolean) => {
    setVocabCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, mastered } : c))
    );
  };

  const handleEarnVocabXp = (amount: number, itemId: string) => {
    if (answeredTodayIds.includes(itemId)) return;
    setAnsweredTodayIds((prev) => [...prev, itemId]);
    setXp((prev) => prev + amount);
  };

  const masteredVocabCount = vocabCards.filter((c) => c.mastered).length;
  const topWeakness = WEAKNESS_ITEMS[0];

  return (
    <div className="min-h-screen bg-[#0b0e14] text-[#e6edf7]">
      <TopNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveSession(null);
          setActiveTab(tab);
        }}
        onStartPrimaryMission={() => startMission(selectedTier)}
        dailyCompleted={todayCompleted}
      />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Tab 2: 每日任務實戰 (Active Runner OR Daily Schedule + Custom Free Practice Hub) */}
        {activeTab === 'mission' ? (
          activeSession?.mode === 'arcade' ? (
            <ArcadeBlitzRunner
              cards={vocabCards}
              bestScore={arcadeBestScore}
              muted={muted}
              onExit={() => setActiveSession(null)}
              onFinish={handleArcadeFinish}
            />
          ) : activeSession ? (
            <PracticeRunner
              title={activeSession.title}
              questions={activeSession.questions}
              isDailyMission={activeSession.isDailyMission}
              answeredTodayIds={answeredTodayIds}
              timeLimitSeconds={activeSession.timeLimitSeconds}
              currentXp={xp}
              muted={muted}
              onToggleMute={() => setMuted((m) => !m)}
              onExit={() => setActiveSession(null)}
              onComplete={handleSessionComplete}
            />
          ) : (
            /* Daily Mission & Free Practice Hub */
            <div className="space-y-6 pb-20 md:pb-6">
              <DailyMissionDeck
                tiers={MISSION_TIERS}
                selectedTierId={selectedTierId}
                onSelectTier={setSelectedTierId}
                completedCountToday={completedCountToday}
                todayCompleted={todayCompleted}
                onStartMission={startMission}
                onTriggerCelebrationDemo={handleTriggerCelebrationDemo}
              />

              {/* Free Practice & Arcade Blitz Section */}
              <section className="rounded-2xl border border-[#1e2636] bg-[#111622] p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-[#8b98b1]">
                      自訂自由練習與遊戲挑戰
                    </p>
                    <h2 className="mt-1 font-display text-lg font-bold text-white">
                      彈性加練 · 錯題復習 · 60 秒街機快打
                    </h2>
                  </div>

                  {/* Reading / Listening Toggle */}
                  <div className="flex items-center gap-1 rounded-xl border border-[#1e2636] bg-[#0b0e14] p-1">
                    {[
                      { id: 'reading' as const, label: '閱讀練習' },
                      { id: 'listening' as const, label: '聽力練習' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFreePracticeCategory(cat.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                          freePracticeCategory === cat.id
                            ? 'bg-[#3b82f6] text-white'
                            : 'text-[#8b98b1] hover:text-white'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3.5 md:grid-cols-4">
                  <button
                    type="button"
                    onClick={() =>
                      startWeaknessDrill(
                        freePracticeCategory,
                        freePracticeCategory === 'reading'
                          ? '自由閱讀專項練習'
                          : '自由聽力專項練習'
                      )
                    }
                    className="flex min-h-[108px] flex-col justify-between rounded-xl border border-[#222c40] bg-[#0e131d] p-4 text-left transition-all hover:border-[#3b82f6]/60 active:scale-[0.97]"
                  >
                    <Headphones className="h-4 w-4 text-[#60a5fa]" />
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {freePracticeCategory === 'reading' ? '開始閱讀自由練' : '開始聽力自由練'}
                      </div>
                      <p className="mt-1 text-[11px] text-[#8b98b1]">
                        含語速切換與解析
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={startReviewQueueDrill}
                    className="flex min-h-[108px] flex-col justify-between rounded-xl border border-[#222c40] bg-[#0e131d] p-4 text-left transition-all hover:border-[#f59e0b]/60 active:scale-[0.97]"
                  >
                    <RefreshCw className="h-4 w-4 text-[#f59e0b]" />
                    <div>
                      <div className="text-sm font-semibold text-white">
                        先複習到期錯題
                      </div>
                      <p className="mt-1 font-mono text-[11px] text-[#8b98b1] tabular-nums">
                        目前待複習 {INITIAL_REVIEW_QUEUE.length} 題
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={startReadingBaselineCheck}
                    className="flex min-h-[108px] flex-col justify-between rounded-xl border border-[#222c40] bg-[#0e131d] p-4 text-left transition-all hover:border-[#10b981]/60 active:scale-[0.97]"
                  >
                    <Target className="h-4 w-4 text-[#10b981]" />
                    <div>
                      <div className="text-sm font-semibold text-white">
                        10 題閱讀起點檢查
                      </div>
                      <p className="mt-1 text-[11px] text-[#8b98b1]">
                        快速定位 Part 5–7 水準
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={startArcadeBlitz}
                    className="flex min-h-[108px] flex-col justify-between rounded-xl border border-[#f59e0b]/40 bg-[#f59e0b]/5 p-4 text-left transition-all hover:border-[#fbbf24] active:scale-[0.97]"
                  >
                    <Flame className="h-4 w-4 text-[#fbbf24]" />
                    <div>
                      <div className="text-sm font-semibold text-white">
                        60 秒街機快打
                      </div>
                      <p className="mt-1 font-mono text-[11px] text-[#fbbf24] tabular-nums">
                        最高紀錄 {arcadeBestScore.toLocaleString()} 分
                      </p>
                    </div>
                  </button>
                </div>
              </section>
            </div>
          )
        ) : activeTab === 'vocab' ? (
          <VocabLab
            cards={vocabCards}
            answeredTodayIds={answeredTodayIds}
            muted={muted}
            onToggleMastered={handleToggleMastered}
            onEarnXp={handleEarnVocabXp}
          />
        ) : activeTab === 'diagnostic' ? (
          <DiagnosticCoachView
            weeklyData={weeklyData}
            currentXp={xp}
            skillBars={SKILL_RADAR_BARS}
            weaknessItems={WEAKNESS_ITEMS}
            reviewQueue={INITIAL_REVIEW_QUEUE}
            muted={muted}
            onStartTimedDiagnostic={startTimedDiagnostic}
            onPracticeWeakness={startWeaknessDrill}
            onStartReviewQueue={startReviewQueueDrill}
          />
        ) : (
          /* Tab 1: 總覽儀表板 */
          <div className="space-y-6 pb-20 md:pb-6">
            {/* 1. 英雄區 (5-Stage 32,000 XP Adventure Map + Taipei UTC+8 Streak) */}
            <RankProgressTrack
              currentXp={xp}
              maxCareerXp={MAX_CAREER_XP}
              streakDays={streakDays}
              rankTiers={RANK_TIERS}
              weeklyData={weeklyData}
              todayCompleted={todayCompleted}
              onOpenBlueprint={() => setBlueprintOpen(true)}
            />

            {/* 2. 每日任務強度卡 (5m/+55, 15m/+85, 30m/+125) */}
            <DailyMissionDeck
              tiers={MISSION_TIERS}
              selectedTierId={selectedTierId}
              onSelectTier={setSelectedTierId}
              completedCountToday={completedCountToday}
              todayCompleted={todayCompleted}
              onStartMission={startMission}
              onTriggerCelebrationDemo={handleTriggerCelebrationDemo}
            />

            {/* 3. 下排：7 日實戰經驗累積（Recharts）＋ 夥伴進化 ＋ 單字與閱讀起點檢查 */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
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
                  <div className="sm:w-64">
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
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e2636" vertical={false} />
                      <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
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
                        {topWeakness.part} · 正確率 {topWeakness.accuracy}% · 優先修補盲點
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('diagnostic')}
                        className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-[#60a5fa] hover:text-[#93c5fd]"
                      >
                        <span>前往教練診斷與錯題複習</span>
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
                    <span>針對弱項練 5 題</span>
                  </button>
                </div>
              </section>

              {/* Right 5 cols: Vocab Lab & Reading Baseline Check Quick Cards */}
              <section className="flex flex-col justify-between rounded-2xl border border-[#1e2636] bg-[#111622] p-5 sm:p-6 lg:col-span-5">
                <div>
                  <p className="text-xs font-medium text-[#8b98b1]">
                    專項訓練與快速啟動
                  </p>
                  <h2 className="mt-1 font-display text-lg font-bold text-white">
                    單字測驗室與起點檢查
                  </h2>

                  <div className="mt-5 divide-y divide-[#1e2636]">
                    <div className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <BookOpen className="h-4 w-4 text-[#60a5fa]" />
                          <span className="text-sm font-semibold text-white">
                            單字測驗室
                          </span>
                        </div>
                        <span className="font-mono text-xs text-[#10b981] tabular-nums">
                          {masteredVocabCount} / {vocabCards.length} 已熟記
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-[#8b98b1]">
                        字卡背誦與 5 種測驗（克漏字、英選中、中選英、聽音選字、聽音拼字）。
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('vocab')}
                        className="mt-3 inline-flex min-h-[42px] w-full items-center justify-between rounded-xl border border-[#263044] bg-[#0e131d] px-4 py-2 text-xs font-semibold text-[#e6edf7] transition-all hover:border-[#3b82f6]/60 hover:bg-[#151c2c] active:scale-[0.97]"
                      >
                        <span>進入單字測驗室</span>
                        <ArrowRight className="h-3.5 w-3.5 text-[#60a5fa]" />
                      </button>
                    </div>

                    <div className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Target className="h-4 w-4 text-[#10b981]" />
                          <span className="text-sm font-semibold text-white">
                            閱讀起點檢查
                          </span>
                        </div>
                        <span className="font-mono text-xs text-[#8b98b1] tabular-nums">
                          10 題基準測試
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-[#8b98b1]">
                        涵蓋 Part 5 文法與 Part 7 商務閱讀，迅速校正每日任務難度起點。
                      </p>
                      <button
                        type="button"
                        onClick={startReadingBaselineCheck}
                        className="mt-3 inline-flex min-h-[42px] w-full items-center justify-between rounded-xl border border-[#263044] bg-[#0e131d] px-4 py-2 text-xs font-semibold text-[#e6edf7] transition-all hover:border-[#10b981]/60 hover:bg-[#151c2c] active:scale-[0.97]"
                      >
                        <span>開始 10 題閱讀起點檢查</span>
                        <ArrowRight className="h-3.5 w-3.5 text-[#10b981]" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#1e2636] pt-4 text-xs text-[#8b98b1]">
                  <span className="inline-flex items-center gap-1.5">
                    <Compass className="h-3.5 w-3.5 text-[#60a5fa]" />
                    建議節奏：每日課表全勤 +25 XP
                  </span>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>

      <MissionCelebrationModal
        result={celebrationResult}
        previousXp={previousXpSnapshot}
        newXp={xp}
        maxCareerXp={MAX_CAREER_XP}
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
