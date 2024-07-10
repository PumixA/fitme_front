<template>
  <div class="admin-dashboard">
    <h1>Admin Dashboard</h1>
    <div class="stats">
      <div class="stat-block">
        <h2>Nombres d'utilisateurs</h2>
        <p v-if="userCount !== null">{{ userCount }}</p>
        <p v-else>Loading...</p>
      </div>
      <!-- Ajoutez d'autres blocs de statistiques ici si nécessaire -->
    </div>
  </div>
</template>

<script>
export default {
  layout: 'admin',
  data() {
    return {
      userCount: null,
      error: null,
    }
  },
  async fetch() {
    try {
      const response = await this.$axios.get('/admin/users/count');
      this.userCount = response.data.count;
    } catch (error) {
      console.error('Error fetching user count:', error);
      this.error = 'Erreur lors de la récupération du nombre d\'utilisateurs';
    }
  },
  middleware: 'auth'
}
</script>

<style scoped>
.admin-dashboard {
  padding: 2em;
}

.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 2em;
}

.stat-block {
  background-color: #f4f4f4;
  border-radius: 8px;
  padding: 1em;
  width: 200px;
  text-align: center;
}

.stat-block h2 {
  font-size: 1.2em;
  margin-bottom: 0.5em;
}

.stat-block p {
  font-size: 1.5em;
  margin: 0;
}
</style>
