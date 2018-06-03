# vuex-dot [![tests](https://travis-ci.org/yarsky-tgz/vuex-dot.svg?branch=master)](https://travis-ci.org/yarsky-tgz/vuex-dot) [![Coverage Status](https://coveralls.io/repos/github/yarsky-tgz/vuex-dot/badge.svg)](https://coveralls.io/github/yarsky-tgz/vuex-dot)

Vue computed properties getters and/or setters generator with ability to hook each 
property change and execute callback or even dispatch vuex action.

There are some other packages on github - 
[vuex-map-fields](https://github.com/maoberlehner/vuex-map-fields) and
[vuex-bound](https://github.com/Vanilla-IceCream/vuex-bound) for example, but after reading their docs and sources 
I've decided to create own package from scratch with such benefits
 * **leightweight** 
 * **flexible** - actions dispatching and hooks done in simple and flexible way, giving you ability 
 to inject any logic into setters within your component
 * **simple** - you need to import only one helper method into your code, 
 which provides easy for understanding short set of chainable methods for configuring.
 * **good design** no weird logic ("core" mutations, actions, etc) shall be injected 
 into your vuex store, no additional setup of `vuex` or `vm` needed, tool just generates getters 
 and setters, which are done with performance on mind.
 * **dot notation** with usage of very fast and well tested library [get-value](https://github.com/jonschlinkert/get-value)
 * **stable** full tests coverage

## Installation

```bash
npm i vuex-dot
```

## Usage

#### Simple alias create
```vue
<template>
  <div>{{step}}</div>
</template>

<script>
  import take from 'vuex-dot';
  
  export default {
    computed: {
      ...take('$store.state.target.wizard.step')
        .map('step')
    }
  }
</script>
```

#### Simple alias two way binding
```vue
<template>
  <button @click.stop="step++">next</button>
</template>

<script>
  import take from 'vuex-dot';

  export default {
    computed: {
      ...take('$store.state.target.wizard.step')
        .dispatch('setWizardStep')
        .map('step')
    }
  }
</script>
```

#### Exposed target two way binding

```vue
<template>
  <form>
    <input v-model="name"/>
    <input v-model="email"/>
  </form>
</template>

<script>
  import take from 'vuex-dot';

  export default {
    computed: {
      ...take('$store.state.target.user')
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
  import take from 'vuex-dot';
  import validate from 'validate';
  const constraints = {name: {presence: true}}; 

  export default {
    computed: {
      ...take('$store.state.target.user')
        .expose(['name', 'email'])
        .hook(({ dispatch }, value, key) => {
          if(validate.single(value, constraints[key])) {
            dispatch('userEditAction', {[key]: value});
          }
        })
        .map()
    }
  }
</script>
```

## API reference
* [take(path)](#take) => [<code>Target</code>](#new_Target_new)
* [Target](#new_Target_new)
    * [new Target(path)](#new_Target_new)
    * [.dispatch(action)](#Target+dispatch) ⇒ [<code>Target</code>](#Target)
    * [.hook(dispatcher)](#Target+hook) ⇒ [<code>Target</code>](#Target)
    * [.map(alias)](#Target+map) ⇒ <code>Object</code>
    * [.expose(projection)](#Target+expose) ⇒ [<code>TargetExposition</code>](#TargetExposition)
    * [~dispatcher](#Target..dispatcher) : <code>function</code>
* [TargetExposition](#TargetExposition)
    * [new TargetExposition(target, projection)](#new_TargetExposition_new)
    * [.dispatch(action, sendTarget)](#TargetExposition+dispatch) ⇒ [<code>TargetExposition</code>](#TargetExposition)
    * [.hook(dispatcher, sendTarget)](#TargetExposition+hook) ⇒ [<code>TargetExposition</code>](#TargetExposition)
    * [.map()](#TargetExposition+map) ⇒ <code>Object</code>
    * [~dispatcher](#TargetExposition..dispatcher) : <code>function</code>

<a name="take"></a>

### take(path)
Creates new [<code>Target</code>](#Target) instance with given `path`

<a name="new_Target_new"></a>

### new Target(path)

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | dot-notation path to some property of your vm instance |

<a name="Target+dispatch"></a>

### target.dispatch(action) ⇒ [<code>Target</code>](#Target)
In fact that's syntax sugar for `hook()` method.
Sets `action` to be dispatched on mapped property change
`action` shall be called in format:

`dispatch(action, newValue)`


| Param | Type | Description |
| --- | --- | --- |
| action | <code>string</code> | action name |

<a name="Target+hook"></a>

### target.hook(dispatcher) ⇒ [<code>Target</code>](#Target)
Set hook that should be run on mapped property change.
Hook shall be run with such arguments


| Param | Type |
| --- | --- |
| dispatcher | [<code>dispatcher</code>](#Target..dispatcher) |

<a name="Target+map"></a>

### target.map(alias) ⇒ <code>\*</code>
returns computed property map of getters or/and setters for specified projection
If alias is set it can be used with spread operator setting provided alias as computed property name


| Param | Type | Description |
| --- | --- | --- |
| alias | <code>String</code> | name of computed field target to be accessible |

<a name="Target..dispatcher"></a>

### Target~dispatcher : <code>function</code>

| Param | Type | Description |
| --- | --- | --- |
| store | <code>Store</code> | `vuex` store |
| value | <code>mixed</code> |  |

<a name="Target+expose"></a>

### target.expose(projection) ⇒ <code>TargetExposition</code>
Shall be used if you need to map into your computed properties some properties of object,
selected as target, also with ability to attach action dispatcher or hook callback on each property change.
Both `dispatch()` and `hook()` can provide also object mapped by Target instance to callee, while setting
second argument is true (more you can read at their documentation)


| Param | Type | Description |
| --- | --- | --- |
| projection | <code>array</code> | fields to be exposed |


<a name="new_TargetExposition_new"></a>

### new TargetExposition(target, projection)

| Param | Type |
| --- | --- |
| target | <code>Target</code> |
| projection | <code>Array</code> |

<a name="TargetExposition+dispatch"></a>

### targetExposition.dispatch(action, sendTarget) ⇒ [<code>TargetExposition</code>](#TargetExposition)
set `action` to be dispatched on exposed field change
if `sendTarget` is `false` `action` shall be called in format:

`dispatch(action, {[key_of_exposed_field]: value})`

otherwise, if `sendTarget` is set to `true`

`dispatch(action, { target, key, value})`


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| action | <code>String</code> |  |  |
| sendTarget | <code>Boolean</code> | <code>false</code> | send target to action |

<a name="TargetExposition+hook"></a>

### targetExposition.hook(dispatcher, sendTarget) ⇒ [<code>TargetExposition</code>](#TargetExposition)
set dispatcher callback


| Param | Type |
| --- | --- |
| dispatcher | [<code>dispatcher</code>](#TargetExposition..dispatcher) |
| sendTarget | <code>Boolean</code> |

<a name="TargetExposition+map"></a>

### targetExposition.map() ⇒ <code>Object</code>
generates map of getters or/and setters for specified projection

<a name="TargetExposition..dispatcher"></a>

### TargetExposition~dispatcher : <code>function</code>

| Param | Type | Description |
| --- | --- | --- |
| store | <code>Store</code> | `vuex` store |
| value | <code>\*</code> | changed value |
| key | <code>String</code> | key of changed field |
| target | <code>\*</code> | parent object of changed field |
