/* eslint-disable sonarjs/no-identical-functions */
/* eslint-disable sonarjs/no-duplicate-string */
// /* eslint-env jest */

const fsp = require('fs').promises;

const { initContainer } = require('../../../src/Container');
const { Config: ConfigClass } = require('../../../src/Config');
const { ConfigSchema } = require('../../../src/ConfigSchema');

const Helper = require('../../Helper');

describe(__filename.replace(__dirname, ''), () => {
  /** @type {import('awilix').AwilixContainer} */
  let container;
  /** @type {import('light-my-request').Response} */
  let resp;

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await container.dispose();
  });

  it('LocalServer disabled', async () => {
    const config = new ConfigClass(ConfigSchema, {
      ASM_PUBLIC_ADAPTERS: 'other',
    });
    container = await initContainer(config);

    /** @type {import('fastify').FastifyInstance} */
    const fastify = container.resolve('fastify');
    const Config = container.resolve('Config');

    const users = JSON.parse(
      await fsp.readFile('/tmp/users.json', { encoding: 'utf-8' }),
    );

    const adminToken = await Helper.token(Config, {
      uid: users.admin.id,
      admin: true,
    });

    Object.keys(container.registrations).forEach((name) => {
      if (name.match(/OpenAPI$/)) {
        container.resolve(name);
      }
    });

    resp = await fastify.inject({
      url: fastify.openAPIBaseURL('/local-adapter'),
      method: 'POST',
      payload: {
        mobile: '+989011230000',
        message: 'HELLO',
      },
    });

    expect(resp.statusCode).toBe(503);

    resp = await fastify.inject({
      url: fastify.openAPIBaseURL('/local-adapter/list'),
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      payload: {},
      method: 'POST',
    });

    expect(resp.statusCode).toBe(503);
  });

  it('LocalServer', async () => {
    const config = new ConfigClass(ConfigSchema, {
      ASM_PUBLIC_ADAPTERS: 'local',
    });
    container = await initContainer(config);

    /** @type {import('fastify').FastifyInstance} */
    const fastify = container.resolve('fastify');
    const Config = container.resolve('Config');

    const users = JSON.parse(
      await fsp.readFile('/tmp/users.json', { encoding: 'utf-8' }),
    );

    const adminToken = await Helper.token(Config, {
      uid: users.admin.id,
      admin: true,
    });

    Object.keys(container.registrations).forEach((name) => {
      if (name.match(/OpenAPI$/)) {
        container.resolve(name);
      }
    });

    resp = await fastify.inject({
      url: fastify.openAPIBaseURL('/local-adapter/list'),
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      payload: {},
      method: 'POST',
    });

    expect(resp.statusCode).toBe(200);

    resp = await fastify.inject({
      url: fastify.openAPIBaseURL('/local-adapter/list'),
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      method: 'POST',
      payload: {
        filters: {
          id_C_LAST_SEEN: '1',
          createdAt_C_START_DATETIME: new Date().toISOString(),
          createdAt_C_END_DATETIME: new Date().toISOString(),
          mobile_C_SEARCH: 'text',
          message_C_FULL_TEXT_SEARCH: 'text',
          nothing_important_will_skip: 'text',
        },
      },
    });

    expect(resp.statusCode).toBe(200);
  });

  it('LocalServer non localhost', async () => {
    const config = new ConfigClass(ConfigSchema, {
      ASM_PUBLIC_ADAPTERS: 'local',
    });
    container = await initContainer(config);

    /** @type {import('fastify').FastifyInstance} */
    const fastify = container.resolve('fastify');

    Object.keys(container.registrations).forEach((name) => {
      if (name.match(/OpenAPI$/)) {
        container.resolve(name);
      }
    });

    resp = await fastify.inject({
      url: fastify.openAPIBaseURL('/local-adapter'),
      method: 'POST',
      headers: {
        'x-real-ip': '8.8.8.8',
      },
      payload: {
        mobile: '+989011230001',
        message: 'HELLO',
      },
    });

    expect(resp.statusCode).toBe(403);
  });

  it('LocalServer fail chance', async () => {
    const config = new ConfigClass(ConfigSchema, {
      ASM_PUBLIC_LOCAL_FAILED_CHANCE: '2',
      ASM_PUBLIC_ADAPTERS: 'local',
    });
    container = await initContainer(config);

    /** @type {import('fastify').FastifyInstance} */
    const fastify = container.resolve('fastify');

    Object.keys(container.registrations).forEach((name) => {
      if (name.match(/OpenAPI$/)) {
        container.resolve(name);
      }
    });

    const promises = [];
    const statusCodeResults = {};
    for (let i = 0; i < 10; i += 1) {
      promises.push(
        // eslint-disable-next-line no-async-promise-executor, no-loop-func
        new Promise(async (resolve) => {
          resp = await fastify.inject({
            url: fastify.openAPIBaseURL('/local-adapter'),
            method: 'POST',
            payload: {
              mobile: `+98901123000${i}`,
              message: 'HELLO',
            },
          });
          statusCodeResults[resp.statusCode] = true;
          resolve(true);
        }),
      );
    }

    await Promise.all(promises);

    expect(statusCodeResults[200]).toBe(true);
    expect(statusCodeResults[502]).toBe(true);
  });
});
