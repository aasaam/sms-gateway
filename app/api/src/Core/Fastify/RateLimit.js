const fastifyRateLimit = require('fastify-rate-limit');

class RateLimit {
  /**
   * @param {import('fastify').FastifyInstance} fastify
   */
  static setup(fastify) {
    /** @type {import('fastify-rate-limit').RateLimitPluginOptions} */
    const config = {
      global: false,
      max: 10,
      timeWindow: 5000,
      cache: 10000,
      skipOnError: false,
      keyGenerator: (req) => req.raw.getClientIP(),
      addHeaders: {
        'x-ratelimit-limit': true,
        'x-ratelimit-remaining': true,
        'x-ratelimit-reset': true,
        'retry-after': true,
      },
    };

    // @ts-ignore
    fastify.register(fastifyRateLimit, config);
  }
}

module.exports = {
  RateLimit,
};
