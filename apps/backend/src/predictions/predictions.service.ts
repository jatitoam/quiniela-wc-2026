import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RegistrationStatus, StageType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertPredictionDto } from './dto/upsert-prediction.dto';

@Injectable()
export class PredictionsService {
  constructor(private prisma: PrismaService) {}

  async upsert(userId: string, dto: UpsertPredictionDto) {
    const [user, match] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
        include: { registration: true },
      }),
      this.prisma.match.findUniqueOrThrow({
        where: { id: dto.matchId },
        include: { stage: true, score: true },
      }),
    ]);

    if (user.registration?.status !== RegistrationStatus.CONFIRMED) {
      throw new ForbiddenException('Registration not confirmed');
    }

    const firstMatch = await this.prisma.match.findFirst({
      where: { stageId: match.stageId },
      orderBy: { scheduledAt: 'asc' },
      select: { scheduledAt: true },
    });

    if (!firstMatch || new Date() >= firstMatch.scheduledAt) {
      throw new BadRequestException('Prediction window is closed for this stage');
    }

    if (match.stage.type === StageType.KNOCKOUT) {
      this.validateKnockoutPrediction(dto);
    }

    return this.prisma.prediction.upsert({
      where: { userId_matchId: { userId, matchId: dto.matchId } },
      create: {
        userId,
        matchId: dto.matchId,
        homeGoals: dto.homeGoals,
        awayGoals: dto.awayGoals,
        predictedExtraTime: 'predictedExtraTime' in dto ? dto.predictedExtraTime : null,
        predictedPenaltyWinnerId: 'predictedPenaltyWinnerId' in dto ? dto.predictedPenaltyWinnerId : null,
      },
      update: {
        homeGoals: dto.homeGoals,
        awayGoals: dto.awayGoals,
        predictedExtraTime: 'predictedExtraTime' in dto ? dto.predictedExtraTime : null,
        predictedPenaltyWinnerId: 'predictedPenaltyWinnerId' in dto ? dto.predictedPenaltyWinnerId : null,
        points: null,
      },
    });
  }

  async findForUser(userId: string, stageId?: string) {
    const predictions = await this.prisma.prediction.findMany({
      where: {
        userId,
        ...(stageId && { match: { stageId } }),
      },
      include: {
        match: {
          include: { homeTeam: true, awayTeam: true, score: true },
        },
      },
      orderBy: { match: { scheduledAt: 'asc' } },
    });

    return predictions.map((p) => ({
      matchId: p.matchId,
      scheduledAt: p.match.scheduledAt.toISOString(),
      homeTeam: p.match.homeTeam,
      awayTeam: p.match.awayTeam,
      homeGoals: p.homeGoals,
      awayGoals: p.awayGoals,
      predictedExtraTime: p.predictedExtraTime,
      predictedPenaltyWinnerId: p.predictedPenaltyWinnerId,
      score: p.match.score
        ? {
            homeGoals: p.match.score.homeGoals,
            awayGoals: p.match.score.awayGoals,
            hadExtraTime: p.match.score.hadExtraTime,
            hadPenalties: p.match.score.hadPenalties,
            penaltyWinnerId: p.match.score.penaltyWinnerId,
            lockedAt: p.match.score.lockedAt?.toISOString() ?? null,
          }
        : null,
      points: p.points,
    }));
  }

  async findForMatch(matchId: string, requestingUserId?: string) {
    const match = await this.prisma.match.findUniqueOrThrow({
      where: { id: matchId },
      include: { stage: true },
    });

    if (!match) throw new NotFoundException('Match not found');

    const firstMatch = await this.prisma.match.findFirst({
      where: { stageId: match.stageId },
      orderBy: { scheduledAt: 'asc' },
      select: { scheduledAt: true },
    });

    const windowClosed = firstMatch && new Date() >= firstMatch.scheduledAt;

    return this.prisma.prediction.findMany({
      where: {
        matchId,
        ...(windowClosed ? {} : { userId: requestingUserId }),
      },
      include: { user: { select: { alias: true } }, predictedPenaltyWinner: true },
    });
  }

  private validateKnockoutPrediction(dto: UpsertPredictionDto) {
    if (!('predictedExtraTime' in dto) || dto.predictedExtraTime === null || dto.predictedExtraTime === undefined) {
      throw new BadRequestException('Knockout predictions require predictedExtraTime');
    }
    const isTieScore = dto.homeGoals === dto.awayGoals;
    if (isTieScore && dto.predictedExtraTime) {
      if (!('predictedPenaltyWinnerId' in dto) || !dto.predictedPenaltyWinnerId) {
        throw new BadRequestException('Tie prediction with ET requires a predicted penalty winner');
      }
    }
    if (!isTieScore && 'predictedPenaltyWinnerId' in dto && dto.predictedPenaltyWinnerId) {
      throw new BadRequestException('Penalty winner only applies to tie predictions');
    }
  }
}
