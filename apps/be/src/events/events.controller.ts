import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EventsListener } from './events.listener';
import { ApiKeyGuard } from '../auth/api-key.guard';
import type { ContractEvent } from './events.types';
import {EventsService} from "./events.service";

@Controller('/api/v1/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

	@Get('')
	async getAllEvents(): Promise<ContractEvent[]> {
		return this.eventsService.getAll();
	}

  @Get('blockRange')
  async getHistoricalEvents(
    @Query('fromBlock') fromBlock?: string,
    @Query('toBlock') toBlock?: string
  ) {
    const from = fromBlock ? parseInt(fromBlock, 10) : undefined;
    const to = toBlock ? parseInt(toBlock, 10) : undefined;

    return this.eventsService.getRange(from, to);
  }

	@Get('address')
	async getEventsByAddress(@Query('address') address: string): Promise<ContractEvent[]> {
		if (!address) {
			throw new Error('Address query parameter is required');
		}
		return this.eventsService.getByAddress(address);
	}
}
