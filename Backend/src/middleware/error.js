import multer from 'multer';

export function notFoundHandler(req, res) {
  res.status(404).json({ message: `No API route for ${req.method} ${req.originalUrl}.` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err.status && err.status < 500) return res.status(err.status).json({ message: err.message });
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors)[0]?.message ?? 'Invalid data.' });
  }
  if (err.name === 'CastError') return res.status(400).json({ message: `Invalid value for ${err.path}.` });
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern ?? {})[0] ?? 'value';
    return res.status(409).json({ message: `That ${field} already exists.` });
  }
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large (10 MB maximum).' : err.message;
    return res.status(400).json({ message });
  }
  console.error(err);
  return res.status(500).json({ message: 'Something went wrong on the server.' });
}
