/** Error with an HTTP status. The error middleware returns `message` to the client. */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const badRequest = (message) => new HttpError(400, message);
export const notFound = (message = 'Record not found.') => new HttpError(404, message);
export const forbidden = (message = 'You do not have permission to do that.') => new HttpError(403, message);
export const conflict = (message) => new HttpError(409, message);

export const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function pageParams(query, defaultLimit = 10, maxLimit = 200) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number.parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}
