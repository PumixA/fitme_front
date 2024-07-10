<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <nav>
        <ul>
          <li :class="{ active: isActive('/admin/adminDashboard') }"><nuxt-link to="/admin/adminDashboard">Dashboard</nuxt-link></li>
          <li :class="{ active: isActive('/admin/demandesInvitations') }"><nuxt-link to="/admin/demandesInvitations">Demandes Invitations</nuxt-link></li>
          <li :class="{ active: isActive('/admin/exercices') }"><nuxt-link to="/admin/exercices">Exercices</nuxt-link></li>
          <li :class="{ active: isActive('/admin/groupeMusculaire') }"><nuxt-link to="/admin/groupeMusculaire">Groupes Musculaires</nuxt-link></li>
          <li :class="{ active: isActive('/admin/invitations') }"><nuxt-link to="/admin/invitations">Invitations</nuxt-link></li>
          <li :class="{ active: isActive('/admin/utilisateurs') }"><nuxt-link to="/admin/utilisateurs">Utilisateurs</nuxt-link></li>
          <li><button @click="logout">Logout</button></li>
        </ul>
      </nav>
    </aside>
    <main>
      <nuxt />
    </main>
  </div>
</template>

<script>
export default {
  methods: {
    logout() {
      this.$store.dispatch('logout');
      this.$router.push('/login');
    },
    isActive(path) {
      return this.$route.path === path;
    }
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
}

.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  padding: 1em;
  height: 100vh;
}

.sidebar nav ul {
  list-style: none;
  padding: 0;
}

.sidebar nav ul li {
  margin: 1em 0;
}

.sidebar nav ul li a,
.sidebar nav ul li button {
  color: white;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  padding: 0.5em 0;
}

.sidebar nav ul li.active a {
  background-color: #1abc9c;
  border-radius: 4px;
}

.sidebar nav ul li button:hover,
.sidebar nav ul li a:hover {
  text-decoration: underline;
}
</style>
