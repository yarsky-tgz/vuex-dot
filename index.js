const State = require('./State');
/**
 * State fabric
 * @param path
 * @returns {State}
 */
module.exports = path => new State(path);
