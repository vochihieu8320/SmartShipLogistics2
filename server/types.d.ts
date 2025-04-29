declare module 'http-proxy-middleware' {
  import { RequestHandler } from 'express';
  import { IncomingMessage, ServerResponse } from 'http';

  export interface ProxyOptions {
    target: string;
    changeOrigin?: boolean;
    pathRewrite?: Record<string, string>;
    secure?: boolean;
    logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'silent';
    onProxyRes?: (proxyRes: IncomingMessage, req: IncomingMessage, res: ServerResponse) => void;
    onError?: (err: Error, req: IncomingMessage, res: ServerResponse) => void;
  }

  export type RequestHandler = RequestHandler;
  export function createProxyMiddleware(options: ProxyOptions): RequestHandler;
}