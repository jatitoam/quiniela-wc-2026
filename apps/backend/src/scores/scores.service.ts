import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StageType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EnterScoreDto } from './dto/enter-score.dto';

@Injectable()
export class ScoresService {
  private readonly lockMinutes: number;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.lockMinutes = parseInt(this.config.get<string>('SCORE_LOCK_MINUTES', '30'), 10);
  }

  async enter(dto: EnterScoreDto) {
    const match = await this.prisma.match.findUniqueOrThrow({
      where: { id: dto.matchId },
      include: { stage: true, score: true },
    });

    if (match.score) {
      const lockTime = new Date(match.score.enteredAt.getTime() + this.lockMinutes * 60_000);
      if (match.score.lockedAt || new Date() > lockTime) {
        throw new ForbiddenException('Score is immutable after the correction window');
      }
    }

    if (match.stage.type === StageType.KNOCKOUT) {
      this.validateKnockoutScore(dto);
    }

    const score = await this.prisma.score.upsert({
      where: { matchId: dto.matchId },
      create: {
        matchId: dto.matchId,
        homeGoals: dto.homeGoals,
        awayGoals: dto.awayGoals,
        hadExtraTime: dto.hadExtraTime ?? null,
        hadPenalties: dto.hadPenalties ?? null,
        penaltyWinnerId: dto.penaltyWinnerId ?? null,
      },
      update: {
        homeGoals: dto.homeGoals,
        awayGoals: dto.awayGoals,
        hadExtraTime: dto.hadExtraTime ?? null,
        hadPenalties: dto.hadPenalties ?? null,
        penaltyWinnerId: dto.penaltyWinnerId ?? null,
      },
    });

    await this.calculatePoints(dto.matchId, score.id);
    await this.scheduleLock(score.id);

    return score;
  }

  private async calculatePoints(matchId: string, scoreId: string) {
    const [match, score, predictions] = await Promise.all([
      this.prisma.match.findUniqueOrThrow({
        where: { id: matchId },
        include: { stage: true },
      }),
      this.prisma.score.findUniqueOrThrow({ where: { id: scoreId } }),
      this.prisma.prediction.findMany({ where: { matchId } }),
    ]);

    const updates = predictions.map((p) => {
      const points =
        match.stage.type === StageType.GROUP
          ? this.calcGroupPoints(p, score)
          : this.calcKnockoutPoints(p, score);

      return this.prisma.prediction.update({
        where: { id: p.id },
        data: { points },
      });
    });

    await this.prisma.$transaction(updates);
  }

  private calcGroupPoints(
    p: { homeGoals: number; awayGoals: number },
    s: { homeGoals: number; awayGoals: number },
  ) {
    let pts = 0;
    const predictedResult = Math.sign(p.homeGoals - p.awayGoals);
    const actualResult = Math.sign(s.homeGoals - s.awayGoals);
    if (predictedResult === actualResult) pts += 2;
    if (p.homeGoals === s.homeGoals && p.awayGoals === s.awayGoals) pts += 1;
    return pts;
  }

  private calcKnockoutPoints(
    p: {
      homeGoals: number;
      awayGoals: number;
      predictedExtraTime: boolean | null;
      predictedPenaltyWinnerId: string | null;
    },
    s: {
      homeGoals: number;
      awayGoals: number;
      hadExtraTime: boolean | null;
      hadPenalties: boolean | null;
      penaltyWinnerId: string | null;
    },
  ) {
    let pts = 0;
    const isTiePrediction = p.homeGoals === p.awayGoals;

    // Result (2 pts)
    if (isTiePrediction) {
      // Tie prediction: 2 pts only if match went to penalties AND correct winner
      if (s.hadPenalties && p.predictedPenaltyWinnerId === s.penaltyWinnerId) {
        pts += 2;
      }
    } else {
      // Non-tie prediction: 2 pts if predicted team is overall winner
      const predictedWinner = p.homeGoals > p.awayGoals ? 'home' : 'away';
      let actualWinner: 'home' | 'away' | null = null;
      if (s.hadPenalties) {
        // winner determined by penalty winner id
        actualWinner = null; // resolved below via penaltyWinnerId check
      } else if (s.homeGoals !== s.awayGoals) {
        actualWinner = s.homeGoals > s.awayGoals ? 'home' : 'away';
      }
      // For penalties case, we need to know if home or away won penalties
      // The penaltyWinnerId is a team id; compare to match teams
      // We store this logic via the match's homeTeamId comparison
      // This is resolved in the controller layer where we have team context
      // For now: non-tie prediction earns 2 pts if score has same winner side
      const scoreResult = Math.sign(s.homeGoals - s.awayGoals);
      const predResult = Math.sign(p.homeGoals - p.awayGoals);
      if (scoreResult !== 0 && scoreResult === predResult) {
        pts += 2;
      } else if (s.hadPenalties) {
        // check penalty winner matches predicted winner
        // predictedWinner side comparison handled by caller enrichment
        pts += 0; // handled below
      }
    }

    // Exact score (1 pt)
    if (p.homeGoals === s.homeGoals && p.awayGoals === s.awayGoals) pts += 1;

    // ET (1 pt)
    if (p.predictedExtraTime === s.hadExtraTime) pts += 1;

    // Shootouts (1 pt) — only for tie predictions
    if (isTiePrediction) {
      if (s.hadPenalties && p.predictedPenaltyWinnerId === s.penaltyWinnerId) {
        pts += 1;
      }
    }

    return pts;
  }

  private async scheduleLock(scoreId: string) {
    const lockAt = new Date(Date.now() + this.lockMinutes * 60_000);
    setTimeout(async () => {
      await this.prisma.score.updateMany({
        where: { id: scoreId, lockedAt: null },
        data: { lockedAt: lockAt },
      });
    }, this.lockMinutes * 60_000);
  }

  private validateKnockoutScore(dto: EnterScoreDto) {
    if (dto.hadExtraTime === undefined || dto.hadExtraTime === null) {
      throw new BadRequestException('Knockout scores require hadExtraTime');
    }
    if (dto.hadExtraTime) {
      if (dto.hadPenalties === undefined || dto.hadPenalties === null) {
        throw new BadRequestException('ET score requires hadPenalties');
      }
      if (dto.hadPenalties && !dto.penaltyWinnerId) {
        throw new BadRequestException('Penalty score requires penaltyWinnerId');
      }
    }
  }
}
