<template>
  <div>
    <Header />
    <Nuxt />
    <SeanceButton v-if="isUtilisateurPage" />
  </div>
</template>

<script>
import Header from '~/components/Header.vue';
import SeanceButton from '~/components/utilisateur/SeanceButton.vue';

export default {
  components: {
    Header,
    SeanceButton
  },
  computed: {
    isUtilisateurPage () {
      return this.$route.path.startsWith('/utilisateur/');
    }
  },
  created () {
    console.log('Default layout loaded');
  },
  mounted () {
    // Vérifiez régulièrement l'expiration du token
    this.interval = setInterval(() => {
      const tokenExpiration = this.$store.state.tokenExpiration;
      if (tokenExpiration && Date.now() > tokenExpiration) {
        this.$store.dispatch('logout');
        this.$router.push('/login');
      }
    }, 1000); // Vérifiez toutes les secondes
  },
  beforeDestroy () {
    clearInterval(this.interval);
  }
}
</script>

<style>
/* Add some global styling if needed */
</style>
