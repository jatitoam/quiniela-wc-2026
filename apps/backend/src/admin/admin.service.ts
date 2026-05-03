import { Injectable, NotFoundException } from '@nestjs/common';
import { RegistrationStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ── Registrations ──────────────────────────────────────────────────────────

  getPendingRegistrations() {
    return this.prisma.registration.findMany({
      where: { status: RegistrationStatus.PENDING },
      include: { user: { select: { id: true, name: true, email: true, alias: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async confirmRegistration(userId: string) {
    const reg = await this.prisma.registration.findUnique({ where: { userId } });
    if (!reg) throw new NotFoundException('Registration not found');

    return this.prisma.$transaction([
      this.prisma.registration.update({
        where: { userId },
        data: { status: RegistrationStatus.CONFIRMED, confirmedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { roles: { push: UserRole.PARTICIPANT } },
      }),
    ]);
  }

  // ── Matches ────────────────────────────────────────────────────────────────

  createMatch(dto: CreateMatchDto) {
    return this.prisma.match.create({
      data: {
        stageId: dto.stageId,
        homeTeamId: dto.homeTeamId,
        awayTeamId: dto.awayTeamId,
        scheduledAt: new Date(dto.scheduledAt),
        groupId: dto.groupId ?? null,
      },
      include: { homeTeam: true, awayTeam: true, stage: true, group: true },
    });
  }

  updateMatch(id: string, dto: Partial<CreateMatchDto>) {
    return this.prisma.match.update({
      where: { id },
      data: {
        ...(dto.homeTeamId && { homeTeamId: dto.homeTeamId }),
        ...(dto.awayTeamId && { awayTeamId: dto.awayTeamId }),
        ...(dto.scheduledAt && { scheduledAt: new Date(dto.scheduledAt) }),
      },
      include: { homeTeam: true, awayTeam: true, stage: true },
    });
  }

  // ── Users ──────────────────────────────────────────────────────────────────

  getAllParticipants() {
    return this.prisma.user.findMany({
      where: { registration: { status: RegistrationStatus.CONFIRMED } },
      select: {
        id: true,
        name: true,
        alias: true,
        email: true,
        roles: true,
        registration: { select: { status: true, confirmedAt: true } },
      },
      orderBy: { alias: 'asc' },
    });
  }
}
