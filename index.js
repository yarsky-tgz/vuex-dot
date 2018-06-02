const State = require('./State');
/**
 * returns State instance with specified path
 * @param {string} path dotted path to target property of your component instance
 * @returns {State}
 */
const take = path => new State(path);
module.exports = take;
