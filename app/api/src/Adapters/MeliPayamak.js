const convert = require('xml-js');

const countryFilter = require('../countryFilter');

class MeliPayamak {
  constructor({ Config }) {
    this.name = this.constructor.name.toLocaleLowerCase();
    this.description = 'More info on https://melipayamak.com';

    this.active =
      !Config.ASM_PUBLIC_ADAPTERS.includes('local') &&
      Config.ASM_PUBLIC_ADAPTERS.includes(this.name) &&
      Config.ASM_MELIPAYAMAK_NUMBER &&
      Config.ASM_MELIPAYAMAK_PRIORITY &&
      Config.ASM_MELIPAYAMAK_USERNAME &&
      Config.ASM_MELIPAYAMAK_PASSWORD;

    if (this.active) {
      this.priority = Config.ASM_MELIPAYAMAK_PRIORITY;
      this.from = Config.ASM_MELIPAYAMAK_NUMBER;
      this.username = Config.ASM_MELIPAYAMAK_USERNAME;
      this.password = Config.ASM_MELIPAYAMAK_PASSWORD;

      this.countries = countryFilter(Config.ASM_MELIPAYAMAK_COUNTRIES, ['IR']);
    }
  }

  /**
   * @param {String} country
   * @param {String} mobile
   * @param {String} text
   *
   * @return  {Object|Boolean}
   */
  setUp({ country, mobile, text }) {
    if (
      !this.active ||
      (this.countries.length && !this.countries.includes(country))
    ) {
      return false;
    }
    const body = new URLSearchParams();
    body.append('username', this.username);
    body.append('password', this.password);
    body.append('from', this.from);
    body.append('text', text);
    body.append('to', mobile);
    body.append('isflash', 'false');
    return {
      adapter: this.name,
      url: 'https://api.payamak-panel.com/post/send.asmx/SendSimpleSMS2',
      mode: 'text',
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
   * @returns {Promise<any>}
   */
  // eslint-disable-next-line class-methods-use-this
  success({ status, headers, text }) {
    const resp = {
      status,
      headers,
      body: text,
    };
    const json = JSON.parse(
      convert.xml2json(resp.body, {
        compact: true,
        spaces: 4,
      }),
    );
    return {
      result:
        status === 200 &&
        'string' in json &&
        // eslint-disable-next-line no-underscore-dangle
        '_text' in json.string &&
        // eslint-disable-next-line no-underscore-dangle
        /^[0-9]{3,}$/.test(json.string._text),
      resp,
    };
  }
}

module.exports = MeliPayamak;
