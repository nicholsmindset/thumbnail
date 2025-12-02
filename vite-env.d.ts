/// <reference types="vite/client" />

// AI Studio types for browser-based Gemini API
interface AIStudio {
  apiKey: string;
  setApiKey: (key: string) => void;
  hasSelectedApiKey: () => boolean;
  openSelectKey: () => void;
}

// Vite environment variables
interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_API_URL?: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Extend Window interface globally
interface Window {
  aistudio?: AIStudio;
}

// Module declarations for server dependencies
declare module 'jszip' {
  interface JSZipGeneratorOptions {
    type: 'blob' | 'base64' | 'binarystring' | 'array' | 'uint8array' | 'arraybuffer' | 'nodebuffer';
    compression?: 'STORE' | 'DEFLATE';
    compressionOptions?: { level: number };
  }

  interface JSZipObject {
    name: string;
    dir: boolean;
    date: Date;
    comment: string;
    unixPermissions: number | null;
    dosPermissions: number | null;
    async(type: 'string'): Promise<string>;
    async(type: 'base64'): Promise<string>;
    async(type: 'uint8array'): Promise<Uint8Array>;
    async(type: 'arraybuffer'): Promise<ArrayBuffer>;
    async(type: 'blob'): Promise<Blob>;
  }

  interface JSZip {
    file(name: string, data: string | Blob | ArrayBuffer | Uint8Array): JSZip;
    file(name: string): JSZipObject | null;
    folder(name: string): JSZip | null;
    generateAsync(options: { type: 'blob' }): Promise<Blob>;
    generateAsync(options: JSZipGeneratorOptions): Promise<Blob | string | ArrayBuffer | Uint8Array>;
    forEach(callback: (relativePath: string, file: JSZipObject) => void): void;
    files: { [key: string]: JSZipObject };
  }

  const JSZip: new () => JSZip;
  export default JSZip;
}

declare module 'express' {
  import { IncomingMessage, ServerResponse } from 'http';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export interface Request<Body = any> extends IncomingMessage {
    body: Body;
    params: Record<string, string>;
    query: Record<string, string>;
    path: string;
    method: string;
  }

  export interface Response extends ServerResponse {
    json(data: unknown): Response;
    status(code: number): Response;
    send(data: unknown): Response;
    sendStatus(code: number): Response;
  }

  export type NextFunction = (err?: unknown) => void;
  export type ErrorRequestHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => void;
  export type RequestHandler<Body = Record<string, unknown>> = (req: Request<Body>, res: Response, next: NextFunction) => void;

  export interface Router {
    get(path: string, ...handlers: RequestHandler[]): Router;
    post<Body = Record<string, unknown>>(path: string, ...handlers: RequestHandler<Body>[]): Router;
    put(path: string, ...handlers: RequestHandler[]): Router;
    delete(path: string, ...handlers: RequestHandler[]): Router;
    use(...handlers: Array<RequestHandler | ErrorRequestHandler>): Router;
  }

  export interface Application extends Router {
    listen(port: number | string, callback?: () => void): unknown;
    use(path: string, ...handlers: Array<RequestHandler | ErrorRequestHandler>): Application;
    use(...handlers: Array<RequestHandler | ErrorRequestHandler>): Application;
  }

  interface Express {
    (): Application;
    json(options?: { limit?: string }): RequestHandler;
    urlencoded(options?: { extended?: boolean }): RequestHandler;
    static(root: string): RequestHandler;
    Router(): Router;
  }

  const express: Express;
  export = express;
}

declare module 'cors' {
  import { RequestHandler } from 'express';

  interface CorsOptions {
    origin?: boolean | string | string[] | ((origin: string, callback: (err: Error | null, allow?: boolean) => void) => void);
    methods?: string | string[];
    allowedHeaders?: string | string[];
    exposedHeaders?: string | string[];
    credentials?: boolean;
    maxAge?: number;
    preflightContinue?: boolean;
    optionsSuccessStatus?: number;
  }

  function cors(options?: CorsOptions): RequestHandler;
  export = cors;
}

declare module 'express-rate-limit' {
  import { RequestHandler } from 'express';

  interface RateLimitOptions {
    windowMs?: number;
    max?: number;
    message?: string | object;
    standardHeaders?: boolean;
    legacyHeaders?: boolean;
  }

  function rateLimit(options?: RateLimitOptions): RequestHandler;
  export default rateLimit;
}
