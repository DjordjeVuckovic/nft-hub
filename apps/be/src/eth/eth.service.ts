import { Injectable } from '@nestjs/common';

@Injectable()
export class EthService {
	private rpcProvider: any;
	constructor() {
		// this.rpcProvider = new ethers.providers.JsonRpcProvider
	}
}
