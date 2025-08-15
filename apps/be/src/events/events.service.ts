import {Inject, Injectable} from "@nestjs/common";
import type {ContractEvent} from "./events.types";
import {EventsRepository} from "./events.repository";
import {CONFIG_PROVIDER} from "../config/config.provider";
import type {AppConfig} from "../config/config.types";
import {EthService} from "../eth/eth.service";

@Injectable()
export class EventsService {

	constructor(
		private readonly eventsRepository: EventsRepository,
		@Inject(CONFIG_PROVIDER) private config: AppConfig,
		private readonly ethService: EthService
	) {}

	async getByAddress(address: string): Promise<any[]> {
		return this.eventsRepository.getEventsByAddress(address);
	}

	async getRange(fromBlock?: number, toBlock?: number): Promise<ContractEvent[]> {
		if(!fromBlock) {
			fromBlock = this.config.ethConfig.startBlock;
		}

		if (!toBlock) {
			toBlock = await this.ethService.getCurrentBlockNumber()
		}

		const events = await this.eventsRepository.getEventsByBlockRange(fromBlock, toBlock);

		return events.map(event => ({
			eventType: event.eventType,
			blockNumber: event.blockNumber,
			transactionHash: event.transactionHash,
			logIndex: 0,
			timestamp: event.timestamp,
			...event.toObject(),
		})) as ContractEvent[];
	}

	async getAll(): Promise<ContractEvent[]> {
		const events = await this.eventsRepository.getAllEvents();

		return events.map(event => ({
			eventType: event.eventType,
			blockNumber: event.blockNumber,
			transactionHash: event.transactionHash,
			logIndex: 0,
			timestamp: event.timestamp,
			...event.toObject(),
		})) as ContractEvent[];
	}

}