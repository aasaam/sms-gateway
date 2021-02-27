class Config {
  /**
   * @param {Object} container
   * @param {import('fastify').FastifyInstance} container.fastify
   */
  constructor(container) {
    const { fastify } = container;

    fastify.route({
      url: fastify.openAPIBaseURL('/config'),
      method: 'GET',
      schema: {
        tags: ['config'],
        description: 'Public configurations',
      },
      handler: async (req, reply) => {
        reply.setResponseCacheTTL(120);
        const result = {};
        Object.keys(container.Config).forEach((name) => {
          if (name.match(/^ASM_PUBLIC_/)) {
            result[`${name.replace(/^ASM_PUBLIC_/g, '')}`] =
              container.Config[`${name}`];
          }
        });
        return result;
      },
    });
  }
}

module.exports = Config;
