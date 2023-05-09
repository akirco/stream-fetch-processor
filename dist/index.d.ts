interface StreamFetchProcessorOptions {
    signal?: AbortSignal;
    decoder?: TextDecoder;
}
interface StreamFetchProcessorResult {
    done: boolean;
    value: string;
}
type StreamFetchProcessorReader = ReadableStreamDefaultReader<Uint8Array> | null | undefined;
declare class StreamFetchProcessor {
    private decoder;
    private reader;
    private controller;
    private response;
    constructor(options?: StreamFetchProcessorOptions);
    fetchData(input: RequestInfo | URL, init?: RequestInit | undefined, retry?: number): Promise<Response>;
    read(response?: Response): Promise<{
        done: boolean;
        value: string;
    }>;
    cancel(): void;
}

export { StreamFetchProcessorOptions, StreamFetchProcessorReader, StreamFetchProcessorResult, StreamFetchProcessor as default };
