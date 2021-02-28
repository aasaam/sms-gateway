/* eslint-env jest */

jest.setTimeout(60000);

const fsp = require('fs').promises;

const { initContainer } = require('../../src/Container');
const { Config: ConfigClass } = require('../../src/Config');
const { ConfigSchema } = require('../../src/ConfigSchema');

describe(__filename.replace(__dirname, ''), () => {
  /** @type {import('awilix').AwilixContainer} */
  let container;

  beforeAll(async () => {
    const config = new ConfigClass(ConfigSchema, {});
    container = await initContainer(config);
  });
  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await container.dispose();
  });

  it('Resolve All', async () => {
    Object.keys(container.registrations).forEach((name) => {
      container.resolve(name);
    });

    const InitData = container.resolve('InitData');
    const result = await InitData.init();

    if (result.admin) {
      await fsp.writeFile('/tmp/users.json', JSON.stringify(result), {
        encoding: 'utf-8',
      });
    }

    await InitData.init();
    await new Promise((r) => setTimeout(r, 1000));
    expect(1).toBeTruthy();
  });
});
