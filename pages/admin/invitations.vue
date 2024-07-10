<template>
  <div class="invitations-page">
    <h1>Gestion des Invitations</h1>
    <div class="tabs">
      <button @click="activeTab = 'invitations'" :class="{ active: activeTab === 'invitations' }">Invitations</button>
      <button @click="activeTab = 'demandes'" :class="{ active: activeTab === 'demandes' }">Demandes</button>
    </div>
    <div class="content">
      <component :is="activeTab"></component>
    </div>
  </div>
</template>

<script>
import InvitationsTab from '~/components/admin/InvitationsTab.vue'
import DemandesTab from '~/components/admin/DemandesTab.vue'

export default {
  layout: 'admin',
  data () {
    return {
      activeTab: 'invitations'
    }
  },
  components: {
    invitations: InvitationsTab,
    demandes: DemandesTab
  }
}
</script>

<style scoped>
.invitations-page {
  padding: 2em;
}

.tabs {
  display: flex;
  gap: 1em;
}

.tabs button {
  padding: 0.5em 1em;
  background-color: #f4f4f4;
  border: none;
  cursor: pointer;
}

.tabs button.active {
  border-bottom: 2px solid #333;
  font-weight: bold;
}

.content {
  margin-top: 2em;
}
</style>
