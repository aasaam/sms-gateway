const convert = require('xml-js');

const countryFilter = require('../countryFilter');

class MeliPayamak {
  constructor({ Config }) {
    this.name = this.constructor.name.toLocaleLowerCase();
    this.description = 'More info on https://melipayamak.com';

    this.active =
      Config.ASM_PUBLIC_LOCAL_ONLY === false &&
      Config.ASM_MELIPAYAMAK_NUMBER &&
      Config.ASM_MELIPAYAMAK_USERNAME &&
      Config.ASM_MELIPAYAMAK_PASSWORD &&
      Config.ASM_ADAPTERS.split(',')
        .map((i) => i.trim().toLocaleLowerCase())
        .includes(this.name) &&
      this.from &&
      this.username &&
      this.password;

    if (this.active) {
      this.from = Config.ASM_MELIPAYAMAK_NUMBER;
      this.username = Config.ASM_MELIPAYAMAK_USERNAME;
      this.password = Config.ASM_MELIPAYAMAK_PASSWORD;

      this.countries = countryFilter(Config.ASM_MELIPAYAMAK_COUNTRIES, ['IR']);
    }
  }

  /**
   * @param {String} country
   * @param {String} to
   * @param {String} text
   *
   * @return  {Object|Boolean}
   */
  setUp({ country, to, text }) {
    if (this.active) {
      return false;
    }
    if (this.countries.length && !this.countries.includes(country)) {
      return false;
    }
    const body = new URLSearchParams();
    body.append('username', this.username);
    body.append('password', this.password);
    body.append('from', this.from);
    body.append('text', text);
    body.append('to', to);
    body.append('isflash', 'false');
    return {
      adapter: this.name,
      url: 'https://api.payamak-panel.com/post/send.asmx/SendSimpleSMS2',
      fetch: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      },
    };
  }

  /**
   * @param {import('node-fetch').Response} response
   */
  // eslint-disable-next-line class-methods-use-this
  async success(response) {
    const body = await response.text();
    const json = JSON.parse(convert.xml2json(body));
    // eslint-disable-next-line no-underscore-dangle
    return response.status === 200 && json.string._text.match(/[0-9]{3,}/);
  }
}

module.exports = MeliPayamak;
