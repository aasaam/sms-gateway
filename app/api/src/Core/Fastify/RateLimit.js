const fastifyRateLimit = require('fastify-rate-limit');

class RateLimit {
  /**
   * @param {import('fastify').FastifyInstance} fastify
   */
  static setup(fastify) {
    /** @type {import('fastify-rate-limit').RateLimitPluginOptions} */
    const config = {
      global: false,
      max: 3,
      ban: 2,
      timeWindow: 1000 * 60,
      cache: 1000 * 60 * 2,
      skipOnError: false,
      keyGenerator: (req) => req.raw.getClientIP(),
      addHeaders: {
        'x-ratelimit-limit': true,
        'x-ratelimit-remaining': true,
        'x-ratelimit-reset': true,
        'retry-after': true,
      },
    };

    fastify.register(fastifyRateLimit, config);
  }
}

module.exports = {
  RateLimit,
};
