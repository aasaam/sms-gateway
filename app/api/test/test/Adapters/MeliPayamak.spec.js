// /* eslint-env jest */

const { initContainer } = require('../../../src/Container');
const { Config: ConfigClass } = require('../../../src/Config');
const { ConfigSchema } = require('../../../src/ConfigSchema');

describe(__filename.replace(__dirname, ''), () => {
  /** @type {import('awilix').AwilixContainer} */
  let container;

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await container.dispose();
  });

  it('MeliPayamak', async () => {
    const config = new ConfigClass(ConfigSchema, {
      ASM_PUBLIC_ADAPTERS: 'melipayamak',
      ASM_MELIPAYAMAK_NUMBER: '3000',
      ASM_MELIPAYAMAK_USERNAME: '30001',
      ASM_MELIPAYAMAK_PASSWORD: '30002',
      ASM_MELIPAYAMAK_PRIORITY: '1',
      ASM_MELIPAYAMAK_COUNTRIES: 'IR',
    });
    container = await initContainer(config);
    const MeliPayamakAdapter = container.resolve('MeliPayamakAdapter');
    const ok = MeliPayamakAdapter.setUp({
      country: 'IR',
      mobile: '+989011230000',
      message: 'HELLO',
    });

    expect(ok).toBeTruthy();

    const testXML =
      '<?xml version="1.0" encoding="utf-8"?><string xmlns="http://tempuri.org/">5300000000000000000</string>';

    expect(
      (
        await MeliPayamakAdapter.success({
          status: 200,
          text: testXML,
          headers: [],
        })
      ).result,
    ).toBe(true);

    expect(
      (
        await MeliPayamakAdapter.success({
          status: 200,
          text: '<string xmlns="http://tempuri.org/">1</string>',
          headers: [],
        })
      ).result,
    ).toBe(false);
  });

  it('MeliPayamak deactivate', async () => {
    const Config = new ConfigClass(ConfigSchema, {
      ASM_PUBLIC_ADAPTERS: 'other',
      ASM_MELIPAYAMAK_NUMBER: '30000',
      ASM_MELIPAYAMAK_USERNAME: '30000',
      ASM_MELIPAYAMAK_PASSWORD: '30000',
      ASM_MELIPAYAMAK_PRIORITY: '1',
      ASM_MELIPAYAMAK_COUNTRIES: 'IR',
    });
    container = await initContainer(Config);
    const MeliPayamakAdapter = container.resolve('MeliPayamakAdapter');
    const notOk = MeliPayamakAdapter.setUp({
      country: 'IR',
      mobile: '+989011230000',
      message: 'HELLO',
    });
    expect(notOk).toBe(false);
  });
});
