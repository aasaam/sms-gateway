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

  let payload;

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

    resp = await fastify.inject({
      url: fastify.openAPIBaseURL('/send'),
      method: 'POST',
      headers: {
        [`${Config.ASM_PUBLIC_AUTH_USER_API_KEY}`]: `${users.default.apiKey}`,
      },
      payload: {
        mobile: '+989011230000',
        message: 'test',
      },
    });

    expect(resp.statusCode).toBe(200);
    expect(resp.payload).not.toBeFalsy();

    payload = JSON.parse(resp.payload);
    expect(payload).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          mobile: expect.any(String),
        }),
      ]),
    );

    resp = await fastify.inject({
      url: fastify.openAPIBaseURL('/send'),
      method: 'POST',
      headers: {
        [`${Config.ASM_PUBLIC_AUTH_USER_API_KEY}`]: `${users.default.apiKey}`,
      },
      payload: {
        mobile: ['+989011230001', '+989011230002', '+982177889922'],
        message: 'test',
      },
    });

    expect(resp.statusCode).toBe(200);
    expect(resp.payload).not.toBeFalsy();

    payload = JSON.parse(resp.payload);
    expect(payload).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          mobile: expect.any(String),
        }),
      ]),
    );
  });
});
