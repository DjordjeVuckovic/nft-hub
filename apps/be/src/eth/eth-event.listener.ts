import {Inject, Injectable, Logger, OnModuleDestroy} from '@nestjs/common';
import {CONFIG_PROVIDER} from '../config/config.provider';
import type {AppConfig} from '../config/config.types';
import {BlockRange, EventType} from "../events/events.types";
import {Contract, ethers} from 'ethers';
import {EthContractFactory} from "./eth.factory";
import {EthEventHandler, ContractEventData} from "../events/events.types";

@Injectable()
export class EthEventListener implements OnModuleDestroy {
	private readonly logger = new Logger(EthEventListener.name);
	private contract: Contract;
	private _isListening = false;
	private lastProcessedBlock: number;

	private readonly provider: ethers.JsonRpcProvider;

	constructor(
		@Inject(CONFIG_PROVIDER) private config: AppConfig
	) {
		try {
			const rpcUrl = this.config.ethConfig.rpcUrl;
			this.provider = new ethers.JsonRpcProvider(rpcUrl);

			this.contract = EthContractFactory.createContract(this.provider, this.config.ethConfig.contractAddress);

			this.logger.log(`Contract initialized at address: ${this.config.ethConfig.contractAddress}`);
		} catch (error) {
			this.logger.error('Failed to initialize contract:', error);
			throw error;
		}
	}


	public async startEventListening(realTimeHandlers: Map<string, EthEventHandler>, pastEventHandler?: EthEventHandler) {
		if (this.isListening) {
			this.logger.warn('Already listening to events');
			return;
		}

		try {
			this._isListening = true;

			const startBlock = this.config.ethConfig.startBlock;
			const currentBlock = await this.provider.getBlockNumber();

			this.logger.log(`Starting event sync from block ${startBlock} to ${currentBlock}`);

			await this.fetchPastEvents({
				fromBlock: startBlock,
				toBlock: currentBlock
			}, pastEventHandler);

			await this.listenToRealtimeEvents(realTimeHandlers);

			this.logger.log('Event listening started successfully');
		} catch (error) {
			this.logger.error('Failed to start event listening:', error);
			this._isListening = false;
			throw error;
		}
	}

	private async fetchPastEvents({fromBlock, toBlock}: BlockRange, eventHandler?: EthEventHandler) {
		if(!eventHandler) {
			this.logger.log('No past event handler provided, skipping past events sync');
			return;
		}

		const CHUNK_SIZE = this.config.ethConfig.rpcBlockLimit;
		let currentFromBlock = fromBlock;

		this.logger.log(`Fetching past events from block ${fromBlock} to ${toBlock}`);

		while (currentFromBlock <= toBlock) {
			const latestBlock = await this.provider.getBlockNumber();

			if (latestBlock > toBlock) {
				this.logger.log(`New blocks detected! Extended range from ${toBlock} to ${latestBlock}`);
				toBlock = latestBlock;
			}

			const currentToBlock = Math.min(currentFromBlock + CHUNK_SIZE - 1, toBlock);

			try {
				this.logger.debug(`Fetching events for blocks ${currentFromBlock} - ${currentToBlock} (latest: ${latestBlock})`);

				const filter = {
					address: this.config.ethConfig.contractAddress,
					fromBlock: currentFromBlock,
					toBlock: currentToBlock
				};

				const logs = await this.provider.getLogs(filter);

				for (const log of logs) {
					try {
						const parsedLog = this.contract.interface.parseLog({
							topics: log.topics as string[],
							data: log.data
						});

						if (parsedLog) {

							const contractEventData: ContractEventData = {
								event: parsedLog.name as EventType,
								transactionHash: log.transactionHash,
								blockNumber: log.blockNumber,
								returnValues: parsedLog.args
							};

							eventHandler(contractEventData)

						} else {
							this.logger.warn(`Failed to parse log: ${log.transactionHash} at block ${log.blockNumber}`);
						}
					} catch (parseError) {
						this.logger.error(`Error parsing log ${log.transactionHash} at block ${log.blockNumber}:`, parseError);
					}
				}

				this.logger.debug(`Processed ${logs.length} events from blocks ${currentFromBlock} - ${currentToBlock}`);

				this.lastProcessedBlock = currentToBlock;

				currentFromBlock = currentToBlock + 1;

				await new Promise(resolve => setTimeout(resolve, 100));

			} catch (error) {
				this.logger.error(`Failed to fetch events for blocks ${currentFromBlock} - ${currentToBlock}:`, error);
				throw error;
			}
		}

		this.logger.log(`Past event sync completed. Last processed block: ${this.lastProcessedBlock}`);
	}

	private async listenToRealtimeEvents(realTimeHandlers: Map<string, EthEventHandler>) {
		this.logger.log('Starting real-time event listening...');

		try {

			for (const [eventName, handler] of realTimeHandlers.entries()) {

				try {
					this.contract.on(eventName, async (...args) => {

						const eventPayload = args[args.length - 1];

						const contractEventData: ContractEventData = {
							event: eventName as EventType,
							transactionHash: eventPayload.log.transactionHash,
							blockNumber: eventPayload.log.blockNumber,
							returnValues: eventPayload.args
						};

						await handler(contractEventData);

					});

					this.logger.debug(`Registered listener for event: ${eventName}`);
				} catch (eventError) {
					this.logger.warn(`Failed to register listener for ${eventName}:`, eventError);
				}
			}

		} catch (error) {
			this.logger.error('Failed to set up real-time event listeners:', error);
			throw error;
		}
	}

	get isListening() {
		return this._isListening;
	}

	async onModuleDestroy() {
		this._isListening = false;
	}
}