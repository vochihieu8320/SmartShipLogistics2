import { createProxyMiddleware } from 'http-proxy-middleware';
import { Request, Response, NextFunction } from 'express';
import { log } from './vite';

// Environment variables
const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL || 'https://209.97.171.114/api/v1';

// API proxy middleware for external API
export const apiProxyMiddleware = createProxyMiddleware({
  target: EXTERNAL_API_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/external': '', // remove the /api/external prefix when forwarding the request
  },
  secure: false, // if you're using HTTPS but want to ignore certificate verification
  logLevel: 'debug',
  onProxyRes: (proxyRes, req, res) => {
    log(`Proxied request: ${req.method} ${req.url} -> ${proxyRes.statusCode}`, 'proxy');
  },
  onError: (err, req, res) => {
    log(`Proxy error: ${err.message}`, 'proxy');
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      message: 'Proxy error', 
      error: err.message,
      details: 'There was an error connecting to the external API. Please try again later.'
    }));
  }
});

// Custom middleware for API endpoint that forwards to external API
export function setupApiProxy(req: Request, res: Response, next: NextFunction) {
  log(`API request: ${req.method} ${req.url}`, 'proxy');
  
  // Handle token forwarding
  if (req.headers.authorization) {
    log('Forwarding authorization header', 'proxy');
  }
  
  next();
}