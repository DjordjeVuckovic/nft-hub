export async function retry<T>(
  operation: () => Promise<T>,
  description: string,
  maxRetries: number = 3,
  retryDelay: number = 2000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt}/${maxRetries} failed for ${description}: ${error}`);

      if (attempt < maxRetries - 1) {
        console.log(`Retrying in ${retryDelay}ms...`);
        await sleep(retryDelay);
      }
    }
  }

  throw lastError!;
}

export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}