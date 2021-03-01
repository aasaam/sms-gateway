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

    const userToken = await Helper.token(Config, {
      uid: users.default.id,
      admin: false,
    });

    Object.keys(container.registrations).forEach((name) => {
      if (name.match(/OpenAPI$/)) {
        container.resolve(name);
      }
    });

    resp = await fastify.inject({
      url: fastify.openAPIBaseURL('/user/revoke-api-key'),
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });

    expect(resp.statusCode).toBe(200);

    resp = await fastify.inject({
      url: fastify.openAPIBaseURL('/user/change-password'),
      method: 'PUT',
      headers: {
        authorization: `Bearer ${userToken}`,
      },
      payload: {
        currentPassword: users.default.pass,
        newPassword: users.default.pass,
      },
    });

    expect(resp.statusCode).toBe(200);

    resp = await fastify.inject({
      url: fastify.openAPIBaseURL('/user/change-password'),
      method: 'PUT',
      headers: {
        authorization: `Bearer ${userToken}`,
      },
      payload: {
        currentPassword: '0123456789',
        newPassword: users.default.pass,
      },
    });

    expect(resp.statusCode).toBe(400);
  });
});
