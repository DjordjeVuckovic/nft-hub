export type EventType =
	| 'UserRegistered'
	| 'NFTMinted'
	| 'UserBlacklisted'
	| 'UserRemovedFromBlacklist'
	| 'FeesUpdated';

export interface BaseContractEvent {
  eventType: EventType;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
  timestamp: number;
}

export interface UserRegisteredEvent extends BaseContractEvent {
  eventType: 'UserRegistered';
  user: string;
}

export interface NFTMintedEvent extends BaseContractEvent {
  eventType: 'NFTMinted';
  to: string;
  tokenId: string;
  metadataURI: string;
}

export interface UserBlacklistedEvent extends BaseContractEvent {
  eventType: 'UserBlacklisted';
  user: string;
}

export interface UserRemovedFromBlacklistEvent extends BaseContractEvent {
  eventType: 'UserRemovedFromBlacklist';
  user: string;
}

export interface FeesUpdatedEvent extends BaseContractEvent {
  eventType: 'FeesUpdated';
  registrationFee: string;
  mintingFee: string;
}

export type ContractEvent =
  | UserRegisteredEvent
  | NFTMintedEvent
  | UserBlacklistedEvent
  | UserRemovedFromBlacklistEvent
  | FeesUpdatedEvent;

export interface ContractEventData {
	event: EventType;
	transactionHash: string;
	blockNumber: number;
	logIndex?: number;
	returnValues: Record<string, any>;
	[key: string]: any;
}

export type EthEventHandler = (eventData: ContractEventData) => Promise<void> | void;

export type BlockRange = {
	fromBlock: number;
	toBlock: number;
}