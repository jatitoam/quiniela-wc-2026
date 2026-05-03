import { Body, Controller, Put, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ScoresService } from './scores.service';
import { EnterScoreDto } from './dto/enter-score.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('scores')
@UseGuards(RolesGuard)
export class ScoresController {
  constructor(private scores: ScoresService) {}

  @Roles(UserRole.ADMIN)
  @Put()
  enter(@Body() dto: EnterScoreDto) {
    return this.scores.enter(dto);
  }
}
