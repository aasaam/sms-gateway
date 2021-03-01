class Local {
  constructor({ Config }) {
    this.name = this.constructor.name.toLocaleLowerCase();
    this.description = 'For testing local just show in panel for development';
    this.port = Config.ASM_APP_PORT;

    this.priority = 1000;

    this.active = Config.ASM_PUBLIC_ADAPTERS.map((i) =>
      i.trim().toLocaleLowerCase(),
    ).includes(this.name);
  }

  /**
   * @param {Object} parameter
   * @param {String} parameter.mobile
   * @param {String} parameter.message
   * @param {String} parameter.country
   *
   * @return  {Object|Boolean}
   */
  setUp({ mobile, message }) {
    if (!this.active) {
      return false;
    }
    return {
      adapter: this.name,
      url: `http://127.0.0.1:${this.port}/api/open-api/local-adapter`,
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
   * @param {import('../../addon').AdapterSuccessInput} response
   * @returns {Promise<import('../../addon').AdapterSuccessReturn>}
   */
  async success({ status, headers, text }) {
    const response = {
      adapter: this.name,
      status,
      headers,
      body: JSON.parse(text),
    };
    return {
      result: status === 200 && Number.isInteger(response.body),
      response,
    };
  }
}

module.exports = Local;
