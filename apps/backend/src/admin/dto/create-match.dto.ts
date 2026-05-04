import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class CreateMatchDto {
  @IsString()
  stageId: string;

  @IsString()
  homeTeamId: string;

  @IsString()
  awayTeamId: string;

  @IsISO8601()
  scheduledAt: string;

  @IsOptional()
  @IsString()
  groupId?: string;
}
