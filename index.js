const Target = require('./Target');
/**
 * returns Target instance with specified path
 * @param {string} path dotted path to target property of your component instance
 * @returns {Target}
 */
const take = path => new Target(path);
const takeState = (namespace, path) => {
  if (typeof path === 'undefined') path = namespace;
  else path = `${namespace.replace('/', '.')}.${path}`;
  const fullPath = `$store.state.${path}`;
  return new Target(fullPath);
};
module.exports = { take, takeState };
