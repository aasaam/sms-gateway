const { fastify } = require('fastify');
const fastifyCookie = require('fastify-cookie');
const fastifyStatic = require('fastify-static').default;

const { Decorate } = require('./Fastify/Decorate.js');
const { ErrorHandler } = require('./Fastify/ErrorHandler.js');
const { OpenAPI } = require('./Fastify/OpenAPI.js');
const { RateLimit } = require('./Fastify/RateLimit.js');

const scheme = require('../Scheme');

class Fastify {
  constructor(container) {
    /**
     * @private
     */
    this.fastify = fastify({
      trustProxy: true,
      requestIdHeader: 'x-request-id',
      requestIdLogLabel: 'rid',
      // logger: false,
      // logger: true,
      maxParamLength: 256,
    });

    ErrorHandler.setup(this.fastify, container);

    this.fastify.register(fastifyCookie);
    this.fastify.register(fastifyStatic, {
      root: '/app/api/public',
      prefix: container.Config.ASM_PUBLIC_BASE_URL,
    });

    Decorate.setup(this.fastify, container);

    RateLimit.setup(this.fastify);
    OpenAPI.setup(this.fastify, container);

    scheme.forEach((s) => {
      this.fastify.addSchema(s);
    });
  }

  /**
   * @returns {import('fastify').FastifyInstance}
   */
  getFastify() {
    return this.fastify;
  }
}

module.exports = Fastify;
