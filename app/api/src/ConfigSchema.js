const validator = require('validator').default;

const TEST_MODE = validator.toBoolean(process.env.ASM_PUBLIC_APP_TEST, true);

/** @type {import('json-schema').JSONSchema7} */
const ConfigSchema = {
  type: 'object',
  required: ['ASM_AUTH_HMAC_SECRET'],
  properties: {
    ASM_PM_ID: {
      type: 'number',
      description: 'PM2 process identifier',
      default: 0,
    },

    ASM_PUBLIC_APP_INSTANCE: {
      type: 'number',
      description: 'Application cluster number',
      default: 2,
      minimum: 1,
      maximum: 16,
    },

    ASM_PUBLIC_SENDING_INTERVAL_MICROSECONDS: {
      type: 'number',
      description: 'Sending interval in microseconds for try next message.',
      default: 1000,
      minimum: 100,
      maximum: 60000,
    },

    ASM_PUBLIC_APP_TITLE: {
      type: 'string',
      description: 'Application title',
      default: 'SMS Gateway',
    },

    ASM_ADMIN_USERNAME: {
      type: 'string',
      description: 'Administrator user name',
      default: 'root',
    },

    ASM_DEFAULT_USERNAME: {
      type: 'string',
      description: 'Default user name',
      default: 'default',
    },

    ASM_PUBLIC_APP_TEST: {
      type: 'boolean',
      description: 'Application is in testing mode',
      default: false,
    },

    ASM_PUBLIC_LOCAL_FAILED_CHANCE: {
      type: 'number',
      description:
        'How is chance between 1 to n to fails will be simulate. If 10, so 1/10 equal 10 percent chance of failed',
      minimum: 2,
      maximum: 100,
      default: 2,
    },

    ASM_PUBLIC_MAX_TRY: {
      type: 'number',
      description:
        'Max try for sending message after that message will not send',
      default: 10,
      minimum: 1,
      maximum: 100,
    },

    ASM_PUBLIC_ADAPTERS: {
      type: 'string',
      description: 'List of possible adapters',
      separator: ',',
      default: 'local',
    },

    ASM_PUBLIC_BASE_URL: {
      type: 'string',
      description: 'Base URL of application. Example: `/` or `/base-path/`',
      default: '/',
    },

    ASM_PUBLIC_AUTH_COOKIE: {
      type: 'string',
      description: 'Authentication cookie name',
      default: TEST_MODE ? 'AuthToken' : '__Host-AuthToken',
    },

    ASM_PUBLIC_AUTH_COOKIE_LIFETIME: {
      type: 'number',
      description: 'Lifetime of authentication token/cookie',
      default: 14400,
    },

    ASM_AUTH_HMAC_ALG: {
      type: 'string',
      description: 'Application authentication HMAC algorithm',
      default: 'HS256',
      enum: ['HS256', 'HS384', 'HS512'],
    },

    ASM_AUTH_HMAC_SECRET: {
      type: 'string',
      description: 'Application authentication HMAC secret',
      default: TEST_MODE ? '00000000000000000000000000000000' : ' ',
      minLength: 32,
      maxLength: 512,
    },

    ASM_PUBLIC_AUTH_USER_API_KEY: {
      type: 'string',
      description: 'Header that carry the stored user token.',
      default: 'x-user-api-key',
    },

    ASM_APP_PORT: {
      type: 'number',
      description: 'Application HTTP port',
      default: 3001,
      minimum: 1025,
      maximum: 49151,
    },

    ASM_MARIADB_DATABASE: {
      type: 'string',
      description: 'MariaDB database',
      default: 'mariadb-db',
    },

    ASM_MARIADB_USER: {
      type: 'string',
      description: 'MariaDB username',
      default: 'mariadb-user',
    },

    ASM_MARIADB_PASSWORD: {
      type: 'string',
      description: 'MariaDB password',
      default: 'mariadb-password',
    },

    ASM_MARIADB_HOST: {
      type: 'string',
      description: 'MariaDB host',
      default: 'sms-gateway-mariadb',
    },

    // MeliPayamak
    ASM_MELIPAYAMAK_NUMBER: {
      description: 'MeliPayamak send number',
      type: 'string',
    },
    ASM_MELIPAYAMAK_USERNAME: {
      description: 'MeliPayamak username',
      type: 'string',
    },
    ASM_MELIPAYAMAK_PASSWORD: {
      description: 'MeliPayamak password',
      type: 'string',
    },
    ASM_MELIPAYAMAK_PRIORITY: {
      description: 'MeliPayamak priority over other adapters',
      type: 'string',
    },
    ASM_MELIPAYAMAK_COUNTRIES: {
      description: 'MeliPayamak allowed countries',
      type: 'string',
      separator: ',',
      default: 'IR',
    },
  },
};

module.exports = { ConfigSchema };
