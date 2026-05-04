import { Controller, Get, Param, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: { id: string }) {
    return this.users.getMe(user.id);
  }

  @Public()
  @Get(':alias')
  getParticipant(
    @Param('alias') alias: string,
    @Request() req: { user?: { id: string } },
  ) {
    return this.users.getParticipantDetail(alias, req.user?.id);
  }
}
