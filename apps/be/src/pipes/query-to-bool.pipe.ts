import {PipeTransform} from "@nestjs/common";

export class QueryToBoolPipe implements PipeTransform {

	transform(value: any): boolean {
		if (typeof value === 'string') {
			return value.toLowerCase() === 'true';
		}
		if (typeof value === 'boolean') {
			return value;
		}
		return false;
	}

}