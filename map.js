const dot = require('get-value');
/**
 *
 * @param subject
 * @param field
 * @param sendTarget
 * @return {{get: (function(): *),set: (function(): *)}}
 */
function map(subject, field, sendTarget) {
  const fieldGetter = function () {
    return dot(this, subject.path + '.' + field);
  };
  const targetGetter = function () {
    return dot(this, subject.path);
  };
  const result = {
    get: field ? fieldGetter : targetGetter
  };
  if (subject.action) subject.hook(
    field ?
      sendTarget ?
        ({ dispatch }, value, key, target) => dispatch(subject.action, { target, key, value }) : // target sending requested
        ({ dispatch }, value, key) => dispatch(subject.action, { [ key ]: value }) : // not requested
      ({ dispatch }, value) => dispatch(subject.action, value)); // just single instance dot-notated property mapped
  if (subject.dispatcher) result.set =
    field ?
      sendTarget ?
        function (value) {
          subject.dispatcher.call(this, this.$store, value, field, targetGetter.call(this));
        } :
        function (value) {
          subject.dispatcher.call(this, this.$store, value, field);
        } :
      function (value) {
        subject.dispatcher.call(this, this.$store, value);
      };
  return result;
}
module.exports = map;
