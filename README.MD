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
      ...take('$store.state.wizard.step')
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
      ...take('$store.state.wizard.step')
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
      ...take('$store.state.user')
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
      ...take('$store.state.user')
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