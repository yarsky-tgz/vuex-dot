const dot = require('dot-prop');

/**
 * State mapper
 */
class State {
  /**
   * State constructor
   * @param path
   */
  constructor(path) {
    this._useState = (path.substr(0, 12) === '$store.state');
    this._targetPath = this._useState ? path.substr(13) : path;
    this._targetPath = this._targetPath.length > 0 ? this._targetPath : undefined;
    this._projection = [];
    this._action = null;
    this._dispatcher = null;
    this._sendTarget = false;
  }
  
  /**
   * Expose target fields into result map.
   * Target shall not be present at the result map if non-empty array passed
   * @param projection Array
   * @returns {State}
   */
  expose(projection = []) {
    this._projection = projection;
    return this;
  }
  
  /**
   * Setting value to target or any of exposed fields shall dispatch specified action on store.
   * For not exposed target on value change it should run:
   * dispatch(action, newValue);
   * For exposed field:
   * dispatch(action, {[fieldName]: newValue});
   * For exposed field, if sendTarget set to true:
   * dispatch(action, { key, value, target });
   * @param action String Action name
   * @param sendTarget Boolean Append target instance to action payload
   * @returns {State}
   */
  dispatch(action, sendTarget) {
    this._action = action;
    this._sendTarget = sendTarget || false;
    return this;
  }
  
  /**
   * Set hook that should be run on value change
   * @param dispatcher
   * @param sendTarget
   * @returns {State}
   */
  hook(dispatcher, sendTarget) {
    this._dispatcher = dispatcher;
    this._sendTarget = sendTarget || false;
    return this;
  }
  
  /**
   * Creates result object construction compatible with computed property of vm
   * @param alias
   * @returns {*}
   */
  map(alias) {
    const result = {};
    const self = this;
    if (this._projection.length > 0) {
      this._projection.forEach(field => {
        result[ field ] = {
          get() {
            return dot.get(self._useState ? this.$store.state : this, self._targetPath)[ field ];
          }
        };
        if (self._action) this.hook(this._sendTarget ?
          ({ dispatch }, value, key, target) => dispatch(self._action, { target, key, value }) :
          ({ dispatch }, value, key) => dispatch(self._action, { [key]: value }),
          this._sendTarget);
        if (self._dispatcher) result[ field ].set = function (value) {
          const args = [ this.$store, value, field ];
          if (self._sendTarget) args.push(dot.get(self._useState ? this.$store.state : this, self._targetPath));
          self._dispatcher.call(this, ...args);
        };
      });
    } else {
      result[ alias ] = {
        get() {
          return dot.get(self._useState ? this.$store.state : this, self._targetPath);
        }
      };
      if (self._action) this.hook(({ dispatch }, value) => dispatch(self._action, value));
      if (self._dispatcher) result[ alias ].set = function (value) {
        self._dispatcher.call(this, this.$store, value);
      };
    }
    return result;
  }
}

module.exports = State;
