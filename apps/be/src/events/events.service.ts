import { Injectable, Logger, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import type {
  ContractEvent,
  EventType
} from './events.types';
import { EthEventListener, type ContractEventData } from '../eth/eth-event.listener';

// Custom serializer to handle BigInt values
function serializeEventData(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

@Injectable()
export class EventsService implements OnModuleInit {
  private readonly logger = new Logger(EventsService.name);

  constructor(@Inject(forwardRef(() => EthEventListener)) private readonly eventListener: EthEventListener) {}

  async onModuleInit() {
    this.startListening()
  }

	startListening() {
		this.eventListener.startEventListening();

    this.logger.log(`Started listening for contract events`);
		this.logger.log('EthEventListener is listening:', this.eventListener.isListening);
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

    // TODO: Save to database when implemented
    // For now, just log the event
  }

  private async handleNFTMinted(eventData: ContractEventData): Promise<void> {
    const to = eventData.returnValues[0];
    const tokenId = eventData.returnValues[1].toString();
    const metadataURI = eventData.returnValues[2];
    const timestamp = Number(eventData.returnValues[3]);

    this.logger.log(`NFT minted: tokenId=${tokenId}, to=${to}, metadataURI=${metadataURI}`);

    // TODO: Save to database when implemented
    // This event is crucial for updating NFT ownership status
  }

  private async handleUserBlacklisted(eventData: ContractEventData): Promise<void> {
    const user = eventData.returnValues[0];
    const timestamp = Number(eventData.returnValues[1]);

    this.logger.log(`User blacklisted: ${user} at ${new Date(timestamp * 1000).toISOString()}`);

    // TODO: Save to database when implemented
    // Update user status in database
  }

  private async handleUserRemovedFromBlacklist(eventData: ContractEventData): Promise<void> {
    const user = eventData.returnValues[0];
    const timestamp = Number(eventData.returnValues[1]);

    this.logger.log(`User removed from blacklist: ${user} at ${new Date(timestamp * 1000).toISOString()}`);

    // TODO: Save to database when implemented
    // Update user status in database
  }

  private async handleFeesUpdated(eventData: ContractEventData): Promise<void> {
    const registrationFee = eventData.returnValues[0].toString();
    const mintingFee = eventData.returnValues[1].toString();
    const timestamp = Number(eventData.returnValues[2]);

    this.logger.log(`Fees updated: registration=${registrationFee}, minting=${mintingFee}`);

    // TODO: Save to database when implemented
    // Update fee configuration in database
  }

  async getHistoricalEvents(fromBlock?: number | 'latest', toBlock?: number | 'latest'): Promise<ContractEvent[]> {
    // TODO: Implement historical event fetching
    // For now, return empty array since we're focusing on real-time events
    this.logger.warn('Historical events not yet implemented in simplified architecture');
    return [];
  }
}
