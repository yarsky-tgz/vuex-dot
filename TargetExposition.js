const map = require('./map');

/**
 * Exposes some properties of target object into computed properties compatible bunch
 * of getters or/and setters
 */
class TargetExposition {
  /**
   *
   * @param {Target} target
   * @param {Array} projection
   */
  constructor(target, projection) {
    this.target = target;
    this.projection = projection;
    this.sendTarget = false;
  }
  
  /**
   * set action to be dispatched on exposed field change
   * if sendTarget is undefined action shall be called in format:
   *
   * dispatch(action, {[key_of_exposed_field]: value})
   *
   * otherwise, if sendTarget is set to true
   *
   * dispatch(action, { target, key, value})
   *
   * @param {String} action
   * @param {Boolean} sendTarget send target to action
   * @return {TargetExposition}
   */
  dispatch(action, sendTarget = false) {
    this.target.dispatch(action);
    this.sendTarget = sendTarget || false;
    return this;
  }
  
  /**
   * set dispatcher callback
   * @param {Function} dispatcher
   * @param {Boolean} sendTarget
   * @return {TargetExposition}
   */
  hook(dispatcher, sendTarget) {
    this.target.hook(dispatcher);
    this.sendTarget = sendTarget || false;
    return this;
  }
  
  /**
   * generates map of getters or/and setters for specified projection
   * @return {Object}
   */
  map() {
    const result = {};
    const { target, sendTarget } = this;
    this.projection.forEach(field => result[field] = map(target, field, sendTarget));
    return result;
  }
}
module.exports = TargetExposition;
