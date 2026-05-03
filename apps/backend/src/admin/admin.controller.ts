import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AdminService } from './admin.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('admin')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('registrations/pending')
  getPending() {
    return this.admin.getPendingRegistrations();
  }

  @Patch('registrations/:userId/confirm')
  confirm(@Param('userId') userId: string) {
    return this.admin.confirmRegistration(userId);
  }

  @Post('matches')
  createMatch(@Body() dto: CreateMatchDto) {
    return this.admin.createMatch(dto);
  }

  @Patch('matches/:id')
  updateMatch(@Param('id') id: string, @Body() dto: Partial<CreateMatchDto>) {
    return this.admin.updateMatch(id, dto);
  }

  @Get('participants')
  getParticipants() {
    return this.admin.getAllParticipants();
  }
}
