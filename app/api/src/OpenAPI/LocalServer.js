const { Op, literal } = require('sequelize');

const { GenericResponse } = require('../Core/Fastify/GenericResponse');

class LocalServer {
  /**
   * @param {Object} container
   * @param {import('fastify').FastifyInstance} container.fastify
   * @param {import('sequelize').ModelCtor<import('sequelize').Model>} container.LocalEntity
   * @param {Object.<string, any>} container.Config
   */
  constructor({ fastify, LocalEntity, Config }) {
    const e403 = new GenericResponse(403);
    const e503 = new GenericResponse(503);
    const e502 = new GenericResponse(502);

    fastify.route({
      url: fastify.openAPIBaseURL('/local-adapter'),
      method: 'POST',
      schema: {
        // hide: true,
        body: {
          type: 'object',
          required: ['mobile', 'message'],
          properties: {
            mobile: {
              type: 'string',
              minLength: 6,
              maxLength: 16,
            },
            message: {
              type: 'string',
              minLength: 1,
              maxLength: 2048,
            },
          },
        },
      },
      handler: async (req, reply) => {
        if (!Config.ASM_PUBLIC_ADAPTERS.includes('local')) {
          return e503.reply(reply);
        }

        if (req.raw.getClientIP() !== '127.0.0.1') {
          return e403.reply(reply);
        }

        const randomFailed =
          Math.floor(Math.random() * Config.ASM_PUBLIC_LOCAL_FAILED_CHANCE) + 1;

        if (randomFailed === 1) {
          return e502.reply(reply);
        }

        const local = await LocalEntity.create({
          mobile: req.body.mobile,
          message: req.body.message,
        });

        return local.id;
      },
    });

    fastify.route({
      preValidation: fastify.adminTokenCheck,
      url: fastify.openAPIBaseURL('/local-adapter/list'),
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
                mobile_C_SEARCH: {
                  type: 'string',
                  example: '',
                  nullable: true,
                },
                message_C_FULL_TEXT_SEARCH: {
                  type: 'string',
                  example: '',
                  nullable: true,
                },
              },
            },
          },
        },
      },
      handler: async (req, reply) => {
        if (!Config.ASM_PUBLIC_ADAPTERS.includes('local')) {
          return e503.reply(reply);
        }

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
                case 'FULL_TEXT_SEARCH':
                  conditions.push({
                    field: typeMatch.groups.field,
                    where: literal(
                      `MATCH (${typeMatch.groups.field}) AGAINST('${value
                        .trim()
                        .replace(/[^\p{N}\p{L}\s]+/gu, ' ')
                        .replace(/[\s]+/gu, ' ')
                        .trim()}' IN BOOLEAN MODE)`,
                      value,
                    ),
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

        return LocalEntity.findAll({
          where: whereConditions,
          order: [[req.body.order, 'DESC']],
        });
      },
    });
  }
}

module.exports = LocalServer;
