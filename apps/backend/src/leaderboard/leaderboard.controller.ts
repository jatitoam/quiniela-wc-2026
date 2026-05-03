import { Controller, Get } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { Public } from '../common/decorators/public.decorator';

@Public()
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private leaderboard: LeaderboardService) {}

  @Get()
  getTop10() {
    return this.leaderboard.getTop10();
  }

  @Get('all')
  getAll() {
    return this.leaderboard.getAll();
  }
}
