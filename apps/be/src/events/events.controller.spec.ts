import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

describe('EventsController', () => {
	let controller: EventsController;
	let eventsService: EventsService;

	const mockEventsService = {
		getAll: jest.fn().mockResolvedValue([]),
		getRange: jest.fn().mockResolvedValue([]),
		getByAddress: jest.fn().mockResolvedValue([]),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [EventsController],
			providers: [
				{
					provide: EventsService,
					useValue: mockEventsService,
				},
			],
		}).compile();

		controller = module.get<EventsController>(EventsController);
		eventsService = module.get<EventsService>(EventsService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('should call eventsService.getAll', async () => {
		await controller.getAllEvents();
		expect(eventsService.getAll).toHaveBeenCalled();
	});

	it('should call eventsService.getByAddress with address', async () => {
		const address = '0x123';
		await controller.getEventsByAddress(address);
		expect(eventsService.getByAddress).toHaveBeenCalledWith(address);
	});
});
