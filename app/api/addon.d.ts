import { FastifyInstance, FastifyRequest, FastifyReply, FastifySchema } from 'fastify';
import { IncomingMessage } from "http";
import { RateLimitPluginOptions } from 'fastify-rate-limit';
import { SecurityRequirementObject } from 'openapi3-ts'

type RawHeaders = { [k: string]: string[] };
type Config = { [key: string]: any };

type Token = {
  uid: number,
  admin: boolean,
};

declare module 'http' {
  interface IncomingMessage {
    token?: Token,
    getFirstHeader(name: string): string;
    getClientIP(): string;
  }
}

interface AdapterSuccessInput {
  status: number,
  headers: RawHeaders,
  text: string,
}

interface AdapterSuccessReturn {
  result: boolean,
  response: {
    adapter: string,
    status: number,
    headers: RawHeaders,
    body: string,
  },
}

declare module 'fastify' {
  interface FastifyInstance {
    openAPIBaseURL(path: string): string,
    userAuthPreHandler(req: FastifyRequest, reply: FastifyReply, next): void;
    userApiKeyCheck(req: FastifyRequest, reply: FastifyReply): Promise<any>
    userTokenCheck(req: FastifyRequest, reply: FastifyReply): Promise<any>
  }
  interface FastifySchema {
    hide?: boolean,
    description?: string,
    consumes?: string[],
    tags?: string[],
    security?: SecurityRequirementObject[],
  }
  interface FastifyReply {
    setResponseCacheTTL(ttl: number, staleAddon?: number): void;
  }
}
