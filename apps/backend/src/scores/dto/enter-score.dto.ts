import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class EnterScoreDto {
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
  hadExtraTime?: boolean;

  @IsOptional()
  @IsBoolean()
  hadPenalties?: boolean;

  @IsOptional()
  @IsString()
  penaltyWinnerId?: string;
}
