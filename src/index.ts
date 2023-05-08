export interface StreamFetchProcessorOptions {
  signal?: AbortSignal;
  decoder?: TextDecoder;
}

export interface StreamFetchProcessorResult {
  done: boolean;
  value: string;
}

export type StreamFetchProcessorReader =
  | ReadableStreamDefaultReader<Uint8Array>
  | null
  | undefined;

export default class StreamFetchProcessor {
  private decoder: TextDecoder;
  private fetchFn: typeof window.fetch;
  private reader: StreamFetchProcessorReader;
  private controller: AbortController;
  private response: Response | null = null;

  constructor(options: StreamFetchProcessorOptions = {}) {
    if (typeof window.fetch !== 'function') {
      throw new Error('fetch method is not available');
    }
    this.decoder = options.decoder ?? new TextDecoder('utf-8');
    this.controller = new AbortController();
    this.fetchFn = window.fetch;
    this.reader = null;
  }

  async fetch(
    input: RequestInfo | URL,
    init: RequestInit = {},
    retry = 3,
  ): Promise<Response> {
    try {
      const response = await this.fetchFn(input, {
        ...init,
        signal: this.controller.signal,
      });
      if (!response.ok) {
        throw new Error(`Response error: ${response.status} ${response.statusText}`);
      }
      if (response.ok) {
        this.response = response;
      }
      return response;
    } catch (error) {
      if (retry > 0) {
        console.log(`Failed to fetch ${input}, retrying (${retry} retries left)...`);
        return this.fetch(input, init, retry - 1);
      } else {
        throw new Error(`Failed to fetch: ${error}`);
      }
    }
  }

  async read(response?: Response) {
    if (!this.response && !response) {
      throw new Error('No response available');
    }
    try {
      this.reader = (response ?? this.response)?.body?.getReader();
      if (this.reader) {
        const { done, value } = await this.reader.read();
        const text = this.decoder.decode(value);
        return { done, value: text };
      } else {
        return { done: true, value: '' };
      }
    } catch (error) {
      this.reader?.cancel();
      throw new Error(`Failed to read: ${error}`);
    } finally {
      this.reader?.releaseLock();
      this.response?.body?.cancel();
      response?.body?.cancel();
    }
  }

  cancel() {
    this.reader?.cancel();
    this.controller.abort();
  }
}
