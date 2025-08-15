import { Controller, Get } from '@nestjs/common';

export const msg = 'NFT Hub API is running!';

@Controller()
export class AppController {
	@Get()
	getHello(): string {
		return msg;
	}
}
