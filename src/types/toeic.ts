export type NavTab = 'overview' | 'mission' | 'vocab' | 'diagnostic';

export type DiagnosticSubTab = 'coach' | 'review' | 'weekly';

export type MissionTierId = '5m' | '15m' | '30m';

export type QuestionCategory = 'vocab' | 'reading' | 'listening';

export type QuestionFormat =
  | 'cloze'
  | 'reading-comp'
  | 'listening-choice'
  | 'spelling';

export type VocabQuizMode =
  | 'flashcard'
  | 'cloze'
  | 'en-to-zh'
  | 'zh-to-en'
  | 'audio-choice'
  | 'spelling';

export type PlaybackRate = 0.9 | 1.0 | 1.15;

export interface RankTier {
  id: string;
  level: number;
  targetLabel: string;
  title: string;
  subtitle: string;
  minXp: number;
  perk: string;
}

export interface MissionTier {
  id: MissionTierId;
  durationMinutes: number;
  title: string;
  subtitle: string;
  totalQuestions: number;
  breakdown: {
    vocab: number;
    reading: number;
    listening: number;
  };
  maxXp: number;
  recommended?: boolean;
}

export interface ToeicQuestion {
  id: string;
  category: QuestionCategory;
  format: QuestionFormat;
  partLabel: string;
  difficulty: 500 | 650 | 750 | 800;
  passage?: string;
  passageHeader?: string;
  prompt: string;
  hint: string;
  audioScript?: string;
  options?: string[];
  correctIndex?: number;
  explanation: string;
  weaknessTag: string;
}

export interface VocabCard {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  meaning: string;
  exampleEn: string;
  exampleCloze: string;
  exampleZh: string;
  level: 650 | 750 | 800;
  mastered: boolean;
  zhDistractors: string[];
  enDistractors: string[];
}

export interface DailyProgressDay {
  day: string;
  date: string;
  xp: number;
  accuracy: number;
  answered: number;
  minutes: number;
  completed: boolean;
}

export interface WeaknessItem {
  id: string;
  area: string;
  part: string;
  accuracy: number;
  avgSeconds: number;
  targetSeconds: number;
  insight: string;
  recommendedAction: string;
  categoryFilter: QuestionCategory;
}

export interface ReviewQueueItem {
  id: string;
  questionId: string;
  partLabel: string;
  weaknessTag: string;
  promptPreview: string;
  dueLabel: string;
  wrongCount: number;
}

export interface SessionResult {
  missionTitle: string;
  totalAnswered: number;
  correctCount: number;
  independentCorrectCount: number;
  hintedCorrectCount: number;
  peakCombo: number;
  questionXpEarned: number;
  masteryBonusXp: number;
  fullAttendanceBonusXp: number;
  totalXpEarned: number;
  elapsedSeconds: number;
  isDailyMission: boolean;
  supplyRewardLabel: string;
}

export interface ArcadeResult {
  totalAnswered: number;
  correctCount: number;
  peakCombo: number;
  score: number;
  isNewBest: boolean;
}
