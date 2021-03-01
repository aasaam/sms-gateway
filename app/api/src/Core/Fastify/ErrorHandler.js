const { GenericResponse } = require('./GenericResponse');

class ErrorHandler {
  /**
   * @param {import('fastify').FastifyInstance} fastify
   * @param {Object} container
   * @param {import('../../../addon').Config} container.Config
   */
  static setup(fastify, container) {
    const { ASM_PUBLIC_APP_TEST } = container.Config;

    fastify.setNotFoundHandler((_, reply) => {
      const e = new GenericResponse(404);
      return e.reply(reply);
    });

    fastify.setErrorHandler((e, req, reply) => {
      let schemaError = new GenericResponse(e.statusCode ? e.statusCode : 500);

      let error = schemaError.getObject();
      if ('validation' in e) {
        schemaError = new GenericResponse(422);
        error = schemaError.getObject();
        error.message = e.message;
        error.validations = e.validation;
      }

      if (ASM_PUBLIC_APP_TEST) {
        error.name = e.name;
        error.stack = e.stack.split('\n').map((l) => l.trim());
      }

      return reply.code(error.statusCode).send(error);
    });
  }
}

module.exports = {
  ErrorHandler,
};
