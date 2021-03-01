/* eslint-env jest */

const {
  GenericResponse,
} = require('../../../src/Core/Fastify/GenericResponse');

describe(__filename.replace(__dirname, ''), () => {
  it('GenericResponse', async () => {
    const reply = {
      status() {},
      send() {},
    };
    const g = new GenericResponse(404, 'Nothing found here...');
    expect(g.getObject()).toBeTruthy();
    expect(g.getObject('Another message')).toBeTruthy();
    // @ts-ignore
    g.reply(reply);
    // @ts-ignore
    g.reply(reply, 'Message Next');
  });
});
