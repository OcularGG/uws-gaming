import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';

export interface User {
  id: string;
  role: string;
  email: string;
}

export interface AuthenticatedRequest extends FastifyRequest {
  user?: User;
}

export interface JWTPayload {
  id: string;
  role: string;
  email: string;
  iat?: number;
  exp?: number;
}

export const authMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'No valid authorization header provided',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!config.jwt.secret) {
      request.log.error('JWT secret not configured');
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Authentication configuration error',
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;

    (request as AuthenticatedRequest).user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
    };

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    }

    request.log.error('Authentication error:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Authentication failed',
    });
  }
};

export const adminMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // Run auth middleware first
  await authMiddleware(request, reply);

  // Check if request was already replied to by auth middleware
  if (reply.sent) {
    return;
  }

  const user = (request as AuthenticatedRequest).user;
  if (!user || user.role !== 'admin') {
    return reply.status(403).send({
      error: 'Forbidden',
      message: 'Admin access required',
    });
  }
};

export const optionalAuthMiddleware = async (
  request: FastifyRequest,
  _reply: FastifyReply
) => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No auth header is okay for optional auth
      return;
    }

    const token = authHeader.substring(7);

    if (!config.jwt.secret) {
      // If JWT is not configured, skip auth
      return;
    }

    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;

    (request as AuthenticatedRequest).user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
    };

  } catch (error) {
    // For optional auth, we don't reject the request on auth errors
    request.log.debug('Optional auth failed:', error);
  }
};
