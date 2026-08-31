import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { Request, Response } from 'express';

interface ErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
  timestamp: string;
  path: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const body: ErrorBody = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      body.statusCode = status;
      if (typeof res === 'string') {
        body.message = res;
      } else if (typeof res === 'object' && res !== null) {
        const r = res as Record<string, unknown>;
        body.message = (r.message as string | string[]) ?? exception.message;
        if (typeof r.error === 'string') {
          body.error = r.error;
        }
      }
      body.error = HttpStatus[status] ?? 'Error';
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaError = exception;
      if (prismaError.code === 'P2002') {
        body.statusCode = HttpStatus.CONFLICT;
        body.error = 'Conflict';
        body.message = 'A record with this unique value already exists';
      } else if (prismaError.code === 'P2003') {
        body.statusCode = HttpStatus.BAD_REQUEST;
        body.error = 'Bad Request';
        body.message = 'Referenced record does not exist';
      } else {
        body.statusCode = HttpStatus.BAD_REQUEST;
        body.error = 'Bad Request';
        body.message = 'Database constraint violation';
        this.logger.error(
          `Prisma error ${prismaError.code}: ${prismaError.message}`,
        );
      }
    }

    if (body.statusCode >= 500) {
      this.logger.error(
        `Unexpected error on ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(body.statusCode).json(body);
  }
}
