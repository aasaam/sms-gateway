// /* eslint-env jest */

const { initContainer } = require('../../../src/Container');
const { Config: ConfigClass } = require('../../../src/Config');
const { ConfigSchema } = require('../../../src/ConfigSchema');

describe(__filename.replace(__dirname, ''), () => {
  /** @type {import('awilix').AwilixContainer} */
  let container;
  /** @type {import('light-my-request').Response} */
  let resp;

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await container.dispose();
  });

  it('Fastify', async () => {
    const config = new ConfigClass(ConfigSchema, {});
    container = await initContainer(config);

    /** @type {import('fastify').FastifyInstance} */
    const fastify = container.resolve('fastify');

    fastify.route({
      url: '/check1',
      method: 'GET',
      handler: async (req, reply) => {
        reply.setResponseCacheTTL(3);
        req.raw.getFirstHeader('x-check');
        req.raw.getFirstHeader('x-no-check');
        req.raw.getClientIP();
        return true;
      },
    });

    fastify.route({
      url: '/err1',
      method: 'POST',
      schema: {
        body: {
          type: 'object',
          properties: {
            ip: {
              type: 'string',
              format: 'ipv4',
            },
          },
        },
      },
      handler: async () => new Error('Failed'),
    });

    resp = await fastify.inject({
      headers: {
        'x-check': '1',
      },
      url: '/check1',
    });

    expect(resp.headers.pragma).toBe('public');

    resp = await fastify.inject({
      headers: {
        'x-check': ['1', '2'],
      },
      url: '/check1',
    });

    resp = await fastify.inject({
      method: 'POST',
      payload: {
        ip: '1',
      },
      url: '/err1',
    });
    expect(resp.statusCode).toBe(422);

    resp = await fastify.inject({
      method: 'POST',
      payload: {
        ip: '127.0.0.1',
      },
      url: '/err1',
    });
    expect(resp.statusCode).toBe(500);

    resp = await fastify.inject({
      method: 'GET',
      url: '/ww/err1-not-exist-ok',
    });
    expect(resp.statusCode).toBe(404);
  });

  it('Fastify production', async () => {
    const config = new ConfigClass(ConfigSchema, {
      ASM_PUBLIC_APP_TEST: 'false',
    });
    container = await initContainer(config);

    /** @type {import('fastify').FastifyInstance} */
    const fastify = container.resolve('fastify');

    fastify.route({
      url: '/err1',
      method: 'POST',
      schema: {
        body: {
          type: 'object',
          properties: {
            ip: {
              type: 'string',
              format: 'ipv4',
            },
          },
        },
      },
      handler: async () => {
        const a = new Error('Failed');
        // @ts-ignore
        a.code = 503;
        return a;
      },
    });

    resp = await fastify.inject({
      method: 'POST',
      payload: {
        ip: '1',
      },
      url: '/err1',
    });
    expect(resp.statusCode).toBe(422);

    resp = await fastify.inject({
      method: 'POST',
      payload: {
        ip: '127.0.0.1',
      },
      url: '/err1',
    });
    expect(resp.statusCode).toBe(500);

    resp = await fastify.inject({
      method: 'GET',
      url: '/ww/err1-not-exist-ok',
    });
    expect(resp.statusCode).toBe(404);
  });
});
