import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { ApiKeyGuard } from '../auth/api-key.guard';
import type { ContractEvent } from './events.types';

@Controller('/api/v1/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('historical')
  @UseGuards(ApiKeyGuard)
  async getHistoricalEvents(
    @Query('fromBlock') fromBlock?: string,
    @Query('toBlock') toBlock?: string
  ) {
    const from = fromBlock ? parseInt(fromBlock, 10) : 'latest';
    const to = toBlock ? parseInt(toBlock, 10) : 'latest';

    // return this.eventsService.getHistoricalEvents(from, to);
  }
}
