type StreamFetchProcessorOptions = {
    signal?: AbortSignal;
    decoder?: TextDecoder;
};
type StreamFetchProcessorResult = ReadableStreamReadResult<Uint8Array> | {
    done: boolean;
    value?: unknown;
};
type StreamFetchProcessorReader = ReadableStreamDefaultReader<Uint8Array> | null | undefined;
declare class StreamFetchProcessor {
    private decoder;
    private reader;
    private controller;
    private response;
    constructor(options?: StreamFetchProcessorOptions);
    fetch(input: RequestInfo | URL, init?: RequestInit | undefined, retry?: number): Promise<Response>;
    private parserReader;
    read(response?: Response): Promise<AsyncGenerator<string, void, unknown>>;
    cancel(): void;
}

export { StreamFetchProcessorOptions, StreamFetchProcessorReader, StreamFetchProcessorResult, StreamFetchProcessor as default };
