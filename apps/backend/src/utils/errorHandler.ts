import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import * as Sentry from '@sentry/node';
import { logger } from './logger';

export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  logger.error({
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
    },
    request: {
      url: request.url,
      method: request.method,
      headers: request.headers,
      params: request.params,
      query: request.query,
    },
  }, 'Request error');

  // Send error to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error);
  }

  // Handle validation errors
  if (error.validation) {
    return reply.status(400).send({
      error: 'Validation Error',
      message: 'Request validation failed',
      details: error.validation,
      statusCode: 400,
    });
  }

  // Handle rate limit errors
  if (error.statusCode === 429) {
    return reply.status(429).send({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded',
      statusCode: 429,
    });
  }

  // Handle not found errors
  if (error.statusCode === 404) {
    return reply.status(404).send({
      error: 'Not Found',
      message: 'The requested resource was not found',
      statusCode: 404,
    });
  }

  // Handle internal server errors
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : error.message;

  return reply.status(statusCode).send({
    error: statusCode === 500 ? 'Internal Server Error' : error.name,
    message,
    statusCode,
    ...(process.env.NODE_ENV !== 'production' && {
      stack: error.stack,
    }),
  });
};
