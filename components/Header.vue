<template>
  <div v-if="isAuthenticated">
    <header>
      <nav>
        <ul>
          <li><nuxt-link to="/utilisateur/dashboard">Dashboard</nuxt-link></li>
          <li><nuxt-link to="/utilisateur/exercices">Exercices</nuxt-link></li>
          <li><nuxt-link to="/utilisateur/profil">Profil</nuxt-link></li>
          <li><nuxt-link to="/utilisateur/seance">Séance</nuxt-link></li>
          <li><nuxt-link to="/utilisateur/statistiques">Statistiques</nuxt-link></li>
          <li><button @click="logout">Logout</button></li>
        </ul>
      </nav>
    </header>
  </div>
</template>

<script>
export default {
  computed: {
    isAuthenticated () {
      return !!this.$store.state.token;
    }
  },
  methods: {
    logout () {
      this.$store.dispatch('logout');
      this.$router.push('/login');
    }
  }
}
</script>

<style scoped>
header {
  background: #333;
  color: white;
  padding: 1em;
}

nav ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 1em;
}

nav a {
  color: white;
  text-decoration: none;
}

button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}
</style>
