const dot = require('get-value');
/**
 * Maps subject (Target or TargetExposition) or some field of it into `vm` compatible getter/setter pair
 * @param {Target,TargetExposition} subject
 * @param {String} field
 * @param {Boolean} sendTarget send
 * @return {*}
 */
function map(subject, field, sendTarget) {
  const omitKey = !field || !!subject.customPayload;
  const composeSetter = () =>
    sendTarget ?
      omitKey ?
        function (value) {
          subject.dispatcher.call(this, this.$store, value, targetGetter.call(this));
        } :
        function (value) {
          subject.dispatcher.call(this, this.$store, value, field, targetGetter.call(this));
        } :
      omitKey ?
        function (value) {
          subject.dispatcher.call(this, this.$store, value);
        } :
        function (value) {
          subject.dispatcher.call(this, this.$store, value, field);
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
    sendTarget ?
      omitKey ?
        (store, payload, target) => store[method](storeAction, { target, payload }) :
        (store, value, key, target) => store[method](storeAction, { target, key, value }) :
      omitKey ?
        (store, value) => store[method](storeAction, value) :
        (store, value, key) => store[method](storeAction, { key, value }));
  if (subject.dispatcher) result.set = subject.gate ? subject.gate(field, composeSetter()) : composeSetter();
  return result;
}
module.exports = map;
