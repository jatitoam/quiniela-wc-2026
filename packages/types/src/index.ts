// ─── Enums ───────────────────────────────────────────────────────────────────

export type UserRole = 'PARTICIPANT' | 'ADMIN';

export type RegistrationStatus = 'PENDING' | 'CONFIRMED';

export type StageType = 'GROUP' | 'KNOCKOUT';

export type StageName =
  | 'GROUP_STAGE'
  | 'ROUND_OF_32'
  | 'ROUND_OF_16'
  | 'QUARTER_FINALS'
  | 'SEMI_FINALS'
  | 'THIRD_PLACE'
  | 'FINAL';

// ─── User & Registration ─────────────────────────────────────────────────────

export interface UserDto {
  id: string;
  email: string;
  name: string;
  alias: string;
  roles: UserRole[];
  registration: RegistrationDto | null;
  createdAt: string;
}

export interface PublicParticipantDto {
  id: string;
  alias: string;
  totalPoints: number;
  rank: number;
}

export interface ParticipantDetailDto extends PublicParticipantDto {
  /** Only included for logged-in users */
  name?: string;
  email?: string;
  predictions: PredictionSummaryDto[];
}

export interface RegistrationDto {
  id: string;
  status: RegistrationStatus;
  createdAt: string;
  confirmedAt: string | null;
}

// ─── Tournament structure ────────────────────────────────────────────────────

export interface TeamDto {
  id: string;
  name: string;
  code: string;
  flagUrl: string | null;
}

export interface GroupDto {
  id: string;
  name: string;
  teams: TeamDto[];
}

export interface StageDto {
  id: string;
  name: StageName;
  type: StageType;
  matches: MatchDto[];
  windowOpen: boolean;
  windowClosesAt: string | null;
}

export interface MatchDto {
  id: string;
  stageId: string;
  stageName: StageName;
  homeTeam: TeamDto;
  awayTeam: TeamDto;
  scheduledAt: string;
  group: GroupDto | null;
  score: ScoreDto | null;
}

export interface ScoreDto {
  homeGoals: number;
  awayGoals: number;
  /** Knockout only */
  hadExtraTime: boolean | null;
  /** Knockout only */
  hadPenalties: boolean | null;
  /** Knockout only — id of winning team */
  penaltyWinnerId: string | null;
  /** ISO timestamp of entry; null if correction window still open */
  lockedAt: string | null;
}

// ─── Predictions ─────────────────────────────────────────────────────────────

export interface GroupPredictionDto {
  matchId: string;
  homeGoals: number;
  awayGoals: number;
}

export interface KnockoutPredictionDto {
  matchId: string;
  homeGoals: number;
  awayGoals: number;
  /** Always required for knockout matches */
  predictedExtraTime: boolean;
  /** Only present when predicted score is a draw (implying penalties) */
  predictedPenaltyWinnerId: string | null;
}

export type UpsertPredictionDto = GroupPredictionDto | KnockoutPredictionDto;

export interface PredictionSummaryDto {
  matchId: string;
  scheduledAt: string;
  homeTeam: TeamDto;
  awayTeam: TeamDto;
  homeGoals: number | null;
  awayGoals: number | null;
  predictedExtraTime: boolean | null;
  predictedPenaltyWinnerId: string | null;
  score: ScoreDto | null;
  points: number | null;
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export interface LeaderboardDto {
  top10: PublicParticipantDto[];
  total: number;
}

export interface LeaderboardAllDto {
  participants: PublicParticipantDto[];
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  alias: string;
}

export interface AuthResponseDto {
  accessToken: string;
  user: UserDto;
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export interface AdminConfirmRegistrationDto {
  userId: string;
}

export interface AdminCreateMatchDto {
  stageId: string;
  homeTeamId: string;
  awayTeamId: string;
  scheduledAt: string;
  groupId?: string;
}

export interface AdminEnterScoreDto {
  matchId: string;
  homeGoals: number;
  awayGoals: number;
  hadExtraTime?: boolean;
  hadPenalties?: boolean;
  penaltyWinnerId?: string;
}
