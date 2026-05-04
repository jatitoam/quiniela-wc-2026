import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { UpsertPredictionDto } from './dto/upsert-prediction.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('predictions')
export class PredictionsController {
  constructor(private predictions: PredictionsService) {}

  @Put()
  upsert(
    @CurrentUser() user: { id: string },
    @Body() dto: UpsertPredictionDto,
  ) {
    return this.predictions.upsert(user.id, dto);
  }

  @Get('me')
  findMine(
    @CurrentUser() user: { id: string },
    @Query('stageId') stageId?: string,
  ) {
    return this.predictions.findForUser(user.id, stageId);
  }
}
