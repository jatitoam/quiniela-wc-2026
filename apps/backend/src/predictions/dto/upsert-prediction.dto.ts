import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpsertPredictionDto {
  @IsString()
  matchId: string;

  @IsInt()
  @Min(0)
  homeGoals: number;

  @IsInt()
  @Min(0)
  awayGoals: number;

  @IsOptional()
  @IsBoolean()
  predictedExtraTime?: boolean;

  @IsOptional()
  @IsString()
  predictedPenaltyWinnerId?: string | null;
}
