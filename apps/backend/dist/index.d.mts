import { FastifyInstance } from 'fastify';

declare const build: (opts?: {
    logger?: boolean;
}) => Promise<FastifyInstance>;

export { build };
