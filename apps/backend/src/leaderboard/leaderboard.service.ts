import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(private prisma: PrismaService) {}

  async getTop10() {
    const rows = await this.getRanked();
    return { top10: rows.slice(0, 10), total: rows.length };
  }

  async getAll() {
    return { participants: await this.getRanked() };
  }

  private async getRanked() {
    const users = await this.prisma.user.findMany({
      where: {
        registration: { status: 'CONFIRMED' },
      },
      select: {
        id: true,
        alias: true,
        predictions: { select: { points: true } },
      },
    });

    const totals = users.map((u) => ({
      id: u.id,
      alias: u.alias,
      totalPoints: u.predictions.reduce((sum, p) => sum + (p.points ?? 0), 0),
    }));

    totals.sort((a, b) => b.totalPoints - a.totalPoints);

    let rank = 1;
    return totals.map((u, i) => {
      if (i > 0 && totals[i - 1].totalPoints !== u.totalPoints) rank = i + 1;
      return { ...u, rank };
    });
  }
}
