# vuex-dot [![tests](https://travis-ci.org/yarsky-tgz/vuex-dot.svg?branch=master)](https://travis-ci.org/yarsky-tgz/vuex-dot) [![Coverage Status](https://coveralls.io/repos/github/yarsky-tgz/vuex-dot/badge.svg)](https://coveralls.io/github/yarsky-tgz/vuex-dot)

Vue computed properties getters and/or setters generator with ability to hook with callback
or field change to be dispatched via vuex action. 

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
* [take(path)](#take) => [<code>Target</code>](#Target)
* [Target](#Target)
    * [new Target(path)](#new_Target_new)
    * [.expose(projection)](#Target+expose) ⇒ [<code>TargetExposition</code>](#TargetExposition)
    * [.dispatch(action)](#Target+dispatch) ⇒ [<code>Target</code>](#Target)
    * [.hook(dispatcher)](#Target+hook) ⇒ [<code>Target</code>](#Target)
    * [.map(alias)](#Target+map) ⇒ <code>Object</code>
* [TargetExposition](#TargetExposition)
    * [new TargetExposition(target, projection)](#new_TargetExposition_new)
    * [.dispatch(action, sendTarget)](#TargetExposition+dispatch) ⇒ [<code>TargetExposition</code>](#TargetExposition)
    * [.hook(dispatcher, sendTarget)](#TargetExposition+hook) ⇒ [<code>TargetExposition</code>](#TargetExposition)
    * [.map()](#TargetExposition+map) ⇒ <code>Object</code>

<a name="Target"></a>

### take(path)
Creates new [<code>Target</code>](#Target) instance with given `path`

<a name="new_Target_new"></a>

### new Target(path)

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | dot-notation path to some property of your `vm` instance |

<a name="Target+expose"></a>

### target.expose(projection) ⇒ [<code>TargetExposition</code>](#TargetExposition)
Shall be used if you need to map into your computed properties some properties of object,
selected as target, also with ability to attach action dispatcher or hook callback on each property change.
Both `dispatch()` and `hook()` can provide also object mapped by Target instance to callee, while setting
second argument is true (more you can read at their documentation)

| Param | Type | Description |
| --- | --- | --- |
| projection | <code>array</code> | fields to be exposed |

<a name="Target+dispatch"></a>

### target.dispatch(action) ⇒ [<code>Target</code>](#Target)
set action to be dispatched on mapped property change
if sendTarget is undefined action shall be called in format:

dispatch(action, newValue);

| Param | Type | Description |
| --- | --- | --- |
| action | <code>string</code> | action name |

<a name="Target+hook"></a>

### target.hook(dispatcher) ⇒ [<code>Target</code>](#Target)
Set hook that should be run on mapped property change

| Param | Type |
| --- | --- |
| dispatcher | <code>function</code> |

<a name="Target+map"></a>

### target.map(alias) ⇒ <code>Object</code>
returns computed property map of getters or/and setters for specified projection
If alias is set it can be used with spread operator with provided alias as computed property name

| Param | Type | Description |
| --- | --- | --- |
| alias | <code>String</code> | name of computed field target to be accessible |

<a name="new_TargetExposition_new"></a>

### new TargetExposition(target, projection)

| Param | Type |
| --- | --- |
| target | <code>Target</code> |
| projection | <code>Array</code> |

<a name="TargetExposition+dispatch"></a>

### targetExposition.dispatch(action, sendTarget) ⇒ [<code>TargetExposition</code>](#TargetExposition)
set action to be dispatched on exposed field change
if sendTarget is undefined action shall be called in format:

dispatch(action, {[key_of_exposed_field]: value})

otherwise, if sendTarget is set to true

dispatch(action, { target, key, value})

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| action | <code>String</code> |  |  |
| sendTarget | <code>Boolean</code> | <code>false</code> | send target to action |

<a name="TargetExposition+hook"></a>

### targetExposition.hook(dispatcher, sendTarget) ⇒ [<code>TargetExposition</code>](#TargetExposition)
set dispatcher callback

| Param | Type |
| --- | --- |
| dispatcher | <code>function</code> |
| sendTarget | <code>Boolean</code> |

<a name="TargetExposition+map"></a>

### targetExposition.map() ⇒ <code>Object</code>
generates map of getters or/and setters for specified projection
