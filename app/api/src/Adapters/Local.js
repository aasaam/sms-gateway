class Local {
  constructor({ Config }) {
    this.name = this.constructor.name.toLocaleLowerCase();
    this.description = 'For testing local just show in panel for development';
    this.port = Config.ASM_APP_PORT;

    this.active = Config.ASM_PUBLIC_ADAPTERS.map((i) =>
      i.trim().toLocaleLowerCase(),
    ).includes(this.name);
  }

  /**
   * @param {String} country
   * @param {String} mobile
   * @param {String} text
   *
   * @return  {Object|Boolean}
   */
  setUp({ mobile, message }) {
    if (!this.active) {
      return false;
    }
    return {
      adapter: this.name,
      url: `http://127.0.0.1:${this.port}/api/local-adapter`,
      mode: 'json',
      fetch: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile,
          message,
        }),
      },
    };
  }

  /**
   * @param {import('node-fetch').Response} response
   * @returns {Promise<any>}
   */
  // eslint-disable-next-line class-methods-use-this
  success({ status, headers, json }) {
    const resp = {
      status,
      headers,
      body: json,
    };
    return {
      result: status === 200 && Number.isInteger(json),
      resp,
    };
  }
}

module.exports = Local;
