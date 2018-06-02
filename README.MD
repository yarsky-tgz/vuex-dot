# vuex-dot

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
      ...take('$store.target.wizard.step')
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
      ...take('$store.target.wizard.step')
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
      ...take('$store.target.user')
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
      ...take('$store.target.user')
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

* [take(path)](#take) ⇒ [<code>Target</code>](#Target)
* [Target](#Target)
    * [new Target(path)](#new_Target_new)
    * [.expose(projection)](#Target+expose) ⇒ [<code>Target</code>](#Target)
    * [.dispatch(action, sendTarget)](#Target+dispatch) ⇒ [<code>Target</code>](#Target)
    * [.hook(dispatcher, sendTarget)](#Target+hook) ⇒ [<code>Target</code>](#Target)
    * [.map(alias)](#Target+map) ⇒ <code>\*</code>
    

<a name="take"></a>
## take(path) ⇒ <code>Target</code>
returns Target instance with specified path

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | dotted path to target property of your component instance |


<a name="new_Target_new"></a>

### new Target(path)
Target constructor


| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | property path |

<a name="Target+expose"></a>

### target.expose(projection) ⇒ [<code>Target</code>](#Target)
Expose target fields into result map.
Target shall not be present at the result map if non-empty array passed

**Kind**: instance method of [<code>Target</code>](#Target)

| Param | Type | Description |
| --- | --- | --- |
| projection | <code>array</code> | fields to be exposed |

<a name="Target+dispatch"></a>

### target.dispatch(action, sendTarget) ⇒ [<code>Target</code>](#Target)
Setting value to target or any of exposed fields shall dispatch specified action on store.
For not exposed target on value change it should run:
dispatch(action, newValue);
For exposed field:
dispatch(action, {[fieldName]: newValue});
For exposed field, if sendTarget set to true:
dispatch(action, { key, value, target });

**Kind**: instance method of [<code>Target</code>](#Target)

| Param | Type | Description |
| --- | --- | --- |
| action | <code>string</code> | action name |
| sendTarget | <code>boolean</code> | append target instance to action payload |

<a name="Target+hook"></a>

### target.hook(dispatcher, sendTarget) ⇒ [<code>Target</code>](#Target)
Set hook that should be run on value change

**Kind**: instance method of [<code>Target</code>](#Target)

| Param | Type |
| --- | --- |
| dispatcher | <code>function</code> |
| sendTarget | <code>boolean</code> |

<a name="Target+map"></a>

### target.map(alias) ⇒ <code>\*</code>
Creates result object construction compatible with computed property of vm

**Kind**: instance method of [<code>Target</code>](#Target)

| Param | Type |
| --- | --- |
| alias | <code>string</code> |

