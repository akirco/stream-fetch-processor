export interface StreamFetchProcessorOptions<T> {
  signal?: AbortSignal;
  decoder?: TextDecoder;
  parser?: (value: string) => T;
}

export interface StreamFetchProcessorResult<T> {
  done: boolean;
  value: T;
}

export type StreamFetchProcessorReader =
  | ReadableStreamDefaultReader<Uint8Array>
  | null
  | undefined;

export default class StreamFetchProcessor<T = string> {
  private decoder: TextDecoder;
  private reader: StreamFetchProcessorReader;
  private controller: AbortController;
  private response: Response | null = null;
  private parser: (value: string) => T;

  constructor(options: StreamFetchProcessorOptions<T> = {}) {
    this.decoder = options.decoder ?? new TextDecoder('utf-8');
    this.controller = new AbortController();
    this.reader = null;
    this.parser = options.parser ?? ((value: string) => value as unknown as T);
  }

  async fetchData(
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
        return this.fetchData(input, init, retry - 1);
      } else {
        throw new Error(`Failed to fetch: ${error}`);
      }
    }
  }

  async read(response?: Response): Promise<StreamFetchProcessorResult<T>> {
    if (!this.response && !response) {
      throw new Error('No response available');
    }
    try {
      this.reader = (response ?? this.response)?.body?.getReader();
      let done = false;
      let value: T | null = null as unknown as T;
      if (this.reader) {
        while (!done) {
          const { done: streamDone, value: streamValue } = await this.reader.read();
          done = streamDone;
          if (streamValue) {
            const text = this.decoder.decode(streamValue);
            const parsedValue = this.parser(text);
            value = parsedValue;
            break;
          }
        }
        return { done, value: value as T };
      } else {
        return { done: true, value: null as unknown as T };
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
