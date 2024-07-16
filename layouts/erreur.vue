<template>
  <div class="erreur-layout">
    <Header v-if="isUtilisateurPage && !isBanni" />
    <div v-else-if="isAdminPage && !isBanni" class="admin-layout">
      <aside class="sidebar">
        <nav>
          <ul>
            <li><nuxt-link to="/admin/adminDashboard">Dashboard</nuxt-link></li>
            <li><nuxt-link to="/admin/exercices">Exercices</nuxt-link></li>
            <li><nuxt-link to="/admin/groupeMusculaire">Groupes Musculaires</nuxt-link></li>
            <li><nuxt-link to="/admin/invitations">Invitations</nuxt-link></li>
            <li><nuxt-link to="/admin/utilisateurs">Utilisateurs</nuxt-link></li>
            <li><button @click="logout">Logout</button></li>
          </ul>
        </nav>
      </aside>
      <main class="content">
        <Nuxt />
      </main>
    </div>
    <div class="content centered">
      <Nuxt />
    </div>
  </div>
</template>

<script>
import Header from '~/components/Header.vue';

export default {
  components: {
    Header
  },
  created() {
    console.log('Erreur layout loaded');
  },
  computed: {
    isUtilisateurPage() {
      const token = this.$store.state.token;
      if (token) {
        const decodedToken = this.parseJwt(token);
        console.log('Decoded JWT for utilisateur:', decodedToken);
        return decodedToken.role === 'utilisateur';
      }
      return false;
    },
    isAdminPage() {
      const token = this.$store.state.token;
      if (token) {
        const decodedToken = this.parseJwt(token);
        console.log('Decoded JWT for admin:', decodedToken);
        return decodedToken.role === 'admin';
      }
      return false;
    },
    isBanni() {
      const token = this.$store.state.token;
      if (token) {
        const decodedToken = this.parseJwt(token);
        console.log('Decoded JWT for banni:', decodedToken);
        return decodedToken.role === 'banni';
      }
      return false;
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('logout');
      this.$router.push('/login');
    },
    parseJwt(token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(Buffer.from(base64, 'base64').toString('binary').split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const decoded = JSON.parse(jsonPayload);
      console.log('Decoded JWT:', decoded);
      return decoded;
    }
  }
}
</script>

<style scoped>
.erreur-layout {
  display: flex;
  width: 100%;
  flex-direction: column;
}

.admin-layout {
  display: flex;
  width: 100%;
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

.content {
  flex: 1;
  padding: 1em;
}

.centered {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  min-height: 100vh;
}
</style>
