import { createReadStream, existsSync, ReadStream } from "fs";
import http from "http";
import https from "https";
import { PassThrough } from "stream";

function SimpleFetch(url: string, options: http.RequestOptions = {}) {
    return new Promise<SimpleResponse>((resolve, reject) => {
        if (typeof url !== "string") return reject(new TypeError(`${url} is not a valid url!`));

        if (existsSync(url)) return resolve(new SimpleResponse(createReadStream(url)));

        const link = new URL(url).toString();
        const api = (link.startsWith("https://") ? https : http) as typeof http;

        api.get(link, options, res => {
            resolve(new SimpleResponse(res));
        });
    });
}

class SimpleResponse {
    private _res: http.IncomingMessage | ReadStream;

    constructor(res: http.IncomingMessage | ReadStream) {
        this._res = res;

        Object.defineProperty(this, "_res", { enumerable: false, writable: false, configurable: false });
    }

    get status() {
        return (this._res as http.IncomingMessage).statusCode ?? 200;
    }

    get statusText() {
        return (this._res as http.IncomingMessage).statusMessage ?? "ok";
    }

    get headers() {
        return (this._res as http.IncomingMessage).headers ?? {};
    }

    stream() {
        return this._res.pipe(new PassThrough());
    }

    buffer() {
        return new Promise<Buffer>((resolve, reject) => {
            const data: Buffer[] = [];

            this._res.on("data", chunk => data.push(chunk));
            this._res.on("error", reject);
            this._res.on("end", () => resolve(Buffer.concat(data)));
        });
    }

    text(): Promise<string> {
        return this.buffer()
            .then(data => data.toString("utf-8"));
    }

    json<T>(): Promise<T> {
        return this.text()
            .then(res => JSON.parse(res));
    }
}

SimpleFetch.Response = SimpleResponse;

export = SimpleFetch;