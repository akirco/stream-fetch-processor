interface StreamFetchProcessorOptions<T> {
    signal?: AbortSignal;
    decoder?: TextDecoder;
    parser?: (value: string) => T;
}
interface StreamFetchProcessorResult<T> {
    done: boolean;
    value: T;
}
type StreamFetchProcessorReader = ReadableStreamDefaultReader<Uint8Array> | null | undefined;
declare class StreamFetchProcessor<T = string> {
    private decoder;
    private reader;
    private controller;
    private response;
    private parser;
    constructor(options?: StreamFetchProcessorOptions<T>);
    fetchData(input: RequestInfo | URL, init?: RequestInit | undefined, retry?: number): Promise<Response>;
    read(response?: Response): Promise<StreamFetchProcessorResult<T>>;
    cancel(): void;
}

export { StreamFetchProcessorOptions, StreamFetchProcessorReader, StreamFetchProcessorResult, StreamFetchProcessor as default };
