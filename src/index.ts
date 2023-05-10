export type StreamFetchProcessorOptions = {
  signal?: AbortSignal;
  decoder?: TextDecoder;
};

export type StreamFetchProcessorResult =
  | ReadableStreamReadResult<Uint8Array>
  | {
      done: boolean;
      value?: unknown;
    };

export type StreamFetchProcessorReader =
  | ReadableStreamDefaultReader<Uint8Array>
  | null
  | undefined;

export default class StreamFetchProcessor {
  private decoder: TextDecoder;
  private reader: StreamFetchProcessorReader;
  private controller: AbortController;
  private response: Response | null = null;

  constructor(options: StreamFetchProcessorOptions = {}) {
    this.decoder = options.decoder ?? new TextDecoder('utf-8');
    this.controller = new AbortController();
    this.reader = null;
  }

  async fetch(
    input: RequestInfo | URL,
    init?: RequestInit | undefined,
    retry = 3,
  ): Promise<Response> {
    try {
      const response = await fetch(input, {
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
        return this.fetch(input, init, retry - 1);
      } else {
        throw new Error(`Failed to fetch: ${error}`);
      }
    }
  }

  private async parserReader(reader: ReadableStreamDefaultReader<Uint8Array>) {
    const decoder = this.decoder;
    async function* processResult(result: ReadableStreamReadResult<Uint8Array>) {
      while (!result.done) {
        if (result.done) {
          console.log('SSE connection closed by server');
          return Promise.resolve();
        }

        const buffer = decoder.decode(result.value, { stream: true });

        const events = buffer.split('\n');

        const filteredArr = events.filter((item) => item !== '' && item !== ' ');
        for (let i = 0; i < filteredArr.length; i++) {
          const event = filteredArr[i].trim();
          if (event.length === 0) continue;
          const parts = event.split('data: ');
          const ds = parts.filter((item) => item !== '' && item !== ' ')[0];
          yield ds;
        }

        result = await reader.read();
      }
    }

    const result = await reader.read();
    return processResult(result);
  }

  async read(response?: Response) {
    if (!this.response && !response) {
      throw new Error('No response available');
    }
    try {
      this.reader = (response ?? this.response)?.body?.getReader();

      if (this.reader) {
        return this.parserReader(this.reader);
      } else {
        throw new Error(`No reader available`);
      }
    } catch (error) {
      this.reader?.cancel();
      throw new Error(`Failed to read: ${error}`);
    }
  }

  cancel() {
    this.reader?.cancel();
    this.controller.abort();
  }
}
