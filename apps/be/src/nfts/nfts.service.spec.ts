import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NftsService } from './nfts.service';
import { EthService } from '../eth/eth.service';
import { IpfsService } from '../ipfs/ipfs.service';

describe('NftsService', () => {
	let service: NftsService;

	const mockCacheManager = {
		get: jest.fn(),
		set: jest.fn(),
		del: jest.fn(),
	};

	const mockEthService = {
		getCollectionInfo: jest.fn(),
		getPredefinedMetadataURIs: jest.fn(),
		getAllMintedNFTs: jest.fn(),
	};

	const mockIpfsService = {
		fetchMetadata: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				NftsService,
				{
					provide: CACHE_MANAGER,
					useValue: mockCacheManager,
				},
				{
					provide: EthService,
					useValue: mockEthService,
				},
				{
					provide: IpfsService,
					useValue: mockIpfsService,
				},
			],
		}).compile();

		service = module.get<NftsService>(NftsService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
