/** @type {import('json-schema').JSONSchema7} */
const schema = {
  $id: 'SendMessage',
  title: 'Send Message',
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
          maxLength: 24,
        },
        {
          type: 'array',
          default: [],
          minItems: 1,
          items: {
            type: 'string',
            minLength: 6,
            maxLength: 24,
          },
        },
      ],
    },
    message: {
      type: 'string',
      default: '',
      minLength: 1,
      maxLength: 512,
    },
  },
};

module.exports = {
  schema,
};
