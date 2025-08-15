import { Test, TestingModule } from '@nestjs/testing';
import { IpfsController } from './ipfs.controller';
import { IpfsService } from './ipfs.service';

describe('IpfsController', () => {
	let controller: IpfsController;
	let ipfsService: IpfsService;

	const mockIpfsService = {
		uploadFile: jest.fn(),
		uploadJson: jest.fn(),
		uploadFileWithMetadata: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [IpfsController],
			providers: [
				{
					provide: IpfsService,
					useValue: mockIpfsService,
				},
			],
		})
			.overrideGuard(require('../auth/api-key.guard').ApiKeyGuard)
			.useValue({ canActivate: () => true })
			.compile();

		controller = module.get<IpfsController>(IpfsController);
		ipfsService = module.get<IpfsService>(IpfsService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
