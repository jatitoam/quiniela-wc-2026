import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StagesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const now = new Date();
    const stages = await this.prisma.stage.findMany({
      include: {
        matches: {
          include: { homeTeam: true, awayTeam: true, group: true, score: true },
          orderBy: { scheduledAt: 'asc' },
        },
      },
      orderBy: { id: 'asc' },
    });

    return stages.map((stage) => {
      const firstMatch = stage.matches[0] ?? null;
      return {
        ...stage,
        windowOpen: firstMatch != null && now < firstMatch.scheduledAt,
        windowClosesAt: firstMatch?.scheduledAt.toISOString() ?? null,
      };
    });
  }

  async findOne(id: string) {
    const now = new Date();
    const stage = await this.prisma.stage.findUniqueOrThrow({
      where: { id },
      include: {
        matches: {
          include: { homeTeam: true, awayTeam: true, group: true, score: true },
          orderBy: { scheduledAt: 'asc' },
        },
      },
    });

    const firstMatch = stage.matches[0] ?? null;
    return {
      ...stage,
      windowOpen: firstMatch != null && now < firstMatch.scheduledAt,
      windowClosesAt: firstMatch?.scheduledAt.toISOString() ?? null,
    };
  }
}
