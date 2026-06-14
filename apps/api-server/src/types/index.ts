// Shared API response helpers

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
    this.name = 'HttpError';
  }
}

export const ok = <T>(data: T): ApiSuccess<T> => ({ ok: true, data });
export const fail = (error: string, details?: unknown): ApiError => ({
  ok: false,
  error,
  details,
});
