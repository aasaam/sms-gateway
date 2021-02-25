const { uniq } = require('lodash');
const validator = require('validator').default;

/**
 * @param {String} env
 * @param {String[]} defaults
 * @return {String[]}
 */
module.exports = (env, defaults = ['IR']) => {
  if (env) {
    uniq(
      env
        .split(',')
        .map((c) => c.trim().toLocaleLowerCase())
        .filter((c) => validator.isISO31661Alpha2(c)),
    );
  }
  return defaults;
};
