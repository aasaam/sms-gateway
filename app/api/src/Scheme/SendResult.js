/** @type {import('json-schema').JSONSchema7} */
const schema = {
  $id: 'SendResult',
  title: 'Send Result',
  description: 'Send Message response result',
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        example: 1,
        description: 'Send message identifier',
      },
      mobile: {
        type: 'string',
        example: '+989123457890',
        description: 'Mobile number',
      },
    },
  },
};

module.exports = {
  schema,
};
