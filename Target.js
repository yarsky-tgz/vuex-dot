const TargetExposition = require('./TargetExposition');
const map = require('./map');

/**
 * Target mapper
 */
class Target {
  /**
   * @param {string} path dot-notation path to some property of your `vm` instance
   */
  constructor(path) {
    this.path = path;
    this.action = null;
    this.mutation = null;
    this.dispatcher = null;
  }
  
  /**
   * Should be used if you need to map some properties of the object, selected as a target into your computed properties.
   * It allows to attach action dispatcher or hook callback on each property change.
   *
   * Also, both `dispatch()` and `hook()` can provide object mapped by Target instance to the callee, while setting
   * the second argument `true` (you can read more in the documentation for them)
   *
   * @param {array} projection `target` object properties to be exposed
   * @returns {TargetExposition}
   */
  expose(projection) {
    return new TargetExposition(this, projection);
  }
  
  /**
   * In fact, that's syntax sugar for `hook()` method.
   *
   * Sets `mutation` to be commited on mapped property change
   *
   * `mutation` shall be called in the format:
   *
   * `commit(mutation, newValue)`
   *
   * @param {string} mutation mutation name
   * @returns {Target}
   */
  commit(mutation) {
    this.mutation = mutation;
    return this;
  }
  
  /**
   * In fact, that's syntax sugar for `hook()` method.
   *
   * Sets `action` to be dispatched on mapped property change
   *
   * Your `action` shall be called in the format:
   *
   * `dispatch(action, newValue)`
   *
   * @param {string} action action name
   * @returns {Target}
   */
  dispatch(action) {
    this.action = action;
    return this;
  }
  
  /**
   * Set hook that should be run on mapped property change.
   *
   * @param {Target~dispatcher} dispatcher
   * @returns {Target}
   */
  hook(dispatcher) {
    this.dispatcher = dispatcher;
    return this;
  }
  
  /**
   * @callback Target~dispatcher
   * @param {Store} store `vuex` store
   * @param {mixed} value
   */
  
  /**
   * returns computed property pair of getters or/and setters for specified projection.
   *
   * If an alias is set, it can be used with spread operator setting provided alias as the computed property name
   *
   * @param {String} alias name of computed field target to be accessible
   * @returns {*}
   */
  map(alias) {
    if (!alias) return map(this);
    return Object.assign({ [ alias ]: map(this) }, this.inject || {});
  }
  
  /**
   * apply plugin
   *
   * plugin is described by object, composed in such format:
   *
   * ```javascript
   * {
   *   setter: function(key, value, nextSetter) { //setter is mandatory
   *     nextSetter(value);
   *   },
   *   getter: function(key, nextGetter) { //getter is optional
   *     return nextGetter();
   *   },
   *   inject: { // optional, here you can describe additional fields, you want to inject into result map
   *     $internal: {
   *       get() { ... },
   *       set(value) { ... }
   *     }
   *   }
   * }
   * ```
   *
   * @param {Object} plugin object, describing your plugin.
   * @return {Target}
   */
  use(plugin) {
    const makeSetterGate = oldGate => !!oldGate ?
      (key, setter) => function (value) { plugin.setter.call(this, key, value, oldGate(key, setter).bind(this)); } :
      (key, setter) => function (value) { plugin.setter.call(this, key, value, setter.bind(this)); };
    const makeGetterGate = oldGate => !!oldGate ?
      (key, getter) => function () { return plugin.getter.call(this, key, oldGate(key, getter).bind(this)); } :
      (key, getter) => function () { return plugin.getter.call(this, key, getter.bind(this)); };
    this.gate = makeSetterGate(this.gate);
    if (!!plugin.getter) this.getterGate = makeGetterGate(this.getterGate);
    this.inject = Object.assign({}, plugin.inject, this.inject);
    return this;
  }
}

module.exports = Target;
