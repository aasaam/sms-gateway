const { parsePhoneNumber } = require('libphonenumber-js/max');

class Send {
  /**
   * @param {Object} container
   * @param {import('fastify').FastifyInstance} container.fastify
   * @param {import('sequelize').ModelCtor<import('sequelize').Model>} container.SendMessageEntity
   */
  constructor({ fastify, SendMessageEntity }) {
    fastify.route({
      preValidation: fastify.userApiKeyCheck,
      url: fastify.openAPIBaseURL('/send'),
      method: 'POST',
      schema: {
        tags: ['send'],
        description: 'Send message to list of mobile phone numbers',
        body: {
          $ref: 'SendMessage#',
        },
        response: {
          200: {
            type: 'boolean',
          },
        },
        security: [
          {
            userApiKey: [],
          },
        ],
      },
      handler: async (req) => {
        let mobiles = [];
        if (typeof req.body.mobile === 'string') {
          mobiles.push(req.body.mobile);
        } else {
          mobiles = req.body.mobile;
        }

        const validPhones = {};

        mobiles.forEach((mobile) => {
          try {
            const phoneNumber = parsePhoneNumber(mobile);
            if (phoneNumber.isValid() && phoneNumber.getType() === 'MOBILE') {
              validPhones[phoneNumber.formatInternational()] =
                phoneNumber.country;
            }
            // eslint-disable-next-line no-empty
          } catch (e) {}
        });

        const promises = [];
        Object.keys(validPhones).forEach((mobile) => {
          promises.push(
            new Promise((resolve) => {
              SendMessageEntity.create({
                mobile,
                // eslint-disable-next-line security/detect-object-injection
                country: validPhones[mobile],
                user: req.raw.user.id,
                message: req.body.message,
              }).then(resolve);
            }),
          );
        });

        await Promise.all(promises);

        return Object.keys(validPhones);
      },
    });
  }
}

module.exports = Send;
