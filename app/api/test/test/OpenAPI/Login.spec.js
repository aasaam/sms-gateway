// /* eslint-env jest */

const fsp = require('fs').promises;

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

  it('Login', async () => {
    const config = new ConfigClass(ConfigSchema, {});
    container = await initContainer(config);

    /** @type {import('fastify').FastifyInstance} */
    const fastify = container.resolve('fastify');
    const Config = container.resolve('Config');

    Object.keys(container.registrations).forEach((name) => {
      if (name.match(/OpenAPI$/)) {
        container.resolve(name);
      }
    });

    const users = JSON.parse(
      await fsp.readFile('/tmp/users.json', { encoding: 'utf-8' }),
    );

    fastify.route({
      preValidation: fastify.adminTokenCheck,
      url: '/admin',
      method: 'GET',
      handler: async () => true,
    });

    fastify.route({
      preValidation: fastify.userTokenCheck,
      url: '/user',
      method: 'GET',
      handler: async () => true,
    });

    fastify.route({
      preValidation: fastify.userApiKeyCheck,
      url: '/user-api',
      method: 'GET',
      handler: async () => true,
    });

    resp = await fastify.inject({
      url: fastify.openAPIBaseURL('/login'),
      method: 'POST',
      payload: {
        username: 'not-exist',
        password: 'not-valid',
      },
    });

    expect(resp.statusCode).toBe(400);

    resp = await fastify.inject({
      url: fastify.openAPIBaseURL('/login'),
      method: 'POST',
      payload: {
        username: users.default.user,
        password: 'not-valid',
      },
    });

    expect(resp.statusCode).toBe(400);

    resp = await fastify.inject({
      url: fastify.openAPIBaseURL('/login'),
      method: 'POST',
      payload: {
        username: users.default.user,
        password: users.default.pass,
      },
    });

    const userToken = resp.headers['x-token'];
    expect(resp.statusCode).toBe(200);

    resp = await fastify.inject({
      url: fastify.openAPIBaseURL('/login'),
      method: 'POST',
      payload: {
        username: users.admin.user,
        password: users.admin.pass,
      },
    });

    const adminToken = resp.headers['x-token'];
    expect(resp.statusCode).toBe(200);

    resp = await fastify.inject({
      url: '/admin',
      headers: {
        cookie: `${Config.ASM_PUBLIC_AUTH_COOKIE}=${adminToken}`,
      },
    });
    expect(resp.statusCode).toBe(200);

    resp = await fastify.inject({
      url: '/admin',
      headers: {
        cookie: `${Config.ASM_PUBLIC_AUTH_COOKIE}=1${adminToken}`,
      },
    });
    expect(resp.statusCode).toBe(403);

    resp = await fastify.inject({
      url: '/user',
      headers: {
        cookie: `${Config.ASM_PUBLIC_AUTH_COOKIE}=${userToken}`,
      },
    });
    expect(resp.statusCode).toBe(200);

    resp = await fastify.inject({
      url: '/user',
      headers: {
        cookie: `${Config.ASM_PUBLIC_AUTH_COOKIE}=1${userToken}`,
      },
    });
    expect(resp.statusCode).toBe(403);

    resp = await fastify.inject({
      url: '/user-api',
      headers: {
        [`${Config.ASM_PUBLIC_AUTH_USER_API_KEY}`]: `${users.default.apiKey}`,
      },
    });
    expect(resp.statusCode).toBe(200);

    resp = await fastify.inject({
      url: '/user-api',
      headers: {
        [`${Config.ASM_PUBLIC_AUTH_USER_API_KEY}`]: `1${users.default.apiKey}`,
      },
    });
    expect(resp.statusCode).toBe(403);

    resp = await fastify.inject({
      url: '/user-api',
    });
    expect(resp.statusCode).toBe(403);
  });
});
