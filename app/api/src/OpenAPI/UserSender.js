const { GenericResponse } = require('../Core/Fastify/GenericResponse');

class UserSender {
  /**
   * @param {Object} container
   * @param {import('fastify').FastifyInstance} container.fastify
   * @param {import('sequelize').ModelCtor<import('sequelize').Model>} container.UserEntity
   */
  constructor({ fastify, UserEntity }) {
    const e400 = new GenericResponse(400);

    fastify.route({
      preValidation: fastify.userTokenCheck,
      url: fastify.openAPIBaseURL('/user/change-password'),
      method: 'PUT',
      schema: {
        tags: ['user'],
        body: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: {
              type: 'string',
              minLength: 8,
              maxLength: 64,
            },
            newPassword: {
              type: 'string',
              minLength: 8,
              maxLength: 64,
            },
          },
        },
      },
      handler: async (req, reply) => {
        const u = await UserEntity.findOne({
          where: {
            id: req.raw.token.uid,
            active: true,
          },
        });

        const passwordMatch = await UserEntity.validPassword(
          u.password,
          req.body.currentPassword,
        );

        if (!passwordMatch) {
          return e400.reply(reply);
        }

        u.password = await UserEntity.hashPassword(req.body.newPassword);
        await u.save();
        return u.safeJSON;
      },
    });

    fastify.route({
      preValidation: fastify.userTokenCheck,
      url: fastify.openAPIBaseURL('/user/revoke-api-key'),
      schema: {
        tags: ['user'],
      },
      method: 'PATCH',
      handler: async (req) => {
        const u = await UserEntity.findOne({
          where: {
            id: req.raw.token.uid,
            active: true,
          },
        });

        u.apiKey = await UserEntity.randomAPIKey();
        await u.save();
        return u.apiKey;
      },
    });

    fastify.route({
      preValidation: fastify.userTokenCheck,
      url: fastify.openAPIBaseURL('/user/data'),
      schema: {
        tags: ['user'],
      },
      method: 'GET',
      handler: async (req) => {
        const u = await UserEntity.findOne({
          where: {
            id: req.raw.token.uid,
            active: true,
          },
        });

        return u.safeJSON;
      },
    });
  }
}

module.exports = UserSender;
