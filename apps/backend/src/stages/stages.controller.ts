import { Controller, Get, Param } from '@nestjs/common';
import { StagesService } from './stages.service';
import { Public } from '../common/decorators/public.decorator';

@Public()
@Controller('stages')
export class StagesController {
  constructor(private stages: StagesService) {}

  @Get()
  findAll() {
    return this.stages.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stages.findOne(id);
  }
}
