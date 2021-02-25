class Local {
  constructor({ Config }) {
    this.name = this.constructor.name.toLocaleLowerCase();
    this.description = 'For testing local just show in panel for development';

    this.active = Config.ASM_PUBLIC_LOCAL_ONLY;

    this.countries = [];
  }

  setUp({ country, to, text }) {
    if (this.countries.length && !this.countries.includes(country)) {
      return false;
    }
    const body = new URLSearchParams();
    body.append('text', text);
    body.append('to', to);
    return {
      adapter: this.name,
      url: 'http://127.0.0.1:3001/api/local-test',
      fetch: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          text,
        }),
      },
    };
  }

  /**
   * @param {import('node-fetch').Response} response
   */
  // eslint-disable-next-line class-methods-use-this
  async success(response) {
    const body = await response.json();
    return response.status === 200 && body === true;
  }
}

module.exports = Local;
