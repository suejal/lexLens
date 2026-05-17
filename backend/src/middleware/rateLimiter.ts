import { Request, Response, NextFunction } from 'express';

interface QueuedRequest {
  req: Request;
  res: Response;
  next: NextFunction;
}

const windowMs = 60 * 1000;
const maxRequestsPerMinute = 18; // safe margin below 20
const maxQueueSize = 5;

let requestTimestamps: number[] = [];
let requestQueue: QueuedRequest[] = [];

function cleanUpOldTimestamps() {
  const now = Date.now();
  requestTimestamps = requestTimestamps.filter(ts => (now - ts) < windowMs);
}

function processQueue() {
  if (requestQueue.length === 0) return;
  cleanUpOldTimestamps();

  if (requestTimestamps.length < maxRequestsPerMinute) {
    const nextReq = requestQueue.shift();
    if (nextReq) {
      requestTimestamps.push(Date.now());
      nextReq.next();
    }
  }
}

// Intercepts the request and queues if limit is reached
export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  cleanUpOldTimestamps();

  if (requestTimestamps.length < maxRequestsPerMinute) {
    requestTimestamps.push(Date.now());
    return next();
  }

  // Queue it
  if (requestQueue.length < maxQueueSize) {
    requestQueue.push({ req, res, next });
    
    // Check back to process queue, simple polling
    const interval = setInterval(() => {
      cleanUpOldTimestamps();
      if (requestTimestamps.length < maxRequestsPerMinute) {
        clearInterval(interval);
        processQueue(); // which triggers the queued next()
      }
    }, 2000);
    return;
  }

  // Reject if queue is too large
  res.status(429).json({
    error: `Rate limit — retrying in Xs`,
    retryAfter: Math.ceil((windowMs - (Date.now() - requestTimestamps[0])) / 1000)
  });
}
