<template>
  <div v-if="isAuthenticated">
    <header>
      <nav>
        <ul>
          <li><nuxt-link to="/utilisateur/dashboard" exact-active-class="active">Dashboard</nuxt-link></li>
          <li><nuxt-link to="/utilisateur/exercices" exact-active-class="active">Exercices</nuxt-link></li>
          <li><nuxt-link to="/utilisateur/profil" exact-active-class="active">Profil</nuxt-link></li>
          <li>
            <nuxt-link
              to="/utilisateur/seance"
              :class="{ active: isSeanceActive }"
            >
              Séance
            </nuxt-link>
          </li>
          <li><nuxt-link to="/utilisateur/statistiques" exact-active-class="active">Statistiques</nuxt-link></li>
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
    },
    isSeanceActive() {
      return this.$route.path.startsWith('/utilisateur/seance') || this.$route.path.startsWith('/utilisateur/gestionSeance');
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
  border-radius: 50px;
  margin: 20px;
  background: #333;
  color: white;
  padding: 10px;
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

nav .active {
  color: #1abc9c; /* Changez cette couleur selon vos besoins */
}

button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}
</style>
