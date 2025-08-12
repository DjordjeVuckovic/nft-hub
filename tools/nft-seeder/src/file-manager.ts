import {readFile, access, writeFile} from 'fs/promises';
import {resolve} from 'path';

export async function checkFileExists(filePath: string): Promise<boolean> {
	try {
		await access(filePath);
		return true;
	} catch {
		return false;
	}
}

export async function loadFile(filePath: string): Promise<Buffer> {
	const exists = await checkFileExists(filePath);
	if (!exists) {
		throw new Error(`File not found: ${filePath}`);
	}
	return await readFile(filePath);
}

export async function saveJsonFile(data: any, filename: string, directory: string = process.cwd()): Promise<void> {
	const outputPath = resolve(directory, filename);
	await writeFile(outputPath, JSON.stringify(data, null, 2), 'utf8');
	console.log(`📄 JSON file written to: ${outputPath}`);
}