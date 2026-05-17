import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err.stack);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File exceeds 10MB limit' });
    }
    return res.status(422).json({ error: 'File upload error' });
  }

  // Generic DB errors
  if (err.code && err.code.startsWith('22')) { // pg error class 22
    return res.status(500).json({ error: 'Storage error' });
  }

  // Return standard error
  res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message });
}
