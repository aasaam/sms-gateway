/** @type {import('json-schema').JSONSchema7} */
const schema = {
  $id: 'SendMessage',
  title: 'SendMessage',
  description: 'Send Message request',
  type: 'object',
  required: ['mobile', 'message'],
  properties: {
    mobile: {
      description: 'Mobile phone number with country prefix',
      oneOf: [
        {
          type: 'string',
          default: '',
          minLength: 6,
          maxLength: 16,
        },
        {
          type: 'array',
          default: [],
          minItems: 1,
          maxItems: 2000,
          items: {
            type: 'string',
            minLength: 6,
            maxLength: 16,
          },
        },
      ],
    },
    message: {
      type: 'string',
      default: '',
      minLength: 1,
      maxLength: 2048,
    },
  },
};

module.exports = {
  schema,
};
