import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getParticipantDetail(alias: string, requestingUserId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { alias },
      include: {
        registration: true,
        predictions: {
          include: {
            match: {
              include: {
                homeTeam: true,
                awayTeam: true,
                stage: true,
                group: true,
                score: true,
              },
            },
            predictedPenaltyWinner: true,
          },
          orderBy: { match: { scheduledAt: 'asc' } },
        },
      },
    });

    if (!user) throw new NotFoundException('Participant not found');

    const totalPoints = user.predictions.reduce(
      (sum, p) => sum + (p.points ?? 0),
      0,
    );

    return {
      id: user.id,
      alias: user.alias,
      totalPoints,
      ...(requestingUserId ? { name: user.name } : {}),
      predictions: user.predictions,
    };
  }

  getMe(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { registration: true },
    });
  }
}
