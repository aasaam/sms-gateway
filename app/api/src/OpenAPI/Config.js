class Config {
  /**
   * @param {Object} container
   * @param {import('fastify').FastifyInstance} container.fastify
   * @param {import('../../addon').Config} container.Config
   */
  constructor({ fastify, Config: ConfigObject }) {
    fastify.route({
      url: fastify.openAPIBaseURL('/config'),
      method: 'GET',
      schema: {
        tags: ['config'],
        description: 'Public configurations',
      },
      handler: async (_, reply) => {
        reply.setResponseCacheTTL(120);
        const result = {};
        Object.keys(ConfigObject).forEach((name) => {
          if (name.match(/^ASM_PUBLIC_/)) {
            result[`${name.replace(/^ASM_PUBLIC_/g, '')}`] =
              ConfigObject[`${name}`];
          }
        });
        return result;
      },
    });
  }
}

module.exports = Config;
