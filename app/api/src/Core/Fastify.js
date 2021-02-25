const { fastify } = require('fastify');

const { Decorate } = require('./Fastify/Decorate.js');
const { ErrorHandler } = require('./Fastify/ErrorHandler.js');
const { OpenAPI } = require('./Fastify/OpenAPI.js');
const { RateLimit } = require('./Fastify/RateLimit.js');

class Fastify {
  constructor(container) {
    /**
     * @private
     */
    this.fastify = fastify({
      trustProxy: true,
      requestIdHeader: 'x-request-id',
      requestIdLogLabel: 'rid',
      disableRequestLogging: false,
      logger: false,
      maxParamLength: 256,
    });

    Decorate.setup(this.fastify, container);
    ErrorHandler.setup(this.fastify, container);

    RateLimit.setup(this.fastify, container);
    OpenAPI.setup(this.fastify, container);
  }

  /**
   * @returns {import('fastify').FastifyInstance}
   */
  getFastify() {
    return this.fastify;
  }
}

module.exports = Fastify;
