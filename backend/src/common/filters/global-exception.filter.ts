import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';
    let details: { field: string; message: string }[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const res = exceptionResponse as Record<string, unknown>;
        message = (res['message'] as string) ?? exception.message;
        code = (res['error'] as string) ?? this.statusToCode(status);

        // class-validator produces array of messages
        if (Array.isArray(res['message'])) {
          details = (res['message'] as string[]).map((msg) => ({
            field: msg.split(' ')[0],
            message: msg,
          }));
          message = 'Validation failed';
          code = 'VALIDATION_ERROR';
        }
      } else {
        message = exceptionResponse as string;
        code = this.statusToCode(status);
      }
    } else {
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      success: false,
      error: { code, message, ...(details ? { details } : {}) },
      meta: { timestamp: new Date().toISOString() },
    });
  }

  private statusToCode(status: number): string {
    const map: Record<number, string> = {
      400: 'VALIDATION_ERROR',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      413: 'FILE_TOO_LARGE',
      415: 'UNSUPPORTED_FILE',
      429: 'RATE_LIMITED',
      500: 'INTERNAL_ERROR',
      507: 'QUOTA_EXCEEDED',
    };
    return map[status] ?? 'INTERNAL_ERROR';
  }
}
