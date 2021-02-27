/* eslint-env jest */

const countryFilter = require('../../src/countryFilter');

describe(__filename.replace(__dirname, ''), () => {
  it('Should work', async () => {
    const list1 = countryFilter(['IR', 'DE'], []);
    expect(list1.includes('IR')).toBe(true);
    const list2 = countryFilter([]);
    expect(list2.includes('IR')).toBe(true);
  });
});
