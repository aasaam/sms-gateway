class Decorate {
  /**
   * @param {import('fastify').FastifyInstance} fastify
   * @param {Object} container
   */
  static setup(fastify, container) {
    Decorate.baseURL(fastify, container);
    Decorate.onRequest(fastify, container);
    Decorate.decorateReply(fastify);
  }

  /**
   * @private
   * @param {import('fastify').FastifyInstance} fastify
   * @param {Object} container
   */
  static baseURL(fastify, container) {
    fastify.decorate(
      'openAPIBaseURL',
      /**
       * @param {String} path
       */
      (path) =>
        `${container.Config.ASM_PUBLIC_BASE_URL.replace(
          /\/+$/g,
          '',
        )}/api/open-api${path}`,
    );
  }

  /**
   * @private
   * @param {import('fastify').FastifyInstance} fastify
   * @param {Object} container
   */
  static onRequest(fastify, container) {
    // http no cache by default
    fastify.addHook('onRequest', async (_, reply) => {
      reply.header('Expires', new Date(0).toUTCString());
      reply.header('Pragma', 'no-cache');
      reply.header(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, max-age=0',
      );
    });

    fastify.addHook('onRequest', async (req) => {
      const payload = await container.JWT.verifyFromRequest(req.raw);
      if (payload) {
        req.raw.token = payload;
      }

      // get client ip
      req.raw.getClientIP = function getClientIP() {
        return req.headers['x-real-ip'] || req.ip;
      };
    });
  }

  /**
   * @private
   * @param {import('fastify').FastifyInstance} fastify
   */
  static decorateReply(fastify) {
    fastify.decorateReply(
      'setResponseCacheTTL',
      /**
       * @param {Number} ttl
       */
      function setResponseCacheTTL(ttl) {
        const date = new Date();
        const expireDate = new Date();
        expireDate.setSeconds(expireDate.getSeconds() + ttl);
        this.header(
          'Cache-Control',
          `max-age=${ttl}, public, post-check=0, pre-check=0`,
        );
        this.header('Pragma', 'public');
        this.header('Last-Modified', date.toUTCString());
        this.header('Expires', expireDate.toUTCString());
        this.header('X-Accel-Expires', expireDate.toUTCString());
      },
    );
  }
}

module.exports = {
  Decorate,
};
