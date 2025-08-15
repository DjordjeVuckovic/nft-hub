import { Test, TestingModule } from '@nestjs/testing';
import { AppController, msg } from './app.controller';

describe('AppController', () => {
	let appController: AppController;

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			controllers: [AppController],
		}).compile();

		appController = app.get<AppController>(AppController);
	});

	describe('root', () => {
		it('should return the correct message', () => {
			expect(appController.getHello()).toBe(msg);
		});
	});
});
