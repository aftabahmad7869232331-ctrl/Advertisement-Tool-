export class ApplicationError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly statusCode = 500,
    readonly expose = statusCode < 500,
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}

