<template>
  <div>
    <div class="tabs">
      <p :class="{ active: activeTab === 'exerciceCustom' }" @click="activeTab = 'exerciceCustom'">Exercices Personnalisés</p>
      <p :class="{ active: activeTab === 'exercice' }" @click="activeTab = 'exercice'">Exercices</p>
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
      activeTab: 'exerciceCustom'
    }
  },
  computed: {
    activeTabComponent() {
      return this.activeTab === 'exerciceCustom' ? ExerciceCustom : Exercice;
    }
  }
}
</script>

<style scoped>
.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  gap: 20px;
}

p {
  cursor: pointer;
  background: transparent;
  border: none;
  text-align: center;
  font-family: var(--policeTitre);
  font-size: var(--tailleSousTitre);
  color: var(--couleurAccent-2);
}

p.active {
  text-decoration: underline;
  color: var(--couleurPrincipale-1);
}
</style>
