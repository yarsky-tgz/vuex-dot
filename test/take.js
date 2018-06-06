const t = require('tap');
const { take, takeState } = require('../');

function testField(t, result, field, bindTo, setterExpected) {
  t.type(result[field], 'object', 'field exists');
  t.type(result[field].get, 'function', 'getter exists');
  if (setterExpected) t.type(result[field].set, 'function', 'setter exists');
  else t.type(result[field].set, 'undefined', 'setter not exists');
  result[field].get = result[field].get.bind(bindTo);
  if (setterExpected) result[field].set = result[field].set.bind(bindTo);
}

t.test('method chaining', async t => {
  const instance = take('test');
  t.equal(instance.hook(), instance, 'hook returns this');
  t.equal(instance.dispatch(), instance, 'dispatch returns this');
}).catch(t.threw);

t.test('simple target getter', async t => {
  const test = {
    long: {
      way: {
        to: {
          field: 'value'
        }
      }
    }
  };
  const result = take('long.way.to.field').map('field');
  testField(t, result, 'field', test, false);
  t.equal(result.field.get(), 'value', 'getter works as expected');
});

t.test('simple target getter with empty alias', async t => {
  const test = {
    long: {
      way: {
        to: {
          field: 'value'
        }
      }
    }
  };
  const result = { field: take('long.way.to.field').map() };
  testField(t, result, 'field', test, false);
  t.equal(result.field.get(), 'value', 'getter works as expected');
});

t.test('simple target dispatching', async t => {
  const test = {
    $store: {
      dispatch(action, value) {
        t.equal(action, 'testAction', 'right action dispatched');
        t.equal(value, 2, 'right value passed');
      },
      state: {
        long: {
          way: {
            to: {
              field: 'value'
            }
          }
        }
      }
    }
  };
  const result = takeState('long/way', 'to.field')
    .dispatch('testAction')
    .map('field');
  testField(t, result, 'field', test, true);
  t.equal(result.field.get(), 'value', 'getter works as expected');
  result.field.set(2);
});

t.test('exposed target getters', async t => {
  const test = {
    $store: {
      state: {
        user: {
          name: 'John',
          email: 'test@email.com'
        }
      }
    }
  };
  const result = takeState('user')
    .expose(['name', 'email'])
    .map();
  testField(t, result, 'name', test, false);
  testField(t, result, 'email', test, false);
  t.equal(result.name.get(), 'John', 'name getter works as expected');
  t.equal(result.email.get(), 'test@email.com', 'email getter works as expected');
});

t.test('exposed target setters', async t => {
  const test = {
    $store: {
      dispatch(action, { name }) {
        t.equal(action, 'editUser', 'right action dispatched');
        t.type(name, 'string', 'right key passed to action');
        t.equal(name, 'Peter', 'right value passed to action');
      },
      state: {
        user: {
          name: 'John'
        }
      }
    },
  };
  const result = takeState('user')
    .expose(['name'])
    .dispatch('editUser')
    .map();
  testField(t, result, 'name', test, true);
  t.equal(result.name.get(), 'John', 'name getter works as expected');
  result.name.set('Peter');
});

t.test('exposed target setters with target sending', async t => {
  const test = {
    $store: {
      dispatch(action, { value, key, target }) {
        t.equal(action, 'editUser', 'right action dispatched');
        t.type(key, 'name', 'right key passed to action');
        t.equal(value, 'Peter', 'right value passed to action');
        t.same(target, test.user, 'right target passed');
      }
    },
    user: {
      name: 'John'
    }
  };
  const result = take('user')
    .expose(['name'])
    .dispatch('editUser', true)
    .map();
  testField(t, result, 'name', test, true);
  t.equal(result.name.get(), 'John', 'name getter works as expected');
  result.name.set('Peter');
});

t.test('exposed state target setters with target sending', async t => {
  const test = {
    $store: {
      dispatch(action, { value, key, target }) {
        t.equal(action, 'editUser', 'right action dispatched');
        t.type(key, 'name', 'right key passed to action');
        t.equal(value, 'Peter', 'right value passed to action');
        t.same(target, test.$store.state.user, 'right target passed');
      },
      state: {
        user: {
          name: 'John'
        }
      }
    },
  };
  const result = takeState('user')
    .expose(['name'])
    .dispatch('editUser', true)
    .map();
  testField(t, result, 'name', test, true);
  t.equal(result.name.get(), 'John', 'name getter works as expected');
  result.name.set('Peter');
});

t.test('exposed state hook test with target send', async t => {
  const test = {
    $store: {
      state: {
        user: {
          name: 'John'
        }
      }
    },
  };
  const result = takeState('user')
    .expose(['name'])
    .hook((store, value, key, target) => {
      t.equal(value, 'Peter', 'right value passed to hook');
      t.equal(key, 'name', 'right key passed to hook');
      t.same(target, test.$store.state.user, 'right target passed to hook');
    }, true)
    .map();
  testField(t, result, 'name', test, true);
  t.equal(result.name.get(), 'John', 'name getter works as expected');
  result.name.set('Peter');
});

t.test('exposed state hook test', async t => {
  const test = {
    $store: {
      state: {
        user: {
          name: 'John',
          location: {
            city: 'Odessa'
          }
        }
      }
    },
  };
  const result = takeState('user')
    .expose(['name', 'location.city'])
    .hook((store, value, key) => {
      t.equal(value, 'Peter', 'right value passed to hook');
      t.equal(key, 'name', 'right key passed to hook');
    })
    .map();
  testField(t, result, 'name', test, true);
  testField(t, result, 'locationCity', test, true);
  t.equal(result.name.get(), 'John', 'name getter works as expected');
  result.name.set('Peter');
});
