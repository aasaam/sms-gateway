const { initContainer } = require('./src/Container');
const { Config: ConfigClass } = require('./src/Config');
const { ConfigSchema } = require('./src/ConfigSchema');

(async function start() {
  const c = new ConfigClass(ConfigSchema, {});
  const container = await initContainer(c);

  /** @type {import('fastify').FastifyInstance} */
  const fastify = container.resolve('fastify');
  const Config = container.resolve('Config');

  Object.keys(container.registrations).forEach((name) => {
    if (name.match(/OpenAPI$/)) {
      container.resolve(name);
    }
  });

  await fastify.listen(Config.ASM_APP_PORT, '0.0.0.0');
})();
