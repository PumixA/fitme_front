<template>
  <div class="utilisateurs-page">
    <h2>Gestion des Utilisateurs</h2>
    <div class="tabs">
      <button @click="setActiveTab('actif')" :class="{ active: activeTab === 'actif' }">Actifs</button>
      <button @click="setActiveTab('banni')" :class="{ active: activeTab === 'banni' }">Bannis</button>
    </div>
    <div class="content">
      <component :is="activeTabComponent"></component>
    </div>
  </div>
</template>

<script>
import Actif from '~/components/admin/Actif.vue'
import Banni from '~/components/admin/Banni.vue'

export default {
  components: {
    Actif,
    Banni
  },
  data() {
    return {
      activeTab: 'actif'
    }
  },
  computed: {
    activeTabComponent() {
      return this.activeTab === 'actif' ? 'Actif' : 'Banni'
    }
  },
  methods: {
    setActiveTab(tab) {
      this.activeTab = tab
    }
  },
  layout: 'admin',
  middleware: 'auth'
}
</script>

<style scoped>
.utilisateurs-page {
  /* Styles spécifiques pour la page Utilisateurs */
}

.tabs {
  display: flex;
  gap: 1em;
  margin-bottom: 1em;
}

.tabs button {
  padding: 0.5em 1em;
  cursor: pointer;
  background-color: #f4f4f4;
  border: none;
  border-radius: 4px;
}

.tabs button.active {
  background-color: #1abc9c;
  color: white;
}

.content {
  /* Styles pour le contenu des tabs */
}
</style>
