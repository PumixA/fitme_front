<template>
  <div>
    <h1>Exercices</h1>
    <div class="tabs">
      <button :class="{ active: activeTab === 'exercice' }" @click="activeTab = 'exercice'">Exercices</button>
      <button :class="{ active: activeTab === 'exerciceCustom' }" @click="activeTab = 'exerciceCustom'">Exercices Personnalisés</button>
    </div>
    <div class="tab-content">
      <component :is="activeTabComponent"></component>
    </div>
  </div>
</template>

<script>
import Exercice from '~/components/utilisateur/exercice.vue';
import ExerciceCustom from '~/components/utilisateur/exerciceCustom.vue';

export default {
  middleware: 'auth',
  data() {
    return {
      activeTab: 'exercice'
    }
  },
  computed: {
    activeTabComponent() {
      return this.activeTab === 'exercice' ? Exercice : ExerciceCustom;
    }
  }
}
</script>

<style scoped>
.tabs {
  display: flex;
  margin-bottom: 1em;
}

button {
  flex: 1;
  padding: 1em;
  cursor: pointer;
  background: #f4f4f4;
  border: 1px solid #ddd;
  text-align: center;
}

button.active {
  background: #ddd;
  font-weight: bold;
}

.tab-content {
  padding: 1em;
  border: 1px solid #ddd;
}
</style>
