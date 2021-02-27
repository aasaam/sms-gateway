const { Op } = require('sequelize');

const { GenericResponse } = require('../Core/Fastify/GenericResponse.js');

class User {
  /**
   * @param {Object} container
   * @param {import('fastify').FastifyInstance} container.fastify
   * @param {import('sequelize').ModelCtor<import('sequelize').Model>} container.UserEntity
   */
  constructor({ fastify, UserEntity }) {
    const e400 = new GenericResponse(400);

    fastify.route({
      preValidation: fastify.adminTokenCheck,
      url: fastify.openAPIBaseURL('/user/list'),
      method: 'POST',
      schema: {
        body: {
          type: 'object',
          properties: {
            order: {
              type: 'string',
              enum: ['id'],
              default: 'id',
              nullable: true,
            },
            limit: {
              type: 'number',
              default: 10,
              min: 5,
              max: 100,
              nullable: true,
            },
            filters: {
              type: 'object',
              properties: {
                id_C_LAST_SEEN: {
                  type: 'string',
                  example: '',
                  nullable: true,
                },
                createdAt_C_START_DATETIME: {
                  type: 'string',
                  format: 'date-time',
                  example: '',
                  nullable: true,
                },
                createdAt_C_END_DATETIME: {
                  type: 'string',
                  format: 'date-time',
                  example: '',
                  nullable: true,
                },
                name_C_SEARCH: {
                  type: 'string',
                  example: '',
                  nullable: true,
                },
              },
            },
          },
        },
      },
      handler: async (req) => {
        const conditions = [];

        if (req.body.filters) {
          Object.keys(req.body.filters).forEach((f) => {
            const typeMatch = f.match(
              // eslint-disable-next-line security/detect-unsafe-regex
              /^(?<field>[a-zA-Z0-9]+)_C_(?<type>[A-Z_]+)$/,
            );
            const value = req.body.filters[`${f}`];
            if (value && typeMatch) {
              switch (typeMatch.groups.type) {
                case 'LAST_SEEN':
                  conditions.push({
                    field: typeMatch.groups.field,
                    where: {
                      [Op.lt]: value,
                    },
                  });
                  break;
                case 'START_DATETIME':
                  conditions.push({
                    field: typeMatch.groups.field,
                    where: {
                      [Op.gte]: new Date(value),
                    },
                  });
                  break;
                case 'END_DATETIME':
                  conditions.push({
                    field: typeMatch.groups.field,
                    where: {
                      [Op.lte]: new Date(value),
                    },
                  });
                  break;
                default:
                  conditions.push({
                    field: typeMatch.groups.field,
                    where: `%${value
                      .trim()
                      .replace(/[^\p{N}\p{L}\s]+/gu, ' ')
                      .replace(/[\s]+/gu, ' ')
                      .trim()}%`,
                  });
                  break;
              }
            }
          });
        }

        const whereConditions = {};
        conditions.forEach(({ field, where }) => {
          if (!whereConditions[Op.and]) {
            whereConditions[Op.and] = [];
          }

          whereConditions[Op.and].push({
            [field]: where,
          });
        });

        return UserEntity.findAll({
          where: whereConditions,
          order: [[req.body.order, 'DESC']],
        });
      },
    });

    fastify.route({
      preValidation: fastify.adminTokenCheck,
      url: fastify.openAPIBaseURL('/admin/update-user'),
      method: 'POST',
      schema: {
        body: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: {
              type: 'number',
            },
            active: {
              type: 'boolean',
            },
            newPassword: {
              type: 'string',
              minLength: 8,
              maxLength: 64,
            },
          },
        },
      },
      handler: async (req) => {
        const u = await UserEntity.findOne({
          where: {
            id: req.body.userId,
          },
        });

        u.active = req.body.active;

        if (req.body.newPassword) {
          u.password = await UserEntity.hashPassword(req.body.newPassword);
        }

        await u.save();
        return u.toJSON();
      },
    });

    fastify.route({
      preValidation: fastify.userTokenCheck,
      url: fastify.openAPIBaseURL('/user/change-password'),
      method: 'POST',
      schema: {
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
            id: req.raw.token.id,
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
        return true;
      },
    });

    fastify.route({
      preValidation: fastify.userTokenCheck,
      url: fastify.openAPIBaseURL('/user/revoke-api-key'),
      method: 'GET',
      handler: async (req) => {
        const u = await UserEntity.findOne({
          where: {
            id: req.raw.token.id,
            active: true,
          },
        });

        u.apiKey = await UserEntity.randomAPIKey();
        await u.save();
        return u.toJSON();
      },
    });

    fastify.route({
      preValidation: fastify.userTokenCheck,
      url: fastify.openAPIBaseURL('/user/data'),
      method: 'GET',
      handler: async (req) => {
        const u = await UserEntity.findOne({
          where: {
            id: req.raw.token.id,
            active: true,
          },
        });

        return u.toJSON();
      },
    });
  }
}

module.exports = User;
