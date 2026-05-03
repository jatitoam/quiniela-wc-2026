import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StagesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.stage.findMany({
      include: {
        matches: {
          include: {
            homeTeam: true,
            awayTeam: true,
            group: true,
            score: true,
          },
          orderBy: { scheduledAt: 'asc' },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.stage.findUniqueOrThrow({
      where: { id },
      include: {
        matches: {
          include: { homeTeam: true, awayTeam: true, group: true, score: true },
          orderBy: { scheduledAt: 'asc' },
        },
      },
    });
  }

  async getWindowStatus(stageId: string) {
    const firstMatch = await this.prisma.match.findFirst({
      where: { stageId },
      orderBy: { scheduledAt: 'asc' },
      select: { scheduledAt: true },
    });
    if (!firstMatch) return { open: false, closesAt: null };
    const now = new Date();
    return {
      open: now < firstMatch.scheduledAt,
      closesAt: firstMatch.scheduledAt,
    };
  }
}
