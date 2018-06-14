const dot = require('get-value');
/**
 * Maps subject (Target or TargetExposition) or some field of it into `vm` compatible getter/setter pair
 * @param {Target,TargetExposition} subject
 * @param {String} field
 * @param {Boolean} sendTarget send
 * @return {{get: (function(): *), set: (function(): *)}}
 */
function map(subject, field, sendTarget) {
  const composeSetter = () =>
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
  const fieldGetter = function () {
    return dot(this, subject.path + '.' + field);
  };
  const targetGetter = function () {
    return dot(this, subject.path);
  };
  const resultGetter = field ? fieldGetter : targetGetter;
  const result = {
    get: subject.getterGate ? subject.getterGate(field, resultGetter) : resultGetter
  };
  const method = !!subject.action ? 'dispatch' : !!subject.mutation ? 'commit' : null;
  const storeAction = !!subject.action ? subject.action : !!subject.mutation ? subject.mutation : null;
  if (!!method) subject.hook(
    field ?
      sendTarget ?
        (store, value, key, target) => store[method](storeAction, { target, key, value }) : // target sending requested
        (store, value, key) => store[method](storeAction, { key, value }) : // not requested
      (store, value) => store[method](storeAction, value)); // just single instance dot-notated property mapped
  if (subject.dispatcher) result.set = subject.gate ? subject.gate(field, composeSetter()) : composeSetter();
  return result;
}
module.exports = map;
