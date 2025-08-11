import {Inject, Injectable} from '@nestjs/common';
import {CACHE_MANAGER} from "@nestjs/cache-manager";

@Injectable()
export class NftsService {
	constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
	}
}
