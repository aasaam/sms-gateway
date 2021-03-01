const { Op } = require('sequelize');

class UserNormal {
  /**
   * @param {Object} container
   * @param {import('fastify').FastifyInstance} container.fastify
   * @param {import('sequelize').ModelCtor<import('sequelize').Model>} container.UserEntity
   */
  constructor({ fastify, UserEntity }) {
    fastify.route({
      preValidation: fastify.adminTokenCheck,
      url: fastify.openAPIBaseURL('/admin/user/list'),
      method: 'POST',
      schema: {
        tags: ['admin'],
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
          attributes: ['id', 'name', 'createdAt'],
          where: whereConditions,
          order: [[req.body.order, 'DESC']],
        });
      },
    });

    fastify.route({
      preValidation: fastify.adminTokenCheck,
      url: fastify.openAPIBaseURL('/admin/user/update'),
      method: 'POST',
      schema: {
        tags: ['admin'],
        body: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: {
              type: 'number',
            },
            active: {
              type: 'boolean',
              default: true,
            },
            revokeApiKey: {
              type: 'boolean',
              default: false,
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

        if (req.body.revokeApiKey) {
          u.apiKey = await UserEntity.randomAPIKey();
        }

        await u.save();
        return u.safeJSON;
      },
    });
  }
}

module.exports = UserNormal;
