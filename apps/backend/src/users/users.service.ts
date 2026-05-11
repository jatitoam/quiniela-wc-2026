import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { deriveLockedAt } from '../scores/score-lock.util';

@Injectable()
export class UsersService {
  private readonly lockMinutes: number;

  constructor(private prisma: PrismaService, private config: ConfigService) {
    this.lockMinutes = parseInt(this.config.get<string>('SCORE_LOCK_MINUTES', '30'), 10);
  }

  async getParticipantDetail(alias: string, requestingUserId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { alias },
      include: {
        registration: true,
        predictions: {
          include: {
            match: {
              include: { homeTeam: true, awayTeam: true, score: true },
            },
          },
          orderBy: { match: { scheduledAt: 'asc' } },
        },
      },
    });

    if (!user) throw new NotFoundException('Participant not found');

    const totalPoints = user.predictions.reduce((sum, p) => sum + (p.points ?? 0), 0);
    const rank = await this.computeRank(user.id, totalPoints);

    return {
      id: user.id,
      alias: user.alias,
      totalPoints,
      rank,
      ...(requestingUserId ? { name: user.name } : {}),
      predictions: user.predictions.map((p) => ({
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
              lockedAt: deriveLockedAt(p.match.score.enteredAt, this.lockMinutes)?.toISOString() ?? null,
            }
          : null,
        points: p.points,
      })),
    };
  }

  getMe(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { registration: true },
    });
  }

  private async computeRank(userId: string, totalPoints: number): Promise<number> {
    const allUsers = await this.prisma.user.findMany({
      where: { registration: { status: 'CONFIRMED' } },
      select: { id: true, predictions: { select: { points: true } } },
    });

    const sorted = allUsers
      .map((u) => ({
        id: u.id,
        pts: u.predictions.reduce((s, p) => s + (p.points ?? 0), 0),
      }))
      .sort((a, b) => b.pts - a.pts);

    let rank = 1;
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i - 1].pts !== sorted[i].pts) rank = i + 1;
      if (sorted[i].id === userId) return rank;
    }
    return rank;
  }
}
