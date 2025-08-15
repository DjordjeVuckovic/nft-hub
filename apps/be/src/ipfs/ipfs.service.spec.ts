import { Test, TestingModule } from '@nestjs/testing';
import { IpfsService } from './ipfs.service';

describe('IpfsService', () => {
	let service: IpfsService;

	const mockIpfsConfig = {
		pinataJwt: 'test-jwt',
		gatewayUrl: 'https://test-gateway.mypinata.cloud',
		groupId: 'test-group-id',
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				IpfsService,
				{
					provide: 'IPFS_CONFIG',
					useValue: mockIpfsConfig,
				},
			],
		}).compile();

		service = module.get<IpfsService>(IpfsService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
