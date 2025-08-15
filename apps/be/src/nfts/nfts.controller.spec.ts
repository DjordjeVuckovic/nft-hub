import { Test, TestingModule } from '@nestjs/testing';
import { NftsController } from './nfts.controller';
import { NftsService } from './nfts.service';
import { IpfsService } from '../ipfs/ipfs.service';

describe('NftsController', () => {
	let controller: NftsController;

	const mockNftsService = {
		getAll: jest.fn(),
	};

	const mockIpfsService = {
		fetchImage: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [NftsController],
			providers: [
				{
					provide: NftsService,
					useValue: mockNftsService,
				},
				{
					provide: IpfsService,
					useValue: mockIpfsService,
				},
			],
		})
			.overrideGuard(require('../auth/api-key.guard').ApiKeyGuard)
			.useValue({ canActivate: () => true })
			.compile();

		controller = module.get<NftsController>(NftsController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
