# vuex-dot [![tests](https://travis-ci.org/yarsky-tgz/vuex-dot.svg?branch=master)](https://travis-ci.org/yarsky-tgz/vuex-dot) [![Coverage Status](https://coveralls.io/repos/github/yarsky-tgz/vuex-dot/badge.svg?branch=master)](https://coveralls.io/github/yarsky-tgz/vuex-dot?branch=master) [![GitHub license](https://img.shields.io/github/license/yarsky-tgz/vuex-dot.svg)](https://github.com/yarsky-tgz/vuex-dot/blob/master/LICENSE) [![minified bundle](https://img.shields.io/github/size/yarsky-tgz/vuex-dot/dist/vuex-dot.min.js.svg)](https://unpkg.com/vuex-dot@2.4.0/dist/vuex-dot.min.js)

[Codepen demo](https://codepen.io/anon/pen/ERmBBP)

Vue computed properties getters and/or setters generator with the ability to intercept each property change and [dispatch](#Target+dispatch) vuex action or [commit](#Target+commit) mutation or just [hook](#Target+hook) your own callback. Also you can [use](#Target+use) plugins.

The main idea of this tool is to have `mapState()`-like helper with an ability to set additional configuration using chainable methods.

## Motivation

There are some other packages on github - 
[vuex-map-fields](https://github.com/maoberlehner/vuex-map-fields) and
[vuex-bound](https://github.com/Vanilla-IceCream/vuex-bound) for example, but after reading 
their docs and sources I've decided to create own package from scratch with such benefits
 * **lightweight** - [3.41 KB](https://unpkg.com/vuex-dot@2.4.0/dist/vuex-dot.min.js) after rollup && babel-minify
 * **flexible** - actions [dispatching](#Target+dispatch) and [hooks](#Target+dispatch) abilities adds to your code one place for handling reactive changes of target. [Plugins](#Target+use) support gives you full control of your data flow.
 * **simple** - less code footprint with same features. You need to import only one helper method into your code, which provides a short set of chainable methods for configuring.
 * **no foreign code injection to your state** - no weird logic ("core" mutations, actions, etc) shall be injected into your vuex store, no additional setup of `vuex` or `vm` needed. This tool just generates getters and setters, which are done with performance in mind. 
 * **dot notation** - with usage of very fast and well tested library [get-value](https://github.com/jonschlinkert/get-value)

## Installation

```bash
npm i vuex-dot
```

## Usage

#### State property two way binding (mutation based)

[https://codepen.io/anon/pen/ERmBqK](https://codepen.io/anon/pen/ERmBqK)

[Target.commit(action)](#Target+commit)
```vue
<template>
  <button @click.stop="step++">next</button>
</template>

<script>
  import { takeState } from 'vuex-dot';

  export default {
    computed: {
      step: takeState('wizard.step') 
        .commit('setWizardStep')
        .map()
    }
  }
</script>
```
store/index.js
```javascript
export default new Vuex.Store({
  state: {
    wizard: {
      step: 1
    }
  },
  mutations: {
    setWizardStep(state, step) {
      state.wizard.step = step;
    }
  }
});
```

#### Target selected object fields exposition (action based)

[https://codepen.io/anon/pen/eKWqOm](https://codepen.io/anon/pen/eKWqOm)

```vue
<template>
  <form>
    <input v-model="name"/>
    <input v-model="email"/>
  </form>
</template>

<script>
  import { takeState } from 'vuex-dot';

  export default {
    computed: {
      ...takeState('user')
        .expose(['name', 'email'])
        .dispatch('editUser')
        .map()
    }
  }
</script>
```

#### Exposed target hook usage

```vue
<template>
  <form>
    <input v-model="name"/>
    <input v-model="email"/>
  </form>
</template>

<script>
  import { takeState } from 'vuex-dot';
  import validate from 'validate';
  const constraints = {name: {presence: true}}; 

  export default {
    computed: {
      ...takeState('user')
        .expose([
          'name', 
          'email'
        ])
        .hook(({ dispatch }, value, key) => {
          if(validate.single(value, constraints[key])) {
            dispatch('userEditAction', { key, value });
          }
        })
        .map()
    }
  }
</script>
```

# API reference

## Classes

<dl>
<dt><a href="#Target">Target</a></dt>
<dd><p>Target mapper</p>
</dd>
<dt><a href="#TargetExposition">TargetExposition</a></dt>
<dd><p>Exposes some properties of target object into computed properties compatible bunch
of getters or/and setters</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#take">take(path)</a> ⇒ <code><a href="#Target">Target</a></code></dt>
<dd><p>returns Target instance with specified path</p>
</dd>
<dt><a href="#takeState">takeState(namespace, path)</a> ⇒ <code><a href="#Target">Target</a></code></dt>
<dd><p>returns Target instance with specified state path</p>
</dd>
</dl>

<a name="Target"></a>

## Target
Target mapper


* [Target](#Target)
    * [new Target(path)](#new_Target_new)
    * _instance_
        * [.expose(projection)](#Target+expose) ⇒ [<code>TargetExposition</code>](#TargetExposition)
        * [.commit(mutation)](#Target+commit) ⇒ [<code>Target</code>](#Target)
        * [.dispatch(action)](#Target+dispatch) ⇒ [<code>Target</code>](#Target)
        * [.hook(dispatcher)](#Target+hook) ⇒ [<code>Target</code>](#Target)
        * [.map(alias)](#Target+map) ⇒ <code>\*</code>
        * [.use(plugin)](#Target+use) ⇒ [<code>Target</code>](#Target)
    * _inner_
        * [~dispatcher](#Target..dispatcher) : <code>function</code>

<a name="new_Target_new"></a>

### new Target(path)

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | dot-notation path to some property of your `vm` instance |

<a name="Target+expose"></a>

### target.expose(projection) ⇒ [<code>TargetExposition</code>](#TargetExposition)
Should be used if you need to map some properties of the object, selected as a target into your computed properties.
It allows to attach action dispatcher or hook callback on each property change.

Also, both `dispatch()` and `hook()` can provide object mapped by Target instance to the callee, while setting
the second argument `true` (you can read more in the documentation for them)


| Param | Type | Description |
| --- | --- | --- |
| projection | <code>array</code> | `target` object properties to be exposed |

<a name="Target+commit"></a>

### target.commit(mutation) ⇒ [<code>Target</code>](#Target)
In fact, that's syntax sugar for `hook()` method.

Sets `mutation` to be commited on mapped property change

`mutation` shall be called in the format:

`commit(mutation, newValue)`


| Param | Type | Description |
| --- | --- | --- |
| mutation | <code>string</code> | mutation name |

<a name="Target+dispatch"></a>

### target.dispatch(action) ⇒ [<code>Target</code>](#Target)
In fact, that's syntax sugar for `hook()` method.

Sets `action` to be dispatched on mapped property change

Your `action` shall be called in the format:

`dispatch(action, newValue)`


| Param | Type | Description |
| --- | --- | --- |
| action | <code>string</code> | action name |

<a name="Target+hook"></a>

### target.hook(dispatcher) ⇒ [<code>Target</code>](#Target)
Set hook that should be run on mapped property change.


| Param | Type |
| --- | --- |
| dispatcher | [<code>dispatcher</code>](#Target..dispatcher) |

<a name="Target+map"></a>

### target.map(alias) ⇒ <code>\*</code>
returns computed property pair of getters or/and setters for specified projection.

If an alias is set, it can be used with spread operator setting provided alias as the computed property name


| Param | Type | Description |
| --- | --- | --- |
| alias | <code>String</code> | name of computed field target to be accessible |

<a name="Target+use"></a>

### target.use(plugin) ⇒ [<code>Target</code>](#Target)
apply plugin

plugin is described by object, composed in such format:

```javascript
{
  setter: function(key, value, nextSetter) { //setter is mandatory
    nextSetter(value);
  },
  getter: function(key, nextGetter) { //getter is optional
    return nextGetter();
  },
  inject: { // optional, here you can describe additional fields, you want to inject into result map
    $internal: {
      get() { ... },
      set(value) { ... }
    }
  }
}
```


| Param | Type | Description |
| --- | --- | --- |
| plugin | <code>Object</code> | object, describing your plugin. |

<a name="Target..dispatcher"></a>

### Target~dispatcher : <code>function</code>

| Param | Type | Description |
| --- | --- | --- |
| store | <code>Store</code> | `vuex` store |
| value | <code>mixed</code> |  |

<a name="TargetExposition"></a>

## TargetExposition
Exposes some properties of target object into computed properties compatible bunch
of getters or/and setters


* [TargetExposition](#TargetExposition)
    * [new TargetExposition(target, projection)](#new_TargetExposition_new)
    * _instance_
        * [.commit(mutation, sendTarget)](#TargetExposition+commit) ⇒ [<code>TargetExposition</code>](#TargetExposition)
        * [.dispatch(action, sendTarget)](#TargetExposition+dispatch) ⇒ [<code>TargetExposition</code>](#TargetExposition)
        * [.hook(dispatcher, sendTarget)](#TargetExposition+hook) ⇒ [<code>TargetExposition</code>](#TargetExposition)
        * [.map()](#TargetExposition+map) ⇒ <code>Object</code>
        * [.use(plugin)](#TargetExposition+use) ⇒ [<code>TargetExposition</code>](#TargetExposition)
    * _inner_
        * [~dispatcher](#TargetExposition..dispatcher) : <code>function</code>

<a name="new_TargetExposition_new"></a>

### new TargetExposition(target, projection)

| Param | Type |
| --- | --- |
| target | [<code>Target</code>](#Target) |
| projection | <code>Array</code> |

<a name="TargetExposition+commit"></a>

### targetExposition.commit(mutation, sendTarget) ⇒ [<code>TargetExposition</code>](#TargetExposition)
Sets `mutation` to be commited on exposed field change
if `sendTarget` is `false`, `action` shall be called in format:

`commit(mutation, { key, value })`

otherwise, if `sendTarget` is set to `true`

`commit(mutation, { target, key, value })`

**Hint**: That's just syntax sugar for `hook()` method.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| mutation | <code>String</code> |  | name of mutation |
| sendTarget | <code>Boolean</code> | <code>false</code> | send target to action |

<a name="TargetExposition+dispatch"></a>

### targetExposition.dispatch(action, sendTarget) ⇒ [<code>TargetExposition</code>](#TargetExposition)
Sets `action` to be dispatched on exposed field change.
if `sendTarget` is `false`, `action` shall be called in format:

`dispatch(action, { key, value })`

otherwise, if `sendTarget` is set to `true`

`dispatch(action, { target, key, value })`

**Hint**: That's just syntax sugar for `hook()` method.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| action | <code>String</code> |  | name of action |
| sendTarget | <code>Boolean</code> | <code>false</code> | send target to action |

<a name="TargetExposition+hook"></a>

### targetExposition.hook(dispatcher, sendTarget) ⇒ [<code>TargetExposition</code>](#TargetExposition)
set callback to be run on property change


| Param | Type |
| --- | --- |
| dispatcher | [<code>dispatcher</code>](#TargetExposition..dispatcher) |
| sendTarget | <code>Boolean</code> |

<a name="TargetExposition+map"></a>

### targetExposition.map() ⇒ <code>Object</code>
generates map of getters or/and setters for specified projection

<a name="TargetExposition+use"></a>

### targetExposition.use(plugin) ⇒ [<code>TargetExposition</code>](#TargetExposition)
look [Target.use(plugin)](#Target+use)


| Param |
| --- |
| plugin |

<a name="TargetExposition..dispatcher"></a>

### TargetExposition~dispatcher : <code>function</code>

| Param | Type | Description |
| --- | --- | --- |
| store | <code>Store</code> | `vuex` store |
| value | <code>\*</code> | changed value |
| key | <code>String</code> | key of changed field |
| target | <code>\*</code> | parent object of changed field |

<a name="take"></a>

## take(path) ⇒ [<code>Target</code>](#Target)
returns Target instance with specified path


| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | dotted path to target property of your component instance |

<a name="takeState"></a>

## takeState(namespace, path) ⇒ [<code>Target</code>](#Target)
returns Target instance with specified state path


| Param |
| --- |
| namespace |
| path |
