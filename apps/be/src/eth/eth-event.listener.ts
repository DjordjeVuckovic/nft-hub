import {forwardRef, Inject, Injectable, Logger, OnModuleDestroy} from '@nestjs/common';
import {CONFIG_PROVIDER} from '../config/config.provider';
import type {AppConfig} from '../config/config.types';
import {EventType} from "../events/events.types";
import {Contract, ethers} from 'ethers';
import {EventsService} from '../events/events.service';
import {EthContractFactory} from "./eth.factory";

export interface ContractEventData {
	event: EventType;
	transactionHash: string;
	blockNumber: number;
	returnValues: Record<string, any>;

	[key: string]: any;
}

@Injectable()
export class EthEventListener implements OnModuleDestroy {
	private readonly logger = new Logger(EthEventListener.name);
	private contract: Contract;
	private _isListening = false;
	private lastProcessedBlock: number;

	private readonly provider: ethers.JsonRpcProvider;

	constructor(
		@Inject(CONFIG_PROVIDER) private config: AppConfig,
		@Inject(forwardRef(() => EventsService)) private eventsService: EventsService
	) {
		try {
			const rpcUrl = this.config.ethConfig.rpcUrl;
			this.provider = new ethers.JsonRpcProvider(rpcUrl);

			const contractAddress = this.config.ethConfig.contractAddress;

			this.contract = EthContractFactory.createContract(this.provider, contractAddress);

			this.logger.log(`Contract initialized at address: ${contractAddress}`);
		} catch (error) {
			this.logger.error('Failed to initialize contract:', error);
			throw error;
		}
	}


	public async startEventListening() {
		if (this.isListening) {
			this.logger.warn('Already listening to events');
			return;
		}

		try {
			this._isListening = true;

			const startBlock = this.config.ethConfig.startBlock; // block kada je deployovan contract
			const currentBlock = await this.provider.getBlockNumber();

			this.logger.log(`Starting event sync from block ${startBlock} to ${currentBlock}`);

			await this.fetchPastEvents(startBlock, currentBlock);

			await this.listenToRealtimeEvents();

			this.logger.log('Event listening started successfully');
		} catch (error) {
			this.logger.error('Failed to start event listening:', error);
			this._isListening = false;
			throw error;
		}
	}

	private async fetchPastEvents(fromBlock: number, toBlock: number) {
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

							this.eventsService.handleContractEvent(contractEventData);

							// OVO JE PRIMER LOGA, parseLog na osnovu prvog topica (event sig) uz pomoc abi-a izvuce koji je event
							// LogDescription {
							// 	fragment: EventFragment {
							// 	  type: 'event',
							// 	  inputs: [ [ParamType], [ParamType] ],
							// 	  name: 'UserRegistered',
							// 	  anonymous: false
							// 	},
							// 	name: 'UserRegistered',
							// 	signature: 'UserRegistered(address,uint256)',
							// 	topic: '0xe29d35093005f4d575e1003753426b57a7f64378ba73332eef9c6ccc2b8decd6',
							// 	args: Result(2) [
							// 	  '0x95769019F852E5ae868c4f0ECA659F98937ce9bC',
							// 	  1755047496n
							// 	]
							//   }
							//   Log {
							// 	provider: JsonRpcProvider {},
							// 	transactionHash: '0x3aa055ccbd15b3f8a7eb58252daceff5aff3c0d8f8fd7b6f362c105011e63b45',
							// 	blockHash: '0x46edfe655c064e0abf5b1f2146c2ee96d322323041c210aa16358e220edb12d4',
							// 	blockNumber: 8971971,
							// 	removed: false,
							// 	address: '0x7ab383C0389eEffE0073838C9016151731136143',
							// 	data: '0x00000000000000000000000000000000000000000000000000000000689be648',
							// 	topics: [
							// 	  '0xe29d35093005f4d575e1003753426b57a7f64378ba73332eef9c6ccc2b8decd6',
							// 	  '0x00000000000000000000000095769019f852e5ae868c4f0eca659f98937ce9bc'
							// 	],
							// 	index: 70,
							// 	transactionIndex: 46
							//   }

						} else {
							console.log(`Could not parse log:`, log);
						}
					} catch (parseError) {
						console.log(`Failed to parse log:`, parseError);
						console.log(`Raw log:`, log);
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

	private async listenToRealtimeEvents() {
		this.logger.log('Starting real-time event listening...');

		try {
			// TODO: ovo mozes prebaciti negde lepse
			const eventsToListen: EventType[] = [
				'UserRegistered',
				'NFTMinted',
				'UserBlacklisted',
				'UserRemovedFromBlacklist',
				'FeesUpdated'
			];

			this.logger.log(`Setting up listeners for ${eventsToListen.length} events`);

			for (const eventName of eventsToListen) {
				try {
					this.contract.on(eventName, async (...args) => {

						const eventPayload = args[args.length - 1];

						const contractEventData: ContractEventData = {
							event: eventName as EventType,
							transactionHash: eventPayload.log.transactionHash,
							blockNumber: eventPayload.log.blockNumber,
							returnValues: eventPayload.args
						};

						this.eventsService.handleContractEvent(contractEventData);

						// Logovano:  [
						// '0x0E5522835509a807D5CD19358dc22E23d2F11AD5',
						// 1755272424n,
						// ContractEventPayload {
						// 	filter: 'UserRegistered',
						// 	emitter: Contract {
						// 	target: '0x7ab383C0389eEffE0073838C9016151731136143',
						// 	interface: [Interface],
						// 	runner: JsonRpcProvider {},
						// 	filters: {},
						// 	fallback: null,
						// 	[Symbol(_ethersInternal_contract)]: {}
						// 	},
						// 	log: EventLog {
						// 	provider: JsonRpcProvider {},
						// 	transactionHash: '0xc0647289c064c35c77ab84a782dd8809e98056a2278dc0b07278409afcceb1b3',
						// 	blockHash: '0x812c82d7742e2959f8c30fcb5adf6d43400b1cb76f486b559033089d77bc8718',
						// 	blockNumber: 8990556,
						// 	removed: false,
						// 	address: '0x7ab383C0389eEffE0073838C9016151731136143',
						// 	data: '0x00000000000000000000000000000000000000000000000000000000689f54e8',
						// 	topics: [Array],
						// 	index: 61,
						// 	transactionIndex: 29,
						// 	interface: [Interface],
						// 	fragment: [EventFragment],
						// 	args: [Result]
						// 	},
						// 	args: Result(2) [
						// 	'0x0E5522835509a807D5CD19358dc22E23d2F11AD5',
						// 	1755272424n
						// 	],
						// 	fragment: EventFragment {
						// 	type: 'event',
						// 	inputs: [Array],
						// 	name: 'UserRegistered',
						// 	anonymous: false
						// 	}
						// }
						// ]

					});

					this.logger.debug(`Registered listener for event: ${eventName}`);
				} catch (eventError) {
					this.logger.warn(`Failed to register listener for ${eventName}:`, eventError);
				}
			}

			this.logger.log(`Listening to contract events in real-time`);

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