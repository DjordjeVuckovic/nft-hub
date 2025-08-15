import {Injectable, Inject, Logger, OnModuleInit, OnModuleDestroy} from '@nestjs/common';
import { CONFIG_PROVIDER } from '../config/config.provider';
import type { AppConfig } from '../config/config.types';
import { EthContractFactory } from "./eth.factory";
import {BlockNumberOrTag, Contract, Web3} from 'web3';
import {EventType} from "../events/events.types";
import {Web3Subscription} from "web3-core";

export interface ContractEventData {
  event: EventType;
  transactionHash: string;
	blockNumber: number;
	returnValues: Record<string, any>;
	[key: string]: any;
}

export type BlockNumberCursor = 'start' | 'latest' | bigint;

@Injectable()
export class EthEventListener implements OnModuleDestroy {
  private readonly logger = new Logger(EthEventListener.name);
  private contract: Contract<any>;
	private subscription: Web3Subscription<any> | null = null;
  private _isListening = false;

  constructor(@Inject(CONFIG_PROVIDER) private config: AppConfig) {
    this.contract = EthContractFactory.createWsContract(
			this.config.ethConfig.wsUrl,
			this.config.ethConfig.contractAddress
		)
  }

	listenToAll(handler: (event: ContractEventData) => Promise<void>, fromBlock: BlockNumberCursor = 'latest') {
		this.subscription = this.contract.events.allEvents({
			fromBlock: this.getBlockNumber(fromBlock)
		})

		this.subscription.on("data", handler)


		this._isListening = true;
	}

	get isListening() {
		return this._isListening;
	}

	async onModuleDestroy() {
		if (this.subscription) {
			await this.subscription.unsubscribe();
			this.logger.log('Unsubscribed from contract events');
		}
		this._isListening = false;
	}

	getBlockNumber(cursor: BlockNumberCursor): BlockNumberOrTag {
		if (cursor === 'start') {
			return BigInt(0)
		}
		return 'latest'
	}
}