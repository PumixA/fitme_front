<template>
  <div v-if="isAuthenticated">
    <header>
      <nuxt-link class="linkDashboard" to="/utilisateur/dashboard" exact-active-class="active"><fa :icon="['fas', 'house']" /></nuxt-link>
      <ul>
        <li>
          <nuxt-link
            to="/utilisateur/seance"
            :class="{ active: isSeanceActive }"
          >
            Séance
          </nuxt-link>
        </li>
        <li><nuxt-link to="/utilisateur/exercices" exact-active-class="active">Exercices</nuxt-link></li>
        <li><nuxt-link to="/utilisateur/statistiques" exact-active-class="active">Statistiques</nuxt-link></li>
        <li><nuxt-link to="/utilisateur/profil" exact-active-class="active">Profil</nuxt-link></li>
      </ul>
      <button @click="logout"><fa :icon="['fas', 'right-from-bracket']" /></button>
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
  margin: 20px 20px 40px;
  background: var(--couleurPrincipale-2);
  color: white;
  padding: 10px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 30px;
  margin: 0;
}

a {
  color: var(--couleurSecondaire-1);
  text-decoration: none;
  font-family: var(--policeTitre);
  font-size: var(--tailleTitre);
  transition: all 0.5s;
}

.linkDashboard {
  color: var(--couleurSecondaire-2);
}

.active {
  color: var(--couleurSecondaire-2);
}

button {
  background: none;
  border: none;
  color: var(--couleurSecondaire-2);
  cursor: pointer;
  font-family: var(--policeTitre);
  font-size: var(--tailleTitre);
  transition: all 0.5s;
}

a:hover, button:hover {
  color: var(--couleurSecondaire-2);
}
</style>
