const { to } = require('await-to-js');
const { Organization } = require('@aasaam/information');

const fastifyOpenAPI = require('fastify-oas');

const { GenericResponse } = require('./GenericResponse.js');

const description = `
### Disclaimer

By using this [API](https://en.wikipedia.org/wiki/API), assume you know what is doing.

#### Support

Ask the for help from **${Organization.en.description}** support center.

* ${Organization.en.telephone.join(', ')}
* ${Organization.en.address.addressLocality}, ${
  Organization.en.address.addressRegion
}, ${Organization.en.address.addressCountry}
`;

class OpenAPI {
  /**
   * @param {import('fastify').FastifyInstance} fastify
   * @param {Object} container
   * @param {import('sequelize').ModelCtor<import('sequelize').Model>} container.UserEntity
   * @param {import('../JWT')} container.JWT
   * @param {import('../../../addon').Config} container.Config
   */
  static setup(fastify, container) {
    OpenAPI.swaggerUI(fastify, container);

    fastify.decorate(
      'userApiKeyCheck',
      /**
       * @param {import('fastify').FastifyRequest} req
       * @param {import('fastify').FastifyReply} reply
       */
      async (req, reply) => {
        let found = false;
        const apiKey =
          req.headers[`${container.Config.ASM_PUBLIC_AUTH_USER_API_KEY}`] ||
          req.query[container.Config.ASM_PUBLIC_AUTH_USER_API_KEY];

        if (apiKey && apiKey.match(/^[a-z0-9]{16,}$/i)) {
          const user = await container.UserEntity.findOne({
            where: {
              apiKey,
              active: true,
              admin: false,
            },
          });

          if (user && user.name) {
            req.raw.user = user.safeJSON;
            found = true;
          }
        }

        if (found === false) {
          const schemaError = new GenericResponse(403);
          return schemaError.reply(reply);
        }
        return true;
      },
    );

    fastify.decorate(
      'userTokenCheck',
      /**
       * @param {import('fastify').FastifyRequest} req
       * @param {import('fastify').FastifyReply} reply
       */
      async (req, reply) => {
        const [, token] = await to(container.JWT.verifyFromRequest(req.raw));
        if (token) {
          req.raw.token = token;
          return true;
        }
        const schemaError = new GenericResponse(403);
        return schemaError.reply(reply);
      },
    );

    fastify.decorate(
      'adminTokenCheck',
      /**
       * @param {import('fastify').FastifyRequest} req
       * @param {import('fastify').FastifyReply} reply
       */
      async (req, reply) => {
        const [, token] = await to(container.JWT.verifyFromRequest(req.raw));
        if (token && token.admin) {
          return true;
        }
        const schemaError = new GenericResponse(403);
        return schemaError.reply(reply);
      },
    );
  }

  /**
   * @private
   * @param {import('fastify').FastifyInstance} fastify
   * @param {Object} container
   * @param {import('../../../addon').Config} container.Config
   */
  static swaggerUI(fastify, container) {
    const defaultSchemaError = new GenericResponse(500);
    fastify.addSchema(defaultSchemaError.getSchema());

    /** @type {import('fastify-oas').OpenApiSpec} */
    const swagger = {
      openapi: '3.0.0',
      info: {
        title: container.Config.ASM_PUBLIC_APP_TITLE,
        version: '1.0.0',
        description,
        contact: {
          name: Organization.en.name,
          url: Organization.en.url,
          email: Organization.en.email,
        },
        license: {
          name: 'CC-BY-3.0',
          url: 'https://creativecommons.org/licenses/by/3.0/',
        },
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            description:
              'Access for none browser client like mobile applications',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          cookieToken: {
            description: 'Default access for web application',
            type: 'apiKey',
            in: 'cookie',
            name: container.Config.ASM_PUBLIC_AUTH_COOKIE,
          },
          userApiKey: {
            description: 'User secret',
            type: 'apiKey',
            in: 'header',
            name: container.Config.ASM_PUBLIC_AUTH_USER_API_KEY,
          },
        },
      },
      consumes: ['application/json'],
      produces: ['application/json'],
      servers: [
        {
          description: container.Config.ASM_PUBLIC_APP_TITLE,
          url: '/',
        },
      ],
    };

    /** @type {import('fastify-oas').FastifyOASOptions} */
    const openApiConfig = {
      routePrefix: fastify.openAPIBaseURL('/docs'),
      exposeRoute: true,
      addModels: true,
      swagger,
    };

    fastify.register(fastifyOpenAPI, openApiConfig);
  }
}

module.exports = { OpenAPI };
