const cookie = require('cookie');
const { to } = require('await-to-js');

// eslint-disable-next-line node/no-missing-require, import/no-unresolved
const { default: SignJWT } = require('jose/jwt/sign');
// eslint-disable-next-line node/no-missing-require, import/no-unresolved
const { default: jwtVerify } = require('jose/jwt/verify');

class JWT {
  constructor({ Config }) {
    /** @private */
    this.cookieName = Config.ASM_PUBLIC_AUTH_COOKIE;

    /** @private */
    this.secret = new TextEncoder().encode(Config.ASM_AUTH_HMAC_SECRET);

    /** @private */
    this.alg = Config.ASM_AUTH_HMAC_ALG;
  }

  /**
   * @param {Object} payload
   * @param {Number} ttl
   * @return {Promise<String>}
   */
  async sign(payload, ttl) {
    const nowUnix = Math.floor(Date.now() / 1000) - 1;
    return new SignJWT(payload)
      .setNotBefore(nowUnix)
      .setExpirationTime(nowUnix + ttl + 1)
      .setProtectedHeader({ alg: this.alg })
      .sign(this.secret);
  }

  /**
   * @param {String} token
   * @return {Promise<import('jose/types').JWTVerifyResult>}
   */
  async verify(token) {
    return jwtVerify(token, this.secret);
  }

  /**
   * @param {import('http').IncomingMessage} req
   * @returns {Promise<Object>}
   */
  async verifyFromRequest(req) {
    let match = '';

    if (req.headers.cookie && req.headers.cookie.includes(this.cookieName)) {
      const parsedCookies = cookie.parse(req.headers.cookie);
      if (parsedCookies[this.cookieName]) {
        match = parsedCookies[this.cookieName];
      }
    } else if (req.headers.authorization) {
      const m = req.headers.authorization.match(/^Bearer (.*)$/);
      if (m && m[1]) {
        [, match] = m;
      }
    }

    if (match !== '') {
      const [, token] = await to(this.verify(match));
      if (token) {
        return token.payload;
      }
    }

    return false;
  }
}

module.exports = JWT;
