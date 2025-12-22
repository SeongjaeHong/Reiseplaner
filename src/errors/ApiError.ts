import z from 'zod';

export type ErrorType = 'VALIDATION' | 'SERVER_RESPONSE' | 'DATABASE';

const DEFAULT_MESSAGES: Record<ErrorType, string> = {
  VALIDATION: 'Wrong input types.',
  SERVER_RESPONSE: 'Wrong server response.',
  DATABASE: 'Database error occured.',
};

export class ApiError extends Error {
  readonly type: ErrorType;
  readonly zodError?: z.ZodError;
  readonly serverError?: Error;

  constructor(type: ErrorType, options?: { message?: string; cause?: z.ZodError | Error }) {
    let causeDetail = '';
    let currentZodError: z.ZodError | undefined;
    let currentServerError: Error | undefined;

    if (options?.cause instanceof z.ZodError) {
      currentZodError = options.cause;
      causeDetail = `\n(${currentZodError.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join(', ')})`;
    } else if (options?.cause instanceof Error) {
      currentServerError = options.cause;
      causeDetail = `\n
      ${currentServerError.name}\n
      ${currentServerError.message}`;
    }

    const finalMessage = (options?.message ?? DEFAULT_MESSAGES[type]) + causeDetail;
    super(finalMessage);

    this.type = type;
    this.name = 'ApiError';
    this.zodError = currentZodError;
    this.serverError = currentServerError;
  }
}
