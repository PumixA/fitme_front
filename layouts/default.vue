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
    isUtilisateurPage() {
      // Vérifiez si le chemin commence par /utilisateur/
      return this.$route.path.startsWith('/utilisateur/');
    }
  }
}
</script>

<style>
/* Add some global styling if needed */
</style>
