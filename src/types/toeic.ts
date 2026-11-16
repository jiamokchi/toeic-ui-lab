export type NavTab = 'overview' | 'mission' | 'vocab' | 'diagnostic';

export type MissionTierId = '5m' | '15m' | '30m';

export type QuestionCategory = 'vocab' | 'reading' | 'listening';

export type QuestionFormat =
  | 'cloze'
  | 'reading-comp'
  | 'listening-choice'
  | 'spelling';

export interface RankTier {
  id: string;
  targetScore: number;
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
  baseXp: number;
  recommended?: boolean;
}

export interface ToeicQuestion {
  id: string;
  category: QuestionCategory;
  format: QuestionFormat;
  partLabel: string;
  difficulty: 600 | 700 | 800;
  passage?: string;
  passageHeader?: string;
  prompt: string;
  audioScript?: string;
  options?: string[];
  correctIndex?: number;
  correctSpelling?: string;
  phonetic?: string;
  meaning?: string;
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
  exampleZh: string;
  level: 650 | 750 | 800;
  mastered: boolean;
}

export interface DailyProgressDay {
  day: string;
  date: string;
  xp: number;
  accuracy: number;
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

export interface SessionResult {
  missionTitle: string;
  totalAnswered: number;
  correctCount: number;
  peakCombo: number;
  baseXpEarned: number;
  comboBonusXp: number;
  completionBonusXp: number;
  totalXpEarned: number;
  elapsedSeconds: number;
  isDailyMission: boolean;
}
