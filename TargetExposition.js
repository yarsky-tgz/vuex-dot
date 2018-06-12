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
   * Sets `mutation` to be commited on exposed field change
   * if `sendTarget` is `false` `action` shall be called in format:
   *
   * `commit(mutation, {[key_of_exposed_field]: value})`
   *
   * otherwise, if `sendTarget` is set to `true`
   *
   * `commit(mutation, { target, key, value})`
   *
   * **Hint**: That's just syntax sugar for `hook()` method.
   * @param {String} mutation name of mutation
   * @param {Boolean} sendTarget send target to action
   * @return {TargetExposition}
   */
  commit(mutation, sendTarget = false) {
    this.target.commit(mutation);
    this.sendTarget = sendTarget || false;
    return this;
  }
  
  /**
   * Sets `action` to be dispatched on exposed field change
   * if `sendTarget` is `false` `action` shall be called in format:
   *
   * `dispatch(action, {[key_of_exposed_field]: value})`
   *
   * otherwise, if `sendTarget` is set to `true`
   *
   * `dispatch(action, { target, key, value})`
   *
   * **Hint**: That's just syntax sugar for `hook()` method.
   * @param {String} action name of action
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
   * @param {TargetExposition~dispatcher} dispatcher
   * @param {Boolean} sendTarget
   * @return {TargetExposition}
   */
  hook(dispatcher, sendTarget) {
    this.target.hook(dispatcher);
    this.sendTarget = sendTarget || false;
    return this;
  }
  
  /**
   * @callback TargetExposition~dispatcher
   * @param {Store} store `vuex` store
   * @param {*} value changed value
   * @param {String} key key of changed field
   * @param {*} target parent object of changed field
   */
  
  /**
   * generates map of getters or/and setters for specified projection
   * @return {Object}
   */
  map() {
    const result = {};
    const { target, sendTarget } = this;
    this.projection.forEach(field => {
      let camelCasedField = (field.indexOf('.') === -1) ? field : field.replace(/\.(.)/g, (all, matched) => matched.toUpperCase());
      result[camelCasedField] = map(target, field, sendTarget);
    });
    if (target.inject) Object.assign(result, target.inject);
    return result;
  }
  
  use(plugin) {
    this.target.use(plugin);
    return this;
  }
}
module.exports = TargetExposition;
