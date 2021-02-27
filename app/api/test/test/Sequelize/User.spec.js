/* eslint-env jest */

const { initContainer } = require('../../../src/Container');
const { Config } = require('../../../src/Config');
const { ConfigSchema } = require('../../../src/ConfigSchema');

describe(__filename.replace(__dirname, ''), () => {
  /** @type {import('awilix').AwilixContainer} */
  let container;

  beforeAll(async () => {
    const config = new Config(ConfigSchema, {});
    container = await initContainer(config);
  });
  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await container.dispose();
  });

  it('Methods', async () => {
    const UserEntity = container.resolve('UserEntity');
    expect(UserEntity.randomAPIKey()).toBeTruthy();
    const randomPass = [Date.now().toString(36), Math.random().toString()].join(
      ':',
    );
    const hp = await UserEntity.hashPassword(randomPass);
    expect(await UserEntity.validPassword(hp, randomPass)).toBe(true);
    expect(await UserEntity.validPassword(hp, '1')).toBe(false);
    expect(await UserEntity.validPassword(1, 1)).toBe(false);
  });
});
