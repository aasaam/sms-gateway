const { GenericResponse } = require('../Core/Fastify/GenericResponse.js');

class Send {
  /**
   * @param {Object} container
   * @param {import('fastify').FastifyInstance} container.fastify
   * @param {import('sequelize').ModelCtor<import('sequelize').Model>} container.UserEntity
   * @param {import('../Core/JWT')} container.JWT
   */
  constructor({ fastify, UserEntity, JWT, Config }) {
    const e400 = new GenericResponse(400);

    fastify.route({
      url: fastify.openAPIBaseURL('/login'),
      method: 'POST',
      config: {
        rateLimit: {
          max: 5,
        },
      },
      schema: {
        tags: ['auth'],
        description: 'Login user',
        body: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
            },
            password: {
              type: 'string',
            },
          },
        },
        response: {
          200: {
            type: 'boolean',
          },
          400: e400.getSchema(),
        },
      },
      handler: async (req, reply) => {
        const u = await UserEntity.findOne({
          where: {
            name: req.body.username,
            active: true,
          },
        });

        if (!u) {
          return e400.reply(reply);
        }

        const passwordMatch = await UserEntity.validPassword(
          u.password,
          req.body.password,
        );

        if (!passwordMatch) {
          return e400.reply(reply);
        }

        const payload = {
          uid: u.id,
          admin: u.admin,
        };

        const expires = new Date();
        expires.setDate(
          expires.getDate() + Config.ASM_PUBLIC_AUTH_COOKIE_LIFETIME * 1000,
        );

        const token = await JWT.sign(
          payload,
          Config.ASM_PUBLIC_AUTH_COOKIE_LIFETIME,
        );

        reply.setCookie(Config.ASM_PUBLIC_AUTH_COOKIE, token, {
          path: fastify.openAPIBaseURL(''),
          expires,
        });

        reply.header('X-Token', token);

        return true;
      },
    });
  }
}

module.exports = Send;
