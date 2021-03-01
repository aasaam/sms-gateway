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

  it('User', async () => {
    const config = new ConfigClass(ConfigSchema, {});
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
      url: fastify.openAPIBaseURL('/admin/user/list'),
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      payload: {},
      method: 'POST',
    });

    expect(resp.statusCode).toBe(200);

    resp = await fastify.inject({
      url: fastify.openAPIBaseURL('/admin/user/list'),
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      method: 'POST',
      payload: {
        filters: {
          id_C_LAST_SEEN: '1',
          createdAt_C_START_DATETIME: new Date().toISOString(),
          createdAt_C_END_DATETIME: new Date().toISOString(),
          name_C_SEARCH: 'text',
          nothing_important_will_skip: 'text',
        },
      },
    });

    expect(resp.statusCode).toBe(200);

    resp = await fastify.inject({
      url: fastify.openAPIBaseURL('/admin/user/list'),
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      method: 'POST',
      payload: {
        filters: {
          id_C_LAST_SEEN: '1',
          createdAt_C_START_DATETIME: new Date().toISOString(),
          createdAt_C_END_DATETIME: new Date().toISOString(),
          name_C_SEARCH: 'text',
          nothing_important_will_skip: 'text',
        },
      },
    });

    expect(resp.statusCode).toBe(200);

    resp = await fastify.inject({
      url: fastify.openAPIBaseURL('/admin/user/update'),
      method: 'POST',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      payload: {
        userId: users.default.id,
        newPassword: users.default.pass,
        active: true,
        revokeApiKey: true,
      },
    });

    expect(resp.statusCode).toBe(200);

    resp = await fastify.inject({
      url: fastify.openAPIBaseURL('/admin/user/update'),
      method: 'POST',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      payload: {
        userId: users.default.id,
        active: true,
      },
    });

    expect(resp.statusCode).toBe(200);
  });
});
