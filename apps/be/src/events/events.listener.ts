import {Injectable, Logger, OnModuleInit} from '@nestjs/common';
import type {ContractEvent, ContractEventData, EthEventHandler, EventType} from './events.types';
import {EthContractListener} from '../eth/eth-contract.listener';
import {EventsRepository} from './events.repository';

function serializeEventData(obj: any): any {
	return JSON.parse(JSON.stringify(obj, (key, value) =>
		typeof value === 'bigint' ? value.toString() : value
	));
}

const eventsToListen: EventType[] = [
	'UserRegistered',
	'NFTMinted',
	'UserBlacklisted',
	'UserRemovedFromBlacklist',
	'FeesUpdated'
];

@Injectable()
export class EventsListener implements OnModuleInit {
	private readonly logger = new Logger(EventsListener.name);
	private readonly handlers: Map<EventType, EthEventHandler>;

	constructor(
		private readonly eventListener: EthContractListener,
		private readonly eventsRepository: EventsRepository,
	) {
		this.handlers = new Map<EventType, EthEventHandler>();

		eventsToListen.forEach(eventType => {
			this.handlers.set(eventType, this.handleContractEvent.bind(this));
		});

	}

	async onModuleInit() {
		this.startListening()
	}

	startListening() {
		this.eventListener.startEventListening(this.handlers, this.handleContractEvent.bind(this));

		this.logger.log(`Started listening for contract events`);
		this.logger.log('EthContractListener is listening:', this.eventListener.isListening);
	}

	public async handleContractEvent(eventData: ContractEventData): Promise<void> {
		const eventType = eventData.event as EventType;

		try {
			this.logger.log(`Processing ${eventType} event from block ${eventData.blockNumber}`);
			this.logger.log(`Event data: ${JSON.stringify(serializeEventData(eventData), null, 2)}`);

			switch (eventType) {
				case 'UserRegistered':
					await this.handleUserRegistered(eventData);
					break;
				case 'NFTMinted':
					await this.handleNFTMinted(eventData);
					break;
				case 'UserBlacklisted':
					await this.handleUserBlacklisted(eventData);
					break;
				case 'UserRemovedFromBlacklist':
					await this.handleUserRemovedFromBlacklist(eventData);
					break;
				case 'FeesUpdated':
					await this.handleFeesUpdated(eventData);
					break;
				default:
					this.logger.warn(`Unknown event type: ${eventType}`);
					break;
			}
		} catch (error) {
			this.logger.error(`Failed to process ${eventType} event:`, error);
		}
	}

	private async handleUserRegistered(eventData: ContractEventData): Promise<void> {
		const user = eventData.returnValues[0];
		const timestamp = Number(eventData.returnValues[1]);

		this.logger.log(`User registered: ${user} at ${new Date(timestamp * 1000).toISOString()}`);

		await this.eventsRepository.saveUserRegistrationEvent(
			user,
			timestamp,
			eventData.transactionHash,
			eventData.blockNumber,
			eventData.logIndex || 0,
			eventData.returnValues,
		);
	}

	private async handleNFTMinted(eventData: ContractEventData): Promise<void> {
		const to = eventData.returnValues[0];
		const tokenId = eventData.returnValues[1].toString();
		const metadataURI = eventData.returnValues[2];
		const timestamp = Number(eventData.returnValues[3]);

		this.logger.log(`NFT minted: tokenId=${tokenId}, to=${to}, metadataURI=${metadataURI}`);

		await this.eventsRepository.saveNFTMintEvent(
			to,
			tokenId,
			metadataURI,
			timestamp,
			eventData.transactionHash,
			eventData.blockNumber,
			eventData.logIndex || 0,
			eventData.returnValues,
		);
	}

	private async handleUserBlacklisted(eventData: ContractEventData): Promise<void> {
		const user = eventData.returnValues[0];
		const timestamp = Number(eventData.returnValues[1]);

		this.logger.log(`User blacklisted: ${user} at ${new Date(timestamp * 1000).toISOString()}`);

		await this.eventsRepository.saveUserBlacklistEvent(
			user,
			'blacklisted',
			timestamp,
			eventData.transactionHash,
			eventData.blockNumber,
			eventData.logIndex || 0,
			eventData.returnValues,
		);
	}

	private async handleUserRemovedFromBlacklist(eventData: ContractEventData): Promise<void> {
		const user = eventData.returnValues[0];
		const timestamp = Number(eventData.returnValues[1]);

		this.logger.log(`User removed from blacklist: ${user} at ${new Date(timestamp * 1000).toISOString()}`);

		await this.eventsRepository.saveUserBlacklistEvent(
			user,
			'removed',
			timestamp,
			eventData.transactionHash,
			eventData.blockNumber,
			eventData.logIndex || 0,
			eventData.returnValues,
		);
	}

	private async handleFeesUpdated(eventData: ContractEventData): Promise<void> {
		const registrationFee = eventData.returnValues[0].toString();
		const mintingFee = eventData.returnValues[1].toString();
		const timestamp = Number(eventData.returnValues[2]);

		this.logger.log(`Fees updated: registration=${registrationFee}, minting=${mintingFee}`);

		await this.eventsRepository.saveFeesUpdatedEvent(
			registrationFee,
			mintingFee,
			timestamp,
			eventData.transactionHash,
			eventData.blockNumber,
			eventData.logIndex || 0,
			eventData.returnValues,
		);
	}
}
